const ResearchProject = require('../models/ResearchProject');
const WildlifeReport = require('../models/WildlifeReport'); // Potentially used for collaboration requests related to reports
const User = require('../models/User');
const VolunteerRequest = require('../models/VolunteerRequest'); // Import the new model

const getResearcherDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is available from authentication middleware

    // Fetch count of published findings by this researcher (assuming published means completed projects)
    const publishedFindingsCount = await ResearchProject.countDocuments({
      leadResearcher: userId,
      status: { $in: ['completed', 'published'] },
    });

    // Fetch count of active research projects led by this researcher
    const activeProjectsCount = await ResearchProject.countDocuments({
      leadResearcher: userId,
      status: { $in: ['active', 'data_collection', 'analysis'] },
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

    // Fetch recent publications by this researcher (assuming publications are completed projects)
    const recentPublications = await ResearchProject.find({
      leadResearcher: userId,
      status: { $in: ['completed', 'published'] },
    }).populate('leadResearcher', 'firstName lastName').sort({ updatedAt: -1 }).limit(5);

    // Fetch collaboration requests made by this researcher
    const collaborationRequests = await VolunteerRequest.find({
      requestedBy: userId,
      status: { $in: ['open', 'in-progress'] },
    }).populate('researchProject', 'title').populate('applicants', 'firstName lastName').sort({ createdAt: -1 }).limit(5);

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

const getDashboardData = async (req, res) => {
  try {
    const researcherId = req.user._id;

    const activeProjects = await ResearchProject.find({
      researcher: researcherId,
      status: { $in: ['active', 'planning'] }
    }).sort({ createdAt: -1 }).limit(5);

    const recentPublications = await ResearchProject.find({
        researcher: researcherId,
        status: 'completed',
    }).sort({ updatedAt: -1 }).limit(5);

    const collaborationRequests = await VolunteerRequest.find({
        requestedBy: researcherId,
        status: 'open'
    }).populate('applicants', 'firstName lastName email').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        activeProjects,
        recentPublications,
        collaborationRequests,
      },
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