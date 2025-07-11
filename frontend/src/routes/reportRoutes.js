const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  addReportUpdate,
  getMyReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes accessible by all authenticated users
router.post('/', createReport);
router.get('/my-reports', getMyReports);
router.get('/:id', getReportById);
router.post('/:id/updates', addReportUpdate);

// Routes accessible by all authenticated users
router.get('/', getReports);

// Routes accessible only by rangers and administrators
router.put('/:id/status', authorize('ranger', 'administrator'), updateReportStatus);

module.exports = router; 