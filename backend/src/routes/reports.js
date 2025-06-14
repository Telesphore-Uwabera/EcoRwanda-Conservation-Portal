const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all reports
router.get('/', authenticateToken, reportController.getAllReports);

// Get a single report by ID
router.get('/:id', authenticateToken, reportController.getReportById);

// Create a new report
router.post('/', authenticateToken, reportController.createReport);

// Update a report by ID
router.put('/:id', authenticateToken, reportController.updateReport);

// Delete a report by ID (admin only)
router.delete('/:id', authenticateToken, isAdmin, reportController.deleteReport);

module.exports = router; 