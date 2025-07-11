const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProjectStatus,
  addTeamMember,
  addFinding,
  getMyProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getProjects);
router.get('/my-projects', getMyProjects);
router.get('/:id', getProjectById);

// Routes accessible only by researchers and administrators
router.post('/', authorize('researcher', 'administrator'), createProject);
router.put('/:id/status', authorize('researcher', 'administrator'), updateProjectStatus);
router.post('/:id/team', authorize('researcher', 'administrator'), addTeamMember);

// Routes accessible by team members
router.post('/:id/findings', addFinding);

module.exports = router; 