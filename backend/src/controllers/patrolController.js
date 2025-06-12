const Patrol = require('../models/Patrol');
const { authenticateToken } = require('../middleware/auth');

// Get all patrols
exports.getPatrols = async (req, res) => {
  try {
    const patrols = await Patrol.find()
      .populate('ranger', 'firstName lastName email')
      .sort({ patrolDate: -1 });
    res.json({ patrols });
  } catch (error) {
    console.error('Error fetching patrols:', error);
    res.status(500).json({ message: 'Error fetching patrols' });
  }
};

// Create a new patrol
exports.createPatrol = async (req, res) => {
  try {
    const {
      route,
      patrolDate,
      startTime,
      estimatedDuration,
      priority,
      objectives,
      equipment,
      notes,
      status
    } = req.body;

    // Validate required fields
    if (!route || !patrolDate || !startTime || !estimatedDuration || !priority || !objectives || !equipment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new patrol
    const patrol = new Patrol({
      route,
      patrolDate,
      startTime,
      estimatedDuration,
      priority,
      objectives,
      equipment,
      notes,
      status,
      ranger: req.user._id // Set the ranger to the authenticated user
    });

    await patrol.save();

    // Populate ranger info before sending response
    await patrol.populate('ranger', 'firstName lastName email');

    res.status(201).json({
      message: 'Patrol created successfully',
      patrol
    });
  } catch (error) {
    console.error('Error creating patrol:', error);
    res.status(500).json({ message: 'Error creating patrol' });
  }
};

// Update patrol status
exports.updatePatrolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const patrol = await Patrol.findById(id);
    if (!patrol) {
      return res.status(404).json({ message: 'Patrol not found' });
    }

    // Only allow the ranger who created the patrol to update its status
    if (patrol.ranger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this patrol' });
    }

    patrol.status = status;
    await patrol.save();

    res.json({
      message: 'Patrol status updated successfully',
      patrol
    });
  } catch (error) {
    console.error('Error updating patrol status:', error);
    res.status(500).json({ message: 'Error updating patrol status' });
  }
};

// Add findings to a patrol
exports.addFindings = async (req, res) => {
  try {
    const { id } = req.params;
    const { findings } = req.body;

    if (!findings) {
      return res.status(400).json({ message: 'Findings are required' });
    }

    const patrol = await Patrol.findById(id);
    if (!patrol) {
      return res.status(404).json({ message: 'Patrol not found' });
    }

    // Only allow the ranger who created the patrol to add findings
    if (patrol.ranger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this patrol' });
    }

    patrol.findings = findings;
    await patrol.save();

    res.json({
      message: 'Findings added successfully',
      patrol
    });
  } catch (error) {
    console.error('Error adding findings:', error);
    res.status(500).json({ message: 'Error adding findings' });
  }
}; 