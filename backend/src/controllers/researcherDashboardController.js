const ResearchProject = require('../models/ResearchProject');
const WildlifeReport = require('../models/WildlifeReport'); // Potentially used for collaboration requests related to reports
const User = require('../models/User');

const getResearcherDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is available from authentication middleware

    // TODO: Fetch count of published findings by this researcher
    const publishedFindingsCount = 0; // Replace with actual database query

    // Fetch count of active research projects led by this researcher
    const activeProjectsCount = await ResearchProject.countDocuments({
      leadResearcher: userId,
      status: { $in: ['active', 'data_collection', 'analysis'] },
    });

    // TODO: Count unique volunteer collaborators (e.g., from projects)
    const volunteerCollaboratorsCount = 0; // Replace with actual database query

    // TODO: Count dataset downloads (requires a Dataset model or tracking in ResearchProject)
    const datasetDownloadsCount = 0; // Replace with actual database query

    const stats = {
      publishedFindings: publishedFindingsCount,
      activeProjects: activeProjectsCount,
      volunteerCollaborators: volunteerCollaboratorsCount,
      datasetDownloads: datasetDownloadsCount,
    };

    // Fetch active research projects led by this researcher
    const activeProjects = await ResearchProject.find({
      leadResearcher: userId,
      status: { $in: ['active', 'data_collection', 'analysis'] },
    }).limit(5); // Limit to 5 active projects

    // TODO: Fetch recent publications by this researcher (requires a Publication model)
    const recentPublications = []; // Replace with actual database query

    // TODO: Fetch collaboration requests (might need a dedicated model or link to reports)
    const collaborationRequests = []; // Replace with actual database query

    res.json({
      stats,
      activeProjects,
      recentPublications,
      collaborationRequests,
    });

  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching researcher dashboard data' });
  }
};

module.exports = {
  getResearcherDashboardData,
}; 