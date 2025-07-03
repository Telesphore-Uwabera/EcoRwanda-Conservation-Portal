const ResearchProject = require('../models/ResearchProject');
const WildlifeReport = require('../models/WildlifeReport'); // Potentially used for collaboration requests related to reports
const User = require('../models/User');
const VolunteerRequest = require('../models/VolunteerRequest'); // Import the new model
const ConservationProject = require('../models/ConservationProject');
const Application = require('../models/Application');

const getResearcherDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch all research projects for this user
    const allProjects = await ResearchProject.find({ leadResearcher: userId });
    const totalProjects = allProjects.length;
    // Group projects by status
    let completed = 0, active = 0, planning = 0;
    allProjects.forEach(p => {
      if (p.status === 'completed') completed++;
      else if (['in-progress', 'on-hold'].includes(p.status)) active++;
      else if (p.status === 'planning') planning++;
    });
    const projectStatusBreakdown = { completed, active, planning };

    // Volunteer collaborators logic (unchanged)
    const now = new Date();
    const startedProjectIds = (await ResearchProject.find({
      leadResearcher: userId,
      startDate: { $lte: now }
    }, '_id').lean()).map(p => p._id);
    const volunteerRequests = await VolunteerRequest.find({ researchProject: { $in: startedProjectIds } }, '_id').lean();
    const volunteerRequestIds = volunteerRequests.map(r => r._id);
    const acceptedApplications = await Application.find({ volunteerRequest: { $in: volunteerRequestIds }, status: 'accepted' }, 'applicant').lean();
    const uniqueVolunteerIds = new Set(acceptedApplications.map(app => app.applicant.toString()));
    const volunteerCollaboratorsCount = uniqueVolunteerIds.size;

    const stats = {
      totalProjects,
      volunteerCollaborators: volunteerCollaboratorsCount,
      datasetDownloads: 0,
    };

    res.status(200).json({
      success: true,
      stats,
      projectStatusBreakdown,
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