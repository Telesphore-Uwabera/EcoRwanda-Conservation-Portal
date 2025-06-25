const ResearchProject = require('../models/ResearchProject');
const WildlifeReport = require('../models/WildlifeReport'); // Potentially used for collaboration requests related to reports
const User = require('../models/User');
const VolunteerRequest = require('../models/VolunteerRequest'); // Import the new model
const ConservationProject = require('../models/ConservationProject');

const getResearcherDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming userId is available from authentication middleware

    // Fetch count of published findings by this researcher (assuming published means completed projects)
    const publishedFindingsCount = await ResearchProject.countDocuments({
      leadResearcher: userId,
      status: { $in: ['completed', 'published'] },
    });

    // Fetch count of active research projects led by this researcher
    const activeProjectsCount = await ResearchProject.countDocuments({
      leadResearcher: userId,
      status: { $in: ['active', 'data_collection', 'planning'] },
    });

    // Count unique volunteer collaborators (e.g., from projects)
    // This will count the number of applicants across all active volunteer requests by this researcher
    const volunteerRequests = await VolunteerRequest.find({
      requestedBy: userId,
      status: { $in: ['open', 'in-progress'] },
    }).populate('applicants', 'firstName lastName');

    let volunteerCollaboratorsCount = 0;
    const uniqueVolunteerIds = new Set();
    volunteerRequests.forEach(request => {
      request.applicants.forEach(applicant => {
        uniqueVolunteerIds.add(applicant._id.toString());
      });
    });
    volunteerCollaboratorsCount = uniqueVolunteerIds.size;

    // Count dataset downloads (placeholder for now, requires a Dataset model or tracking in ResearchProject)
    const datasetDownloadsCount = 0; 

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
    }).populate('leadResearcher', 'firstName lastName').limit(5);

    // Get collaboration requests (volunteer requests for their projects)
    const collaborationRequestsData = await VolunteerRequest.find({
      requestedBy: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // Use lean for better performance

    const collaborationRequests = collaborationRequestsData.map(req => ({
      ...req,
      applicants: req.applications ? req.applications.length : 0,
    }));

    res.status(200).json({
      success: true,
      stats,
      activeProjects,
      collaborationRequests,
    });

  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching researcher dashboard data' });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const researcherId = req.user._id;

    // Fetch active projects
    const activeProjects = await ResearchProject.find({
      leadResearcher: researcherId,
      status: { $in: ['planning', 'in-progress', 'on-hold'] }
    }).sort({ createdAt: -1 }).limit(5);

    // Fetch recent publications (completed projects)
    const recentPublications = await ResearchProject.find({
      leadResearcher: researcherId,
      status: 'completed'
    }).sort({ updatedAt: -1 }).limit(5);

    // Fetch collaboration requests (dummy data for now, as model is not defined)
    const collaborationRequests = []; // Placeholder

    // Calculate stats
    const stats = {
      publishedFindings: await ResearchProject.countDocuments({ leadResearcher: researcherId, status: 'completed' }),
      activeProjects: await ResearchProject.countDocuments({ leadResearcher: researcherId, status: { $in: ['planning', 'in-progress', 'on-hold'] } }),
      volunteerCollaborators: 0, // Placeholder
      datasetDownloads: 0, // Placeholder
    };

    res.json({
      success: true,
      stats,
        activeProjects,
        recentPublications,
        collaborationRequests,
    });
  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getResearcherDashboardData,
  getDashboardData,
}; 