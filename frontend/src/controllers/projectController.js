const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Researcher/Admin only)
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      objectives,
      startDate,
      endDate,
      location,
      category,
      budget
    } = req.body;

    const project = await Project.create({
      title,
      description,
      objectives,
      startDate,
      endDate,
      location,
      category,
      budget,
      leadResearcher: req.user._id,
      status: 'planning',
      team: [{
        user: req.user._id,
        role: 'Lead Researcher',
        joinedAt: Date.now()
      }]
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const projects = await Project.find(query)
      .populate('leadResearcher', 'name email organization')
      .populate('team.user', 'name email organization')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('leadResearcher', 'name email organization')
      .populate('team.user', 'name email organization')
      .populate('findings.author', 'name email organization');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private (Lead Researcher/Admin only)
const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is lead researcher or admin
    if (project.leadResearcher.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Not authorized to update project status' });
    }

    project.status = status;
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private (Lead Researcher/Admin only)
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is lead researcher or admin
    if (project.leadResearcher.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Not authorized to add team members' });
    }

    // Check if user is already in team
    const isAlreadyMember = project.team.some(member => member.user.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.team.push({
      user: userId,
      role,
      joinedAt: Date.now()
    });

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add finding to project
// @route   POST /api/projects/:id/findings
// @access  Private (Team members only)
const addFinding = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is team member
    const isTeamMember = project.team.some(member => member.user.toString() === req.user._id);
    if (!isTeamMember) {
      return res.status(403).json({ message: 'Not authorized to add findings' });
    }

    project.findings.push({
      title,
      description,
      author: req.user._id,
      date: Date.now()
    });

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/my-projects
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { leadResearcher: req.user._id },
        { 'team.user': req.user._id }
      ]
    })
      .populate('leadResearcher', 'name email organization')
      .populate('team.user', 'name email organization')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProjectStatus,
  addTeamMember,
  addFinding,
  getMyProjects
}; 