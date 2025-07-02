const WildlifeReport = require("../models/WildlifeReport");
const { getPatrolStatsHelper } = require('./patrolController'); // Import the helper

const getRangerDashboardData = async (req, res) => {
  const start = Date.now();
  try {
    const userId = req.user._id;

    // Use the centralized helper to get patrol stats
    const patrolStats = await getPatrolStatsHelper(userId);
    console.log('Patrol stats fetched in', Date.now() - start, 'ms');
    
    // Fetch pending reports for verification
    const pendingReports = await WildlifeReport.find({
      status: "pending",
    })
      .select('title description location submittedBy createdAt urgency photos')
      .populate("submittedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);
    console.log('Pending reports fetched in', Date.now() - start, 'ms');

    // Fetch recent verified reports by this ranger
    const recentVerifiedReports = await WildlifeReport.find({
      verifiedBy: userId,
      status: "verified",
    })
      .select('title description location submittedBy updatedAt urgency photos')
      .populate("submittedBy", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(5);
    console.log('Recent verified reports fetched in', Date.now() - start, 'ms');

    // Transform the data to match frontend expectations
    const stats = {
      reportsToVerify: pendingReports.length,
      patrolsCompleted: patrolStats.patrolsCompleted,
      threatsDetected: recentVerifiedReports.length,
      responseTime: "2.5 hours", // Placeholder
      totalPatrols: patrolStats.totalPatrols,
      activePatrols: patrolStats.activePatrols,
      scheduledPatrols: patrolStats.scheduledPatrols,
      completedToday: patrolStats.completedToday,
    };

    // Transform pending reports to match frontend interface
    const transformedPendingReports = pendingReports.map(report => ({
      id: report._id.toString(),
      title: report.title || report.category,
      description: report.description,
      location: report.location?.name || 'Unknown',
      submittedBy: `${report.submittedBy?.firstName || ''} ${report.submittedBy?.lastName || ''}`.trim(),
      submittedAt: report.createdAt,
      urgency: report.urgency || 'medium',
      evidence: report.photos || [],
    }));

    // Placeholder for urgent alerts (could be enhanced later)
    const urgentAlerts = [];

    // Placeholder for today's patrols (could be enhanced later)
    const todayPatrols = [];

    res.json({
      stats,
      urgentAlerts,
      pendingReports: transformedPendingReports,
      todayPatrols,
      patrolsByDay: [], // Placeholder
    });
  } catch (error) {
    console.error("Error fetching ranger dashboard data:", error);
    res.status(500).json({
      message: "Error fetching ranger dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getRangerDashboardData,
}; 