const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createPatrol,
  getPatrols,
  getPatrol,
  updatePatrol,
  deletePatrol,
  getPatrolStats,
  getPatrolAnalytics,
  exportPatrols,
  updatePatrolStatus,
  addFindings,
  getAllPatrols,
} = require('../controllers/patrolController');

// All routes are protected with authentication
router.use(authenticateToken);

// --- Specific routes must be defined BEFORE general routes like /:id ---

// GET /api/patrols/stats - Get patrol statistics
router.get('/stats', getPatrolStats);

// GET /api/patrols/analytics - Get patrol analytics
router.get('/analytics', getPatrolAnalytics);

// GET /api/patrols/export - Export patrol data
router.get('/export', exportPatrols);

// GET /api/patrols/all - Get all patrols for all rangers
router.get('/all', getAllPatrols);

// GET /api/patrols/ - Get all patrols for the logged-in ranger
// POST /api/patrols/ - Create a new patrol for the logged-in ranger
router.route('/')
  .post(createPatrol)
  .get(getPatrols);

// --- General routes with /:id parameter ---

// GET /api/patrols/:id - Get a specific patrol
// PATCH /api/patrols/:id - Update a specific patrol
// DELETE /api/patrols/:id - Delete a specific patrol
router.route('/:id')
  .get(getPatrol)
  .patch(updatePatrol) // Using PATCH for partial updates
  .delete(deletePatrol);

// PATCH /api/patrols/:id/status - Update the status of a specific patrol
router.patch('/:id/status', updatePatrolStatus);

// PATCH /api/patrols/:id/findings - Add findings to a specific patrol
router.patch('/:id/findings', addFindings);

module.exports = router; 