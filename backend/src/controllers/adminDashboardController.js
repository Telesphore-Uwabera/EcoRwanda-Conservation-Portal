const User = require('../models/User');
const ResearchProject = require('../models/ResearchProject');
const ConservationProject = require('../models/ConservationProject');
const WildlifeReport = require('../models/WildlifeReport');
const Volunteer = require('../models/Volunteer');
const Researcher = require('../models/Researcher');
const Ranger = require('../models/Ranger');
const Patrol = require('../models/Patrol');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Attempting to fetch admin dashboard stats...');

        const totalUsers = await User.countDocuments();
        console.log('totalUsers:', totalUsers);

        const totalReports = await WildlifeReport.countDocuments();
        const pendingReports = await WildlifeReport.countDocuments({ status: 'pending' });
        const verifiedReports = await WildlifeReport.countDocuments({ status: 'verified' });
        const rejectedReports = await WildlifeReport.countDocuments({ status: 'rejected' });
        const investigatingReports = await WildlifeReport.countDocuments({ status: 'investigating' });
        const resolvedReports = await WildlifeReport.countDocuments({ status: 'resolved' });
        console.log('totalReports:', totalReports, 'pendingReports:', pendingReports, 'verifiedReports:', verifiedReports);

        const totalProjects = await ResearchProject.countDocuments() + await ConservationProject.countDocuments();
        console.log('totalProjects:', totalProjects);

        const totalPatrols = await Patrol.countDocuments();
        console.log('totalPatrols:', totalPatrols);

        const conservationAreas = await ConservationProject.countDocuments();
        console.log('conservationAreas:', conservationAreas);

        const totalParkRangers = await User.countDocuments({ role: 'ranger' });
        console.log('totalParkRangers:', totalParkRangers);

        // User verification stats
        const unverifiedUsers = await User.countDocuments({ verified: false });
        console.log('unverifiedUsers:', unverifiedUsers);

        const userDistribution = {
            volunteers: await User.countDocuments({ role: 'volunteer' }),
            researchers: await User.countDocuments({ role: 'researcher' }),
            rangers: await User.countDocuments({ role: 'ranger' }),
            administrators: await User.countDocuments({ role: 'administrator' }),
        };
        console.log('userDistribution:', userDistribution);

        // TODO: Fetch recent activities (e.g., latest reports, new projects, user registrations)
        const recentActivities = [];

        // Aggregate project status using date logic (completed, active, planning)
        const allProjects = await ResearchProject.find({});
        const now = new Date();
        let completed = 0, active = 0, planning = 0;
        allProjects.forEach(p => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            if (end < now) completed++;
            else if (start > now) planning++;
            else active++;
        });
        const projectStatus = [
            { _id: 'completed', count: completed },
            { _id: 'active', count: active },
            { _id: 'planning', count: planning },
        ];
        console.log('projectStatus:', projectStatus);

        // Fetch latest update date for each status
        const getLatestReportDate = async (status) => {
            const report = await WildlifeReport.findOne({ status }).sort({ updatedAt: -1 });
            return report ? (report.updatedAt || report.submittedAt) : null;
        };
        const latestPending = await getLatestReportDate('pending');
        const latestVerified = await getLatestReportDate('verified');
        const latestRejected = await getLatestReportDate('rejected');
        const latestInvestigating = await getLatestReportDate('investigating');
        const latestResolved = await getLatestReportDate('resolved');

        res.status(200).json({
            userStats: {
                totalUsers,
                verifiedUsers: totalUsers - unverifiedUsers,
                unverifiedUsers,
                userDistribution,
            },
            totalProjects,
            totalPatrols,
            conservationAreas,
            totalParkRangers,
            recentActivities,
            totalReports,
            pendingReports,
            verifiedReports,
            rejectedReports,
            investigatingReports,
            resolvedReports,
            projectStatus,
            latestReportDates: {
                pending: latestPending,
                verified: latestVerified,
                rejected: latestRejected,
                investigating: latestInvestigating,
                resolved: latestResolved,
            },
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}; 