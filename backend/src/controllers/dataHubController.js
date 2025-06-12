const ResearchProject = require('../models/ResearchProject');
const User = require('../models/User');

const getDataHubData = async (req, res) => {
  try {
    // Count of Research Papers (considering published or completed projects as papers)
    const researchPapersCount = await ResearchProject.countDocuments({
      status: { $in: ['published', 'completed'] },
    });

    // Count of Contributing Researchers (unique lead researchers from published/completed projects)
    const contributingResearchers = await ResearchProject.aggregate([
      { $match: { status: { $in: ['published', 'completed'] } } },
      { $group: { _id: '$leadResearcher' } },
      { $count: 'count' },
    ]);
    const contributingResearchersCount = contributingResearchers.length > 0 ? contributingResearchers[0].count : 0;

    // Placeholder for Datasets Available (requires a Dataset model)
    const datasetsAvailable = 0;

    // Placeholder for Total Downloads (requires download tracking)
    const totalDownloads = 0;

    res.json({
      researchPapers: researchPapersCount,
      contributingResearchers: contributingResearchersCount,
      datasetsAvailable: datasetsAvailable,
      totalDownloads: totalDownloads,
    });

  } catch (error) {
    console.error('Error fetching data hub data:', error);
    res.status(500).json({ message: 'Server error fetching data hub data' });
  }
};

module.exports = {
  getDataHubData,
}; 