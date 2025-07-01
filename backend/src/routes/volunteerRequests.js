const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createVolunteerRequest,
  getVolunteerRequests,
  getVolunteerRequest,
  updateVolunteerRequest,
  applyToRequest,
  handleApplication,
  getApplicationsForRequest,
} = require('../controllers/volunteerRequestController');

// Create a new volunteer request
router.post('/', authenticateToken, createVolunteerRequest);

// Get all volunteer requests
router.get('/', authenticateToken, getVolunteerRequests);

// Get a single volunteer request
router.get('/:id', authenticateToken, getVolunteerRequest);

// Update a volunteer request
router.put('/:id', authenticateToken, updateVolunteerRequest);

// Apply to a volunteer request
router.post('/:id/apply', authenticateToken, applyToRequest);

// Accept/Reject an application
router.post('/handle-application', authenticateToken, handleApplication);

// Get applications for a volunteer request
router.get('/:id/applications', authenticateToken, getApplicationsForRequest);

module.exports = router;
