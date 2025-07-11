const ConservationProject = require('../models/ConservationProject');
const mongoose = require('mongoose');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ConservationProject.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get available projects (active and not full)
exports.getAvailableProjects = async (req, res) => {
  try {
    const projects = await ConservationProject.find({
      status: 'active',
      $expr: { $lt: ['$currentVolunteers', '$requiredVolunteers'] }
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error('Error in getAvailableProjects:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await ConservationProject.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('volunteers');
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const project = await ConservationProject.create({
      ...req.body,
      createdBy: req.user._id,
      currentVolunteers: 0
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await ConservationProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Check if user has permission to update
    if (project.createdBy.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
    }
    
    Object.assign(project, req.body);
    await project.save();
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Join a project
exports.joinProject = async (req, res) => {
  try {
    const project = await ConservationProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if project is still accepting volunteers
    if (project.currentVolunteers >= project.requiredVolunteers) {
      return res.status(400).json({ success: false, error: 'Project has reached maximum volunteers' });
    }

    // Check if user is already a volunteer
    if (project.volunteers.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Already joined this project' });
    }

    // Add user to volunteers and increment currentVolunteers
    project.volunteers.push(req.user.id);
    project.currentVolunteers += 1;
    await project.save();
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Leave a project
exports.leaveProject = async (req, res) => {
  try {
    const project = await ConservationProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if user is a volunteer
    if (!project.volunteers.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Not a volunteer in this project' });
    }

    // Remove user from volunteers and decrement currentVolunteers
    project.volunteers = project.volunteers.filter(v => v.toString() !== req.user.id);
    project.currentVolunteers -= 1;
    await project.save();
    
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await ConservationProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Check if user has permission to delete
    if (project.createdBy.toString() !== req.user._id && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Publish a research paper as a completed conservation project
exports.publishResearchPaper = async (req, res) => {
  console.log('REQ.BODY:', req.body);
  try {
    const {
      title,
      description,
      organization,
      location,
      abstract,
      authors,
      publicationDate,
      startDate,
      endDate,
      accessLevel,
      category,
      images,
      doi,
      methodology,
      fundingSource,
      ethicalApproval,
      publicationLink,
      contributors,
      references,
      keywords,
      supplementaryFiles,
      datasets,
      impact
    } = req.body;

    if (!title || !description || !organization || !location || !abstract || !authors || !publicationDate || !category) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    let owners = [];
    if (Array.isArray(req.body.authorsUserIds) && req.body.authorsUserIds.length > 0) {
      owners = req.body.authorsUserIds;
    } else if (req.body.owner) {
      owners = [req.body.owner];
    } else if (req.user && req.user._id) {
      owners = [req.user._id];
    }

    const project = await ConservationProject.create({
      title,
      description,
      organization,
      location,
      abstract,
      authors,
      publicationDate,
      startDate,
      endDate,
      accessLevel: accessLevel || 'open',
      category,
      images: images || [],
      status: 'completed',
      createdBy: req.user._id,
      requiredVolunteers: 1, // default value
      currentVolunteers: 0,
      datasets: datasets || [],
      references: references || [],
      supplementaryFiles: supplementaryFiles || [],
      keywords: keywords || [],
      doi: doi || '',
      methodology: methodology || '',
      fundingSource: fundingSource || '',
      ethicalApproval: ethicalApproval || '',
      publicationLink: publicationLink || '',
      contributors: contributors || [],
      impact: impact || { treesPlanted: 0, wildlifeProtected: 0, areaRestored: 0 },
      owners: owners,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in publishResearchPaper:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 