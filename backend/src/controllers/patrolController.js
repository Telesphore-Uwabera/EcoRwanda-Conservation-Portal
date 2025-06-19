const Patrol = require('../models/Patrol');
const { authenticateToken } = require('../middleware/auth');

// Get all patrols
exports.getPatrols = async (req, res) => {
  try {
    // Return all patrols regardless of user
    const patrolsRaw = await Patrol.find({})
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

// Utility: Update patrol statuses based on time
async function autoUpdatePatrolStatuses() {
  const now = new Date();
  const patrols = await Patrol.find({ status: { $in: ["scheduled", "in_progress"] } });
  for (const patrol of patrols) {
    const patrolStart = new Date(patrol.patrolDate + 'T' + (patrol.startTime || '00:00'));
    const durationHours = Number(patrol.estimatedDuration) || 0;
    const patrolEnd = new Date(patrolStart.getTime() + durationHours * 60 * 60 * 1000);
    if (patrol.status === "scheduled" && now >= patrolStart && now < patrolEnd) {
      patrol.status = "in_progress";
      await patrol.save();
    } else if ((patrol.status === "scheduled" || patrol.status === "in_progress") && now >= patrolEnd) {
      patrol.status = "completed";
      await patrol.save();
    }
  }
}

// Get patrol stats for dashboard
exports.getPatrolStats = async (req, res) => {
  try {
    await autoUpdatePatrolStatuses();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allPatrols = await Patrol.find({});
    const validPatrols = allPatrols.filter(p => {
      try {
        return p.patrolDate && !isNaN(new Date(p.patrolDate).getTime());
      } catch {
        return false;
      }
    });
    const totalCompleted = validPatrols.filter(p => p.status === 'completed').length;
    const activePatrols = validPatrols.filter(p => ['in_progress', 'scheduled'].includes(p.status)).length;
    const completedToday = validPatrols.filter(p => p.status === 'completed' && new Date(p.patrolDate).toDateString() === today.toDateString()).length;
    const totalPatrols = totalCompleted + activePatrols;
    res.json({
      totalPatrols,
      completedToday,
      activePatrols,
      patrolsCompleted: totalCompleted
    });
  } catch (error) {
    console.error('Error in getPatrolStats:', error);
    res.status(500).json({ message: 'Error fetching patrol stats', error: error.message });
  }
};

// Export patrols as JSON
exports.exportPatrols = async (req, res) => {
  try {
    const patrols = await Patrol.find({});
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=patrols.json');
    res.send(JSON.stringify(patrols, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Error exporting patrols' });
  }
}; 