const ResearchProject = require('../models/ResearchProject');
const User = require('../models/User');
const Dataset = require('../models/Dataset');
const ConservationProject = require('../models/ConservationProject');
const sendEmail = require('../utils/sendEmail');

const getDataHubData = async (req, res) => {
  try {
    // Fetch all datasets and populate owner with name and email
    const datasets = await Dataset.find({}).populate('owner', 'name email');
    const datasetsAvailable = datasets.length;

    // Fetch research papers/publications from ConservationProject
    const papers = await ConservationProject.find({ status: 'completed' });
    const researchPapersCount = papers.length;

    // Count of Contributing Researchers (unique authors from publications)
    const contributingResearchers = await ConservationProject.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$authors' },
      { $group: { _id: '$authors' } },
      { $count: 'count' },
    ]);
    const contributingResearchersCount = contributingResearchers.length > 0 ? contributingResearchers[0].count : 0;

    // Total downloads (sum of all dataset downloads)
    const totalDownloads = datasets.reduce((sum, ds) => sum + (ds.downloads || 0), 0);

    res.json({
      researchPapers: researchPapersCount,
      contributingResearchers: contributingResearchersCount,
      datasetsAvailable: datasetsAvailable,
      totalDownloads: totalDownloads,
      datasets: datasets,
      papers: papers,
    });

  } catch (error) {
    console.error('Error fetching data hub data:', error);
    res.status(500).json({ message: 'Server error fetching data hub data' });
  }
};

// Dataset CRUD controllers
exports.createDataset = async (req, res) => {
  try {
    const dataset = await Dataset.create(req.body);
    res.status(201).json({ success: true, data: dataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({}).populate('owner', 'name email');
    res.status(200).json({ success: true, data: datasets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, error: 'Dataset not found' });
    res.status(200).json({ success: true, data: dataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dataset) return res.status(404).json({ success: false, error: 'Dataset not found' });
    res.status(200).json({ success: true, data: dataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findByIdAndDelete(req.params.id);
    if (!dataset) return res.status(404).json({ success: false, error: 'Dataset not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.requestDatasetAccess = async (req, res) => {
  try {
    const { datasetId, ownerEmail, message } = req.body;
    if (!datasetId || !ownerEmail) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }
    // Optionally, fetch dataset details for context
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found.' });
    }
    // Compose email
    const subject = `Access Request for Dataset: ${dataset.title}`;
    const text = `A user has requested access to your dataset "${dataset.title}".\n\nMessage: ${message || '(No message provided)'}\n\nYou can reply to this email to respond.`;
    await sendEmail(ownerEmail, subject, text);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error sending dataset access request email:', error);
    return res.status(500).json({ success: false, error: 'Failed to send access request email.' });
  }
};

exports.getDataHubData = getDataHubData; 