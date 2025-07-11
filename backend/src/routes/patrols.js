const express = require('express');
const router = express.Router();
const { authenticateToken, isRanger } = require('../middleware/auth');
const patrolController = require('../controllers/patrolController');

// Export patrols (must be before any :id route)
router.get('/export', authenticateToken, patrolController.exportPatrols);
// Get patrol stats (must be before any :id route)
router.get('/stats', authenticateToken, patrolController.getPatrolStats);
// Add a new route for patrol analytics (must be before any :id route)
router.get('/analytics', authenticateToken, isRanger, patrolController.getPatrolAnalytics);

// Get all patrols
router.get('/', authenticateToken, isRanger, patrolController.getPatrols);

// Create a new patrol
router.post('/', authenticateToken, isRanger, patrolController.createPatrol);

// Get single patrol
router.get('/:id', authenticateToken, patrolController.getPatrol);

// Update patrol
router.patch('/:id', authenticateToken, patrolController.updatePatrol);

// Delete patrol
router.delete('/:id', authenticateToken, patrolController.deletePatrol);

// Update patrol status
router.patch('/:id/status', authenticateToken, patrolController.updatePatrolStatus);

// Add findings to a patrol
router.patch('/:id/findings', authenticateToken, patrolController.addFindings);

module.exports = router; 