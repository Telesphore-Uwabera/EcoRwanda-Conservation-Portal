const ResearchProject = require('../models/ResearchProject');
const User = require('../models/User');
const Dataset = require('../models/Dataset');
const ConservationProject = require('../models/ConservationProject');
const sendEmail = require('../utils/sendEmail');

const getDataHubData = async (req, res) => {
  try {
    // Fetch all datasets and publications
    const datasets = await Dataset.find({}).populate('owners', 'name email');
    const publications = await ConservationProject.find({}).populate('owners', 'name email');

    // Collect all unique owner user IDs and names/emails
    const contributorMap = new Map();
    datasets.forEach(ds => {
      (ds.owners || []).forEach(owner => {
        if (owner && owner._id) contributorMap.set(owner._id.toString(), { name: owner.name, email: owner.email });
      });
    });
    publications.forEach(pub => {
      (pub.owners || []).forEach(owner => {
        if (owner && owner._id) contributorMap.set(owner._id.toString(), { name: owner.name, email: owner.email });
      });
    });
    const contributors = Array.from(contributorMap.values());
    const contributingResearchersCount = contributors.length;

    // Fetch research papers/publications from ConservationProject
    const papers = await ConservationProject.find({ status: 'completed' });
    const researchPapersCount = papers.length;

    // Total downloads (sum of all dataset downloads)
    const totalDownloads = datasets.reduce((sum, ds) => sum + (ds.downloads || 0), 0);

    res.json({
      researchPapers: researchPapersCount,
      contributingResearchers: contributingResearchersCount,
      datasetsAvailable: datasets.length,
      totalDownloads: totalDownloads,
      datasets: datasets,
      papers: papers,
      contributors,
    });

  } catch (error) {
    console.error('Error fetching data hub data:', error);
    res.status(500).json({ message: 'Server error fetching data hub data' });
  }
};

// Dataset CRUD controllers
exports.createDataset = async (req, res) => {
  try {
    let owners = [];
    if (Array.isArray(req.body.authorsUserIds) && req.body.authorsUserIds.length > 0) {
      owners = req.body.authorsUserIds;
    } else if (req.body.owner) {
      owners = [req.body.owner];
    } else if (req.user && req.user._id) {
      owners = [req.user._id];
    }
    const dataset = await Dataset.create({
      ...req.body,
      owners,
    });
    res.status(201).json({ success: true, data: dataset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({}).populate('owners', 'name email');
    res.status(200).json({ success: true, data: datasets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate('owners', 'name email');
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

exports.downloadDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate('owners', 'name email');
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }
    // Increment downloads count
    dataset.downloads = (dataset.downloads || 0) + 1;
    await dataset.save();

    res.setHeader('Content-Disposition', `attachment; filename="${dataset.title.replace(/\s+/g, '_') || 'dataset'}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(dataset, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDataHubData = getDataHubData; 