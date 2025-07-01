const User = require('../models/User');
const WildlifeReport = require('../models/WildlifeReport');
const Patrol = require('../models/Patrol');
const ConservationProject = require('../models/ConservationProject');
const ResearchProject = require('../models/ResearchProject');

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } }); // Active in last month
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } });
    const verifiedUsers = await User.countDocuments({ verified: true });

    const volunteerCount = await User.countDocuments({ role: 'volunteer' });
    const researcherCount = await User.countDocuments({ role: 'researcher' });
    const rangerCount = await User.countDocuments({ role: 'ranger' });
    const administratorCount = await User.countDocuments({ role: 'administrator' });

    const totalReports = await WildlifeReport.countDocuments();
    const verifiedReports = await WildlifeReport.countDocuments({ status: 'verified' });
    const verifiedReportsThisMonth = await WildlifeReport.countDocuments({ status: 'verified', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } });
    const pendingReports = await WildlifeReport.countDocuments({ status: 'pending' });

    const totalPatrols = await Patrol.countDocuments();
    const completedPatrols = await Patrol.countDocuments({ status: 'completed' });

    const activeConservationProjects = await ConservationProject.countDocuments({ status: 'active' });
    const completedConservationProjects = await ConservationProject.countDocuments({ status: 'completed' });
    const totalConservationAreas = await ConservationProject.countDocuments();

    const activeResearchProjects = await ResearchProject.countDocuments({ status: 'active' });
    const completedResearchProjects = await ResearchProject.countDocuments({ status: 'completed' });
    const totalResearchStudies = await ResearchProject.countDocuments();

    const totalResearchProjects = await ResearchProject.countDocuments() || 0;
    const totalConservationProjects = await ConservationProject.countDocuments() || 0;

    const analytics = {
      userStats: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        newUsersThisMonth: newUsersThisMonth,
        verifiedUsers: verifiedUsers,
        userDistribution: {
          volunteers: volunteerCount,
          researchers: researcherCount,
          rangers: rangerCount,
          administrators: administratorCount,
        },
      },
      activityStats: {
        totalReports: totalReports,
        verifiedReports: verifiedReports,
        verifiedReportsThisMonth: verifiedReportsThisMonth,
        pendingReports: pendingReports,
        totalPatrols: totalPatrols,
        completedPatrols: completedPatrols,
      },
      projectStats: {
        totalProjects: totalResearchProjects + totalConservationProjects,
        completedProjects: completedConservationProjects + completedResearchProjects,
        totalResearchStudies: totalResearchStudies,
        conservationAreas: totalConservationAreas,
      },
      engagementStats: {
        averageResponseTime: "N/A", // Calculate from DB data
        reportAccuracy: "N/A", // Calculate from DB data
        userSatisfaction: "N/A", // Fetch/Calculate from DB data
      },
    };

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const getDetailedAnalytics = async (req, res) => {
  try {
    const { type, timeRange } = req.query;

    // In a real application, you would fetch detailed analytics from your database
    // based on the 'type' and 'timeRange' parameters.
    const detailedAnalytics = {
      type,
      timeRange,
      data: {
        labels: [], // Fetch from DB
        values: [], // Fetch from DB
      },
    };

    res.status(200).json({ success: true, data: detailedAnalytics });
  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getAnalytics,
  getDetailedAnalytics,
}; 