const ProtectedArea = require('../models/ProtectedArea');
const { validateObjectId } = require('../utils/validation');

// Create a new protected area
exports.createProtectedArea = async (req, res) => {
  try {
    const protectedArea = new ProtectedArea({
      ...req.body,
      'location.coordinates': [req.body.location.longitude, req.body.location.latitude],
    });

    await protectedArea.save();
    res.status(201).json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all protected areas
exports.getAllProtectedAreas = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const protectedAreas = await ProtectedArea.find(query)
      .populate('management.organization', 'name')
      .populate('management.staff.user', 'name email')
      .populate('activities.responsiblePerson', 'name email')
      .populate('resources.uploadedBy', 'name email')
      .populate('monitoring.conductedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(protectedAreas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get protected areas within a radius
exports.getProtectedAreasNearby = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    const maxDistance = radius || 10000; // Default 10km radius

    const protectedAreas = await ProtectedArea.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate('management.organization', 'name')
      .populate('management.staff.user', 'name email');

    res.json(protectedAreas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single protected area
exports.getProtectedArea = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id)
      .populate('management.organization', 'name')
      .populate('management.staff.user', 'name email')
      .populate('activities.responsiblePerson', 'name email')
      .populate('resources.uploadedBy', 'name email')
      .populate('monitoring.conductedBy', 'name email');

    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    res.json(protectedArea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a protected area
exports.updateProtectedArea = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this protected area' });
    }

    if (req.body.location) {
      req.body['location.coordinates'] = [
        req.body.location.longitude,
        req.body.location.latitude,
      ];
    }

    const updatedProtectedArea = await ProtectedArea.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('management.organization', 'name')
      .populate('management.staff.user', 'name email')
      .populate('activities.responsiblePerson', 'name email')
      .populate('resources.uploadedBy', 'name email')
      .populate('monitoring.conductedBy', 'name email');

    res.json(updatedProtectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a protected area
exports.deleteProtectedArea = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this protected area' });
    }

    await protectedArea.remove();
    res.json({ message: 'Protected area deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add staff member
exports.addStaffMember = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const { userId, role } = req.body;
    if (!validateObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to add staff members' });
    }

    // Check if user is already a staff member
    const isAlreadyStaff = protectedArea.management.staff.some(
      (member) => member.user.toString() === userId
    );

    if (isAlreadyStaff) {
      return res.status(400).json({ message: 'User is already a staff member' });
    }

    protectedArea.management.staff.push({
      user: userId,
      role,
      startDate: new Date(),
    });

    await protectedArea.save();
    res.json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove staff member
exports.removeStaffMember = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const { userId } = req.params;
    if (!validateObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to remove staff members' });
    }

    protectedArea.management.staff = protectedArea.management.staff.filter(
      (member) => member.user.toString() !== userId
    );

    await protectedArea.save();
    res.json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add activity
exports.addActivity = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to add activities' });
    }

    protectedArea.activities.push({
      ...req.body,
      responsiblePerson: req.user._id,
    });

    await protectedArea.save();
    res.json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add threat
exports.addThreat = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to add threats' });
    }

    protectedArea.threats.push(req.body);
    await protectedArea.save();
    res.json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add monitoring data
exports.addMonitoringData = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid protected area ID' });
    }

    const protectedArea = await ProtectedArea.findById(req.params.id);
    if (!protectedArea) {
      return res.status(404).json({ message: 'Protected area not found' });
    }

    // Check if user is from the managing organization or has admin role
    if (
      protectedArea.management.organization.toString() !== req.user.organization.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to add monitoring data' });
    }

    protectedArea.monitoring.push({
      ...req.body,
      conductedBy: req.user._id,
    });

    await protectedArea.save();
    res.json(protectedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 