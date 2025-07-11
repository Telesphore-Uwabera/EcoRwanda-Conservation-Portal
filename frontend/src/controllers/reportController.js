const Report = require('../models/Report');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category,
      urgency,
      priority,
      photos,
      evidence
    } = req.body;

    const report = await Report.create({
      title,
      description,
      location,
      category,
      urgency,
      priority,
      photos,
      evidence,
      submittedBy: req.user._id,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const { status, category, urgency } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    const reports = await Report.find(query)
      .populate('submittedBy', 'name email organization')
      .populate('verifiedBy', 'name email organization')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'name email organization')
      .populate('verifiedBy', 'name email organization');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Ranger/Admin only)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    if (status === 'verified') {
      report.verifiedBy = req.user._id;
      report.verifiedAt = Date.now();
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add update to report
// @route   POST /api/reports/:id/updates
// @access  Private
const addReportUpdate = async (req, res) => {
  try {
    const { type, message } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.updates.push({
      type,
      message,
      author: req.user._id
    });

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ submittedBy: req.user._id })
      .populate('verifiedBy', 'name email organization')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  addReportUpdate,
  getMyReports
}; 