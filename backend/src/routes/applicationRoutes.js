const express = require('express');
const router = express.Router();
const { getMyApplications } = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/auth');

// @route   GET api/applications/my-applications
// @desc    Get all applications for the logged-in user
// @access  Private
router.get('/my-applications', authenticateToken, getMyApplications);

module.exports = router;
 