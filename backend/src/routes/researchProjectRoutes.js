const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
  createResearchProject,
  getAllResearchProjects,
  getResearchProjectById,
  updateResearchProject,
  deleteResearchProject,
  getProjectsByUser,
} = require('../controllers/researchProjectController');

// Public routes
router.get('/user/:userId', authenticateToken, getProjectsByUser);
router.get('/', getAllResearchProjects);
router.get('/:id', getResearchProjectById);

// Protected routes (for logged-in users)
router.post('/', authenticateToken, createResearchProject);

// Admin or Author protected routes
router.put('/:id', authenticateToken, updateResearchProject); // Additional checks inside controller
router.delete('/:id', authenticateToken, deleteResearchProject); // Additional checks inside controller

module.exports = router; 