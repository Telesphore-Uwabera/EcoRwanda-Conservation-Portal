const WildlifeReport = require('../models/WildlifeReport');
const mongoose = require('mongoose');
const { logActivity } = require('../utils/activityLogger');

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
    // Accept photos as array of Cloudinary URLs from req.body
    const reportData = { ...req.body, submittedBy: req.user.id };
    const report = await WildlifeReport.create(reportData);

    // Log the activity (generic message, no 'by ...')
    const message = `A new '${report.category}' report with '${report.urgency}' urgency was submitted.`;
    await logActivity(message, req.user.id, `/ranger/verify-reports?reportId=${report._id}`);

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error(error); // Log the actual error
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// Update a report by ID
exports.updateReport = async (req, res) => {
  try {
    const { status, verificationNotes, ...rest } = req.body;
    const report = await WildlifeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (status) {
      // Require verification notes for status changes
      if (['verified', 'investigating', 'resolved', 'rejected'].includes(status) && !verificationNotes) {
        return res.status(400).json({ 
          success: false, 
          error: 'Verification notes are required when updating status to verified, investigating, resolved, or rejected' 
        });
      }

      // Log the status change activity
      const message = `Report status updated to '${status}' by a ranger.`;
      await logActivity(message, req.user.id, `/ranger/verify-reports/${report._id}`);

      report.status = status;
      report.verificationNotes = verificationNotes || report.verificationNotes;

      if (status === 'verified' && req.user) {
        report.verifiedBy = req.user.id;
        report.verifiedAt = Date.now();
      }
    }

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

// Serve a specific photo from a report
exports.getReportPhoto = async (req, res) => {
  try {
    const { id, photoIndex } = req.params;
    const report = await WildlifeReport.findById(id);
    if (!report || !report.photos[photoIndex]) {
      return res.status(404).send('Not found');
    }
    const photo = report.photos[photoIndex];
    res.contentType(photo.contentType);
    res.send(photo.data);
  } catch (error) {
    res.status(500).send('Server error');
  }
}; 