const User = require('../models/User');
const Project = require('../models/Project');
const Research = require('../models/Research');
const Conservation = require('../models/Conservation');
const Volunteer = require('../models/Volunteer');
const Researcher = require('../models/Researcher');
const Ranger = require('../models/Ranger');

exports.getDashboardStats = async (req, res) => {
    try {
        // Get total counts
        const totalUsers = await User.countDocuments();
        const totalProjects = await Project.countDocuments();
        const totalResearch = await Research.countDocuments();
        const totalConservation = await Conservation.countDocuments();

        // Get user type counts
        const totalVolunteers = await Volunteer.countDocuments();
        const totalResearchers = await Researcher.countDocuments();
        const totalRangers = await Ranger.countDocuments();

        // Get recent activities
        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title description status createdAt');

        const recentResearch = await Research.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title description status createdAt');

        const recentConservation = await Conservation.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title description status createdAt');

        // Get user distribution
        const userDistribution = {
            volunteers: totalVolunteers,
            researchers: totalResearchers,
            rangers: totalRangers
        };

        // Get project status distribution
        const projectStatus = await Project.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get research status distribution
        const researchStatus = await Research.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get conservation status distribution
        const conservationStatus = await Conservation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalUsers,
            totalProjects,
            totalResearch,
            totalConservation,
            userDistribution,
            projectStatus,
            researchStatus,
            conservationStatus,
            recentActivities: {
                projects: recentProjects,
                research: recentResearch,
                conservation: recentConservation
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
}; 