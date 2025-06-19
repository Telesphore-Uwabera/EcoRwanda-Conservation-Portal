const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAvailableProjects
} = require('../controllers/conservationProjectController');

// Get all conservation projects
router.get('/', authenticateToken, getAllProjects);

// Get available projects
router.get('/available', authenticateToken, getAvailableProjects);

// Get a single project
router.get('/:id', authenticateToken, getProjectById);

// Create a new project
router.post('/', authenticateToken, createProject);

// Update a project
router.put('/:id', authenticateToken, updateProject);

// Delete a project
router.delete('/:id', authenticateToken, deleteProject);

module.exports = router; 