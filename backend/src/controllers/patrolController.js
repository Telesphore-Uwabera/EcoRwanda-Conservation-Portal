const Patrol = require('../models/Patrol');
const { authenticateToken } = require('../middleware/auth');

// Get all patrols
exports.getPatrols = async (req, res) => {
  try {
    // Only return patrols for the logged-in user
    const userId = req.user._id || req.user.id;
    const patrolsRaw = await Patrol.find({ ranger: userId })
      .populate('ranger', 'firstName lastName email')
      .sort({ patrolDate: -1 });
    
    const patrols = patrolsRaw.map(patrol => ({
      id: patrol._id.toString(),
      route: patrol.route,
      status: patrol.status,
      duration: patrol.duration ? patrol.duration.toString() : '',
      findings: patrol.findings || '',
      ranger: patrol.ranger && patrol.ranger.firstName ? {
        _id: patrol.ranger._id?.toString?.() || '',
        firstName: patrol.ranger.firstName || '',
        lastName: patrol.ranger.lastName || '',
        email: patrol.ranger.email || '',
      } : {},
      patrolDate: patrol.patrolDate
        ? (typeof patrol.patrolDate === 'number'
            ? new Date(patrol.patrolDate).toISOString()
            : new Date(patrol.patrolDate).toISOString())
        : '',
      startTime: patrol.startTime || '',
      endTime: patrol.endTime || '',
      estimatedDuration: patrol.estimatedDuration !== undefined ? patrol.estimatedDuration.toString() : '',
      priority: patrol.priority || '',
      objectives: patrol.objectives || [],
      equipment: patrol.equipment || [],
      notes: patrol.notes || '',
      createdAt: patrol.createdAt
        ? (typeof patrol.createdAt === 'number'
            ? new Date(patrol.createdAt).toISOString()
            : new Date(patrol.createdAt).toISOString())
        : '',
    }));
    
    res.status(200).json({
      success: true,
      patrols
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new patrol
exports.createPatrol = async (req, res) => {
  try {
    console.log('req.user in createPatrol:', req.user);
    const patrolData = {
      ...req.body,
      ranger: req.user._id // Get ranger ID from authenticated user
    };
    
    const patrol = new Patrol(patrolData);
    await patrol.save();
    
    res.status(201).json({
      success: true,
      data: patrol
    });
  } catch (error) {
    console.error('Error creating patrol:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single patrol
exports.getPatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOne({
      _id: req.params.id,
      ranger: req.user._id
    });

    if (!patrol) {
      return res.status(404).json({
        success: false,
        error: 'Patrol not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patrol
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update patrol
exports.updatePatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOneAndUpdate(
      { _id: req.params.id, ranger: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patrol) {
      return res.status(404).json({
        success: false,
        error: 'Patrol not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patrol
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete patrol
exports.deletePatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOneAndDelete({
      _id: req.params.id,
      ranger: req.user._id
    });

    if (!patrol) {
      return res.status(404).json({
        success: false,
        error: 'Patrol not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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

// Get patrol stats for dashboard
exports.getPatrolStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Defensive: Only count patrols for this user
    const allPatrols = await Patrol.find({ ranger: req.user._id || req.user.id });
    const validPatrols = allPatrols.filter(p => {
      try {
        return p.patrolDate && !isNaN(new Date(p.patrolDate).getTime());
      } catch {
        return false;
      }
    });
    const invalidPatrols = allPatrols.filter(p => !p.patrolDate || isNaN(new Date(p.patrolDate).getTime()));
    if (invalidPatrols.length > 0) {
      console.error('Invalid patrolDate found in patrols:', invalidPatrols.map(p => ({ id: p._id, patrolDate: p.patrolDate })));
    }

    const totalPatrols = validPatrols.length;
    const completedToday = validPatrols.filter(p => p.status === 'completed' && new Date(p.patrolDate) >= today).length;
    const activePatrols = validPatrols.filter(p => ['in_progress', 'scheduled'].includes(p.status)).length;
    const patrolsCompleted = validPatrols.filter(p => p.status === 'completed').length;

    res.json({
      totalPatrols,
      completedToday,
      activePatrols,
      patrolsCompleted
    });
  } catch (error) {
    console.error('Error in getPatrolStats:', error);
    res.status(500).json({ message: 'Error fetching patrol stats', error: error.message });
  }
};

// Export patrols as JSON
exports.exportPatrols = async (req, res) => {
  try {
    const userId = req.user._id;
    const patrols = await Patrol.find({ ranger: userId });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=patrols.json');
    res.send(JSON.stringify(patrols, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Error exporting patrols' });
  }
}; 