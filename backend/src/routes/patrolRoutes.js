const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createPatrol,
  getPatrols,
  getPatrol,
  updatePatrol,
  deletePatrol
} = require('../controllers/patrolController');

// All routes are protected with authentication
router.use(authenticateToken);

router.route('/')
  .post(createPatrol)
  .get(getPatrols);

router.route('/:id')
  .get(getPatrol)
  .put(updatePatrol)
  .delete(deletePatrol);

module.exports = router; 