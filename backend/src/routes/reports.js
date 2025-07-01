const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getUserReports,
  getRecentUserReports
} = require('../controllers/reportController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all reports
router.get('/', authenticateToken, getAllReports);

// Get reports for a specific user
router.get('/user/:userId', authenticateToken, getUserReports);

// Get recent reports for a user
router.get('/user/:userId/recent', authenticateToken, getRecentUserReports);

// Get a single report
router.get('/:id', authenticateToken, getReportById);

// Create a new report
router.post('/', authenticateToken, upload.array('photos', 5), createReport);

// Update a report
router.put('/:id', authenticateToken, updateReport);

// Delete a report
router.delete('/:id', authenticateToken, deleteReport);

// Serve a specific photo from a report
router.get('/:id/photo/:photoIndex', require('../controllers/reportController').getReportPhoto);

module.exports = router; 