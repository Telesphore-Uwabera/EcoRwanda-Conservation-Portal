const WildlifeReport = require('../models/WildlifeReport');
const ConservationProject = require('../models/ConservationProject');
const ResearchProject = require('../models/ResearchProject'); // Although not directly used for volunteer projects, it's good to have it imported if cross-linking is needed later

const getVolunteerDashboardData = async (req, res) => {
  const start = Date.now();
  try {
    console.log('Attempting to fetch volunteer dashboard data...');
    console.log('req.user:', req.user);
    const userId = req.user.userId; // Assuming userId is available from authentication middleware
    console.log('Fetching data for userId:', userId);

    // Fetch reports submitted by the logged-in volunteer
    const reportsSubmittedCount = await WildlifeReport.countDocuments({ submittedBy: userId });
    console.log('reportsSubmittedCount:', reportsSubmittedCount, 'in', Date.now() - start, 'ms');

    // Fetch conservation projects joined by the logged-in volunteer
    const projectsJoinedCount = await ConservationProject.countDocuments({ volunteers: userId });
    console.log('projectsJoinedCount:', projectsJoinedCount);

    // TODO: Calculate impact score for the logged-in volunteer (more complex aggregation needed)
    const impactScore = 0; 

    // TODO: Determine rank based on impact score or other criteria
    const rank = "N/A"; 

    // Fetch recent reports relevant to the volunteer (e.g., their own reports, sorted by submittedAt)
    const recentReports = await WildlifeReport.find({ submittedBy: userId })
      .select('title description location submittedBy createdAt urgency photos')
      .sort({ submittedAt: -1 })
      .limit(5);
    console.log('recentReports:', recentReports.length, 'reports in', Date.now() - start, 'ms');

    // Fetch available conservation projects for volunteers
    const availableProjects = await ConservationProject.find({
      status: { $in: ['active', 'planning'] },
      volunteers: { $ne: userId } 
    }).select('title description status').limit(5);
    console.log('availableProjects:', availableProjects.length, 'projects in', Date.now() - start, 'ms');

    const stats = {
      reportsSubmitted: reportsSubmittedCount,
      projectsJoined: projectsJoinedCount,
      impactScore: impactScore,
      rank: rank,
    };

    res.json({
      stats,
      recentReports,
      availableProjects,
    });

  } catch (error) {
    console.error('Error fetching volunteer dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching volunteer dashboard data' });
  }
};

module.exports = {
  getVolunteerDashboardData,
}; 