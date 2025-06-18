const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const patrolController = require('../controllers/patrolController');

// Export patrols (must be before any :id route)
router.get('/export', authenticateToken, patrolController.exportPatrols);
// Get patrol stats (must be before any :id route)
router.get('/stats', authenticateToken, patrolController.getPatrolStats);

// Get all patrols
router.get('/', authenticateToken, patrolController.getPatrols);

// Create a new patrol
router.post('/', authenticateToken, patrolController.createPatrol);

// Update patrol status
router.patch('/:id/status', authenticateToken, patrolController.updatePatrolStatus);

// Add findings to a patrol
router.patch('/:id/findings', authenticateToken, patrolController.addFindings);

module.exports = router; 