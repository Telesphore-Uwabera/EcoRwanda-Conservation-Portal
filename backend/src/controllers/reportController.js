const WildlifeReport = require('../models/WildlifeReport');
const mongoose = require('mongoose');

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.submittedBy) {
      filter.submittedBy = new mongoose.Types.ObjectId(req.query.submittedBy);
    }
    const reports = await WildlifeReport.find(filter).populate('submittedBy verifiedBy');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get reports for a specific user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reports = await WildlifeReport.find({ submittedBy: userId })
      .sort({ submittedAt: -1 })
      .populate('submittedBy verifiedBy');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get recent reports for a user
exports.getRecentUserReports = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reports = await WildlifeReport.find({ submittedBy: userId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('submittedBy verifiedBy');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await WildlifeReport.findById(req.params.id).populate('submittedBy verifiedBy');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const report = await WildlifeReport.create({ ...req.body, submittedBy: req.user.id });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Update a report by ID
exports.updateReport = async (req, res) => {
  try {
    const { status, ...rest } = req.body;
    const report = await WildlifeReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    if (status) {
      report.status = status;
      // Optionally, handle verifiedBy/verifiedAt for 'verified' status
      if (status === 'verified' && req.user) {
        report.verifiedBy = req.user.id;
        report.verifiedAt = Date.now();
      }
    }
    // Update other fields if needed
    Object.assign(report, rest);
    await report.save();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Delete a report by ID
exports.deleteReport = async (req, res) => {
  try {
    const report = await WildlifeReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 