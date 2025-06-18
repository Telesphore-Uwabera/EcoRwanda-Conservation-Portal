const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const patrolController = require('../controllers/patrolController');

// Get all patrols
router.get('/', authenticateToken, patrolController.getPatrols);

// Create a new patrol
router.post('/', authenticateToken, patrolController.createPatrol);

// Update patrol status
router.patch('/:id/status', authenticateToken, patrolController.updatePatrolStatus);

// Add findings to a patrol
router.patch('/:id/findings', authenticateToken, patrolController.addFindings);

// Get patrol stats
router.get('/stats', authenticateToken, patrolController.getPatrolStats);

// Export patrols
router.get('/export', authenticateToken, patrolController.exportPatrols);

module.exports = router; 