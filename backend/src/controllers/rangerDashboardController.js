const WildlifeReport = require('../models/WildlifeReport');
const Patrol = require('../models/Patrol');
const User = require('../models/User'); // Assuming User model is needed for populating related fields or specific user queries

const getRangerDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch count of reports to verify (pending reports)
    const reportsToVerifyCount = await WildlifeReport.countDocuments({ status: 'pending' });

    // Fetch count of patrols completed by this ranger
    const patrolsCompletedCount = await Patrol.countDocuments({
      ranger: userId,
      status: 'completed',
    });

    // Fetch count of threats detected (high or critical urgency reports)
    const threatsDetectedCount = await WildlifeReport.countDocuments({
      urgency: { $in: ['high', 'critical'] },
    });

    // TODO: Calculate average response time (requires more detailed logic based on report verification times)
    const responseTime = "N/A"; 

    const stats = {
      reportsToVerify: reportsToVerifyCount,
      patrolsCompleted: patrolsCompletedCount,
      threatsDetected: threatsDetectedCount,
      responseTime: responseTime,
    };

    // Fetch urgent alerts (high or critical urgency reports)
    const urgentAlerts = await WildlifeReport.find({
      urgency: { $in: ['high', 'critical'] },
    }).sort({ submittedAt: -1 }).limit(5); // Limit to 5 urgent alerts

    // Fetch pending reports for verification
    const pendingReports = await WildlifeReport.find({ status: 'pending' })
      .sort({ submittedAt: -1 })
      .limit(5); // Limit to 5 pending reports

    // Fetch today's patrols for this ranger
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayPatrolsRaw = await Patrol.find({
      ranger: userId,
      patrolDate: { $gte: startOfToday, $lt: endOfToday },
    })
      .populate('ranger', 'firstName lastName email')
      .sort({ patrolDate: 1 }); // Sort by time

    // Transform patrols for frontend
    const todayPatrols = todayPatrolsRaw.map(patrol => ({
      id: patrol._id.toString(),
      route: patrol.route,
      status: patrol.status,
      duration: patrol.duration || '',
      findings: patrol.findings || '',
      ranger: patrol.ranger ? {
        _id: patrol.ranger._id?.toString?.() || '',
        firstName: patrol.ranger.firstName || '',
        lastName: patrol.ranger.lastName || '',
        email: patrol.ranger.email || '',
      } : {},
      patrolDate: patrol.patrolDate ? patrol.patrolDate.toISOString() : '',
      startTime: patrol.startTime || '',
      endTime: patrol.endTime || '',
      estimatedDuration: patrol.estimatedDuration?.toString?.() || '',
      priority: patrol.priority || '',
      objectives: patrol.objectives || [],
      equipment: patrol.equipment || [],
      notes: patrol.notes || '',
      createdAt: patrol.createdAt ? patrol.createdAt.toISOString() : '',
    }));

    // Patrols by day for analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const patrolsByDay = await Patrol.aggregate([
      { $match: { ranger: userId, patrolDate: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$patrolDate" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats,
      urgentAlerts,
      pendingReports,
      todayPatrols,
      patrolsByDay,
    });

  } catch (error) {
    console.error('Error fetching ranger dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching ranger dashboard data' });
  }
};

module.exports = {
  getRangerDashboardData,
}; 