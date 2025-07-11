const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAvailableProjects,
  publishResearchPaper
} = require('../controllers/conservationProjectController');
const ConservationProject = require('../models/ConservationProject');

// Get all conservation projects
router.get('/', authenticateToken, getAllProjects);

// Get available projects
router.get('/available', authenticateToken, getAvailableProjects);

// Get publications
router.get('/publications', async (req, res) => {
  try {
    console.log("Fetching publications...");
    const publications = await ConservationProject.find({ status: { $in: ['completed', 'published'] } })
      .sort({ publicationDate: -1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('owners', 'name email');
    console.log("Found publications:", publications);
    res.json({ success: true, data: publications });
  } catch (err) {
    console.error('Error in /publications:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch publications.' });
  }
});

// Get a single project
router.get('/:id', authenticateToken, getProjectById);

// Create a new project
router.post('/', authenticateToken, createProject);

// Update a project
router.put('/:id', authenticateToken, updateProject);

// Delete a project
router.delete('/:id', authenticateToken, deleteProject);

// Publish a research paper as a completed conservation project
router.post('/publish', authenticateToken, publishResearchPaper);

module.exports = router; 
