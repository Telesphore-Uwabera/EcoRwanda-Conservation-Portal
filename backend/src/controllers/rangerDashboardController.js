const WildlifeReport = require('../models/WildlifeReport');
const Patrol = require('../models/Patrol');
const User = require('../models/User'); // Assuming User model is needed for populating related fields or specific user queries

const getRangerDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is available from authentication middleware

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

    const todayPatrols = await Patrol.find({
      ranger: userId,
      patrolDate: { $gte: startOfToday, $lt: endOfToday },
    }).sort({ patrolDate: 1 }); // Sort by time

    res.json({
      stats,
      urgentAlerts,
      pendingReports,
      todayPatrols,
    });

  } catch (error) {
    console.error('Error fetching ranger dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching ranger dashboard data' });
  }
};

module.exports = {
  getRangerDashboardData,
}; 