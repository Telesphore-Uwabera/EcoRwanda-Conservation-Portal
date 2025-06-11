const User = require('../models/User');
const ResearchProject = require('../models/ResearchProject');
const ConservationProject = require('../models/ConservationProject');
const Volunteer = require('../models/Volunteer');
const Researcher = require('../models/Researcher');
const Ranger = require('../models/Ranger');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Attempting to fetch admin dashboard stats...');

        const totalUsers = await User.countDocuments();
        console.log('totalUsers:', totalUsers);

        const totalProjects = await ResearchProject.countDocuments() + await ConservationProject.countDocuments();
        console.log('totalProjects:', totalProjects);

        const researchStudies = await ResearchProject.countDocuments();
        console.log('researchStudies:', researchStudies);

        const conservationAreas = await ConservationProject.countDocuments();
        console.log('conservationAreas:', conservationAreas);

        const totalParkRangers = await User.countDocuments({ role: 'ranger' });
        console.log('totalParkRangers:', totalParkRangers);

        const userDistribution = {
            volunteers: await User.countDocuments({ role: 'volunteer' }),
            researchers: await User.countDocuments({ role: 'researcher' }),
            rangers: await User.countDocuments({ role: 'ranger' }),
            administrators: await User.countDocuments({ role: 'administrator' }),
        };
        console.log('userDistribution:', userDistribution);

        // TODO: Fetch recent activities (e.g., latest reports, new projects, user registrations)
        const recentActivities = [];

        res.status(200).json({
            totalUsers,
            totalProjects,
            researchStudies,
            conservationAreas,
            totalParkRangers,
            userDistribution,
            recentActivities,
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}; 