const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const volunteerRequestController = require('../controllers/volunteerRequestController');

// Create a new volunteer request
router.post('/', authenticateToken, volunteerRequestController.createVolunteerRequest);

// Get all volunteer requests
router.get('/', authenticateToken, volunteerRequestController.getVolunteerRequests);

// Get a single volunteer request
router.get('/:id', authenticateToken, volunteerRequestController.getVolunteerRequest);

// Update a volunteer request
router.put('/:id', authenticateToken, volunteerRequestController.updateVolunteerRequest);

// Apply to a volunteer request
router.post('/:id/apply', authenticateToken, volunteerRequestController.applyToRequest);

// Accept/Reject an application
router.post('/:id/handle-application', authenticateToken, volunteerRequestController.handleApplication);

module.exports = router;
