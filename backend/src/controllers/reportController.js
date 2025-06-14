const WildlifeReport = require('../models/WildlifeReport');

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await WildlifeReport.find().populate('submittedBy verifiedBy');
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
    const report = await WildlifeReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
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