const mongoose = require('mongoose');
const Patrol = require('../models/Patrol');

// --- Centralized Helper Functions ---

// This function should be the single source of truth for status updates.
const autoUpdatePatrolStatuses = async (userId) => {
  if (!userId) {
    console.error("autoUpdatePatrolStatuses called without userId");
    return;
  }
  const now = new Date();
  const patrols = await Patrol.find({ 
    status: { $in: ["scheduled", "in_progress"] }, 
    ranger: new mongoose.Types.ObjectId(userId) 
  });
  
  for (const patrol of patrols) {
    try {
      const patrolStart = new Date(patrol.patrolDate);
      if (patrol.startTime && typeof patrol.startTime === 'string') {
        const [hours, minutes] = patrol.startTime.split(':').map(Number);
        patrolStart.setHours(hours, minutes, 0, 0);
      }
      
      const durationHours = Number(patrol.estimatedDuration) || 0;
      const patrolEnd = new Date(patrolStart.getTime() + durationHours * 60 * 60 * 1000);
      
      let changed = false;
      if (patrol.status === "scheduled" && now >= patrolStart && now < patrolEnd) {
        patrol.status = "in_progress";
        changed = true;
      } else if ((patrol.status === "scheduled" || patrol.status === "in_progress") && now >= patrolEnd) {
        patrol.status = "completed";
        patrol.endTime = now;
        const actualDuration = (patrol.endTime - patrolStart) / (1000 * 60 * 60);
        patrol.actualDuration = Math.round(actualDuration * 100) / 100;
        changed = true;
      }

      if (changed) {
        await patrol.save();
      }
    } catch (error) {
      console.error(`Error updating patrol ${patrol._id}:`, error);
    }
  }
};

// Internal function to get stats, does not send response.
const _getPatrolStats = async (userId) => {
  await autoUpdatePatrolStatuses(userId);
  const rangerId = new mongoose.Types.ObjectId(userId);
  const allPatrols = await Patrol.find({ ranger: rangerId });

  const validPatrols = allPatrols.filter(p => p.patrolDate && !isNaN(new Date(p.patrolDate).getTime()));
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = validPatrols.filter(p => {
      if (p.status !== 'completed' || !p.patrolDate) return false;
      const patrolDate = new Date(p.patrolDate);
      return patrolDate >= todayStart;
  }).length;

  return {
    totalPatrols: validPatrols.length,
    activePatrols: validPatrols.filter(p => p.status === 'in_progress').length,
    scheduledPatrols: validPatrols.filter(p => p.status === 'scheduled').length,
    patrolsCompleted: validPatrols.filter(p => p.status === 'completed').length,
    completedToday: completedToday,
  };
};


// --- Exported Controller Functions ---

exports.getPatrols = async (req, res) => {
  try {
    await autoUpdatePatrolStatuses(req.user._id);
    const rangerId = new mongoose.Types.ObjectId(req.user._id);
    const patrolsRaw = await Patrol.find({ ranger: rangerId })
      .populate('ranger', 'firstName lastName email')
      .sort({ patrolDate: -1, startTime: -1 });
    
    const patrols = patrolsRaw.map(patrol => ({
      id: patrol._id.toString(),
      route: patrol.route,
      status: patrol.status,
      actualDuration: patrol.actualDuration,
      findings: patrol.findings || '',
      ranger: patrol.ranger,
      patrolDate: patrol.patrolDate ? patrol.patrolDate.toISOString().split('T')[0] : null,
      startTime: patrol.startTime || '',
      endTime: patrol.endTime && patrol.endTime instanceof Date ? patrol.endTime.toISOString() : '',
      estimatedDuration: patrol.estimatedDuration,
      priority: patrol.priority || '',
      objectives: patrol.objectives || [],
      equipment: patrol.equipment || [],
      notes: patrol.notes || '',
      attendees: patrol.attendees || [],
      createdAt: patrol.createdAt ? patrol.createdAt.toISOString() : '',
    }));
    
    res.status(200).json({ success: true, patrols });
  } catch (error) {
    console.error("Error in getPatrols:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPatrolStats = async (req, res) => {
  try {
    const stats = await _getPatrolStats(req.user._id);
    res.json(stats);
  } catch (error) {
    console.error('Error in getPatrolStats:', error);
    res.status(500).json({ message: 'Error fetching patrol stats', error: error.message });
  }
};

exports.getPatrolAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        await autoUpdatePatrolStatuses(userId);
        
        const rangerId = new mongoose.Types.ObjectId(userId);

        const [
            statusDistribution,
            monthlyPatrols,
            priorityDistribution,
            durationStats,
            totalPatrols,
            totalCompleted,
            totalInProgress,
            totalScheduled
        ] = await Promise.all([
            Patrol.aggregate([{ $match: { ranger: rangerId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
            Patrol.aggregate([
                { $match: { ranger: rangerId, patrolDate: { $exists: true, $ne: null } } },
                { $group: { _id: { year: { $year: "$patrolDate" }, month: { $month: "$patrolDate" } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Patrol.aggregate([{ $match: { ranger: rangerId, priority: { $exists: true, $ne: null } } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Patrol.aggregate([{ $match: { ranger: rangerId, estimatedDuration: { $exists: true, $ne: null } } }, { $group: { _id: null, avgDuration: { $avg: '$estimatedDuration' } } }]),
            Patrol.countDocuments({ ranger: rangerId }),
            Patrol.countDocuments({ ranger: rangerId, status: 'completed' }),
            Patrol.countDocuments({ ranger: rangerId, status: 'in_progress' }),
            Patrol.countDocuments({ ranger: rangerId, status: 'scheduled' })
        ]);
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        res.status(200).json({
            statusDistribution: statusDistribution.reduce((acc, item) => ({...acc, [item._id]: item.count}), {}),
            priorityDistribution: priorityDistribution.reduce((acc, item) => ({...acc, [item._id]: item.count}), {}),
            monthlyPatrols: monthlyPatrols.map(item => ({ name: `${monthNames[item._id.month - 1]} ${item._id.year}`, count: item.count })),
            totalPatrols,
            totalCompleted,
            totalInProgress,
            totalScheduled,
            averageDuration: durationStats.length > 0 ? Math.round(durationStats[0].avgDuration) : 0,
        });

    } catch (error) {
        console.error('Error fetching patrol analytics:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Pass the internal helper function to other modules
exports.getPatrolStatsHelper = _getPatrolStats;
exports.autoUpdatePatrolStatuses = autoUpdatePatrolStatuses;

// Keep other functions like create, update, delete as they were, ensuring correct userId usage
exports.createPatrol = async (req, res) => {
  try {
    const patrolData = { ...req.body, ranger: req.user._id };
    const patrol = new Patrol(patrolData);
    await patrol.save();
    res.status(201).json({ success: true, data: patrol });
  } catch (error) {
    console.error("Error creating patrol:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getPatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOne({ _id: req.params.id, ranger: new mongoose.Types.ObjectId(req.user._id) }).populate('ranger');
    if (!patrol) return res.status(404).json({ success: false, error: 'Patrol not found' });
    res.status(200).json({ success: true, data: patrol });
  } catch (error) {
    console.error("Error getting patrol:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOneAndUpdate(
      { _id: req.params.id, ranger: new mongoose.Types.ObjectId(req.user._id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patrol) return res.status(404).json({ success: false, error: 'Patrol not found' });
    res.status(200).json({ success: true, data: patrol });
  } catch (error) {
    console.error("Error updating patrol:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deletePatrol = async (req, res) => {
  try {
    const patrol = await Patrol.findOneAndDelete({ _id: req.params.id, ranger: new mongoose.Types.ObjectId(req.user._id) });
    if (!patrol) return res.status(404).json({ success: false, error: 'Patrol not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("Error deleting patrol:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePatrolStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: scheduled, in_progress, completed, cancelled' 
      });
    }

    const patrol = await Patrol.findById(req.params.id).populate('ranger', 'firstName lastName email');
    if (!patrol) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patrol not found' 
      });
    }

    // Check authorization - only the assigned ranger or admin can update status
    const isAdmin = req.user.role === 'admin';
    const isAssignedRanger = patrol.ranger._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isAssignedRanger) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this patrol' 
      });
    }

    // Don't allow status changes for completed patrols unless cancelling
    if (patrol.status === 'completed' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of completed patrols'
      });
    }

    patrol.status = status;
    await patrol.save();

    res.json({ 
      success: true,
      message: 'Patrol status updated successfully', 
      patrol: {
        id: patrol._id.toString(),
        route: patrol.route,
        status: patrol.status,
        actualDuration: patrol.actualDuration,
        findings: patrol.findings || '',
        ranger: patrol.ranger,
        patrolDate: patrol.patrolDate ? patrol.patrolDate.toISOString().split('T')[0] : null,
        startTime: patrol.startTime || '',
        endTime: patrol.endTime && patrol.endTime instanceof Date ? patrol.endTime.toISOString() : '',
        estimatedDuration: patrol.estimatedDuration,
        priority: patrol.priority || '',
        objectives: patrol.objectives || [],
        equipment: patrol.equipment || [],
        notes: patrol.notes || '',
        attendees: patrol.attendees || [],
      }
    });
  } catch (error) {
    console.error('Error updating patrol status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating patrol status',
      error: error.message 
    });
  }
};

exports.addFindings = async (req, res) => {
  try {
    const { findings } = req.body;
    const patrol = await Patrol.findById(req.params.id);
    if (!patrol) return res.status(404).json({ message: 'Patrol not found' });
    if (patrol.ranger.toString() !== req.user._id) return res.status(403).json({ message: 'Not authorized' });
    patrol.findings = findings;
    await patrol.save();
    res.json({ message: 'Findings added successfully', patrol });
  } catch (error) {
    res.status(500).json({ message: 'Error adding findings' });
  }
};

exports.exportPatrols = async (req, res) => {
  try {
    await autoUpdatePatrolStatuses(req.user._id);
    const patrols = await Patrol.find({ ranger: new mongoose.Types.ObjectId(req.user._id) }).populate('ranger').lean();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=patrols.json');
    res.send(JSON.stringify(patrols, null, 2));
  } catch (error) {
    console.error("Error exporting patrols:", error);
    res.status(500).json({ message: 'Error exporting patrols' });
  }
};

exports.getAllPatrols = async (req, res) => {
  try {
    const patrolsRaw = await Patrol.find({})
      .populate('ranger', 'firstName lastName email')
      .sort({ patrolDate: -1, startTime: -1 });
    const patrols = patrolsRaw.map(patrol => ({
      id: patrol._id.toString(),
      route: patrol.route,
      status: patrol.status,
      actualDuration: patrol.actualDuration,
      findings: patrol.findings || '',
      ranger: patrol.ranger,
      patrolDate: patrol.patrolDate ? patrol.patrolDate.toISOString().split('T')[0] : null,
      startTime: patrol.startTime || '',
      endTime: patrol.endTime && patrol.endTime instanceof Date ? patrol.endTime.toISOString() : '',
      estimatedDuration: patrol.estimatedDuration,
      priority: patrol.priority || '',
      objectives: patrol.objectives || [],
      equipment: patrol.equipment || [],
      notes: patrol.notes || '',
      attendees: patrol.attendees || [],
      createdAt: patrol.createdAt ? patrol.createdAt.toISOString() : '',
    }));
    res.status(200).json({ success: true, patrols });
  } catch (error) {
    console.error('Error in getAllPatrols:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}; 