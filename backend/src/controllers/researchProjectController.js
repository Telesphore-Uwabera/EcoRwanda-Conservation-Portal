const ResearchProject = require('../models/ResearchProject');
const { sendNotification } = require('../utils/notifications');

// Controller to publish a finding (add a finding and documents to researchprojects)
const publishFinding = async (req, res) => {
  try {
    // Parse fields from form-data or JSON
    const {
      title,
      abstract,
      category,
      methodology,
      findings,
      implications,
      acknowledgments,
      location,
      studyPeriod,
      keywords,
      collaborators,
      fundingSource,
      ethicalApproval,
      dataAvailability,
      license,
      projectId,
      datasetUrls = [],
      publicationUrls = [],
      references = [],
      supplementaryFiles = [],
      objectives = [],
      status = 'planning',
      budget = { total: 0, spent: 0, currency: 'RWF' },
      images = [],
      teamMembers = [],
    } = req.body;

    // Validate required fields
    if (!title || !abstract || !category || !methodology || !findings || !location) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Parse location and studyPeriod if sent as JSON strings
    let parsedLocation = location;
    let parsedStudyPeriod = studyPeriod;
    let parsedKeywords = keywords;
    let parsedCollaborators = collaborators;
    let parsedDatasetUrls = datasetUrls;
    let parsedPublicationUrls = publicationUrls;
    let parsedReferences = references;
    let parsedSupplementaryFiles = supplementaryFiles;
    try {
      if (typeof location === 'string') parsedLocation = JSON.parse(location);
      if (typeof studyPeriod === 'string') parsedStudyPeriod = JSON.parse(studyPeriod);
      if (typeof keywords === 'string') parsedKeywords = JSON.parse(keywords);
      if (typeof collaborators === 'string') parsedCollaborators = JSON.parse(collaborators);
      if (typeof datasetUrls === 'string') parsedDatasetUrls = JSON.parse(datasetUrls);
      if (typeof publicationUrls === 'string') parsedPublicationUrls = JSON.parse(publicationUrls);
      if (typeof references === 'string') parsedReferences = JSON.parse(references);
      if (typeof supplementaryFiles === 'string') parsedSupplementaryFiles = JSON.parse(supplementaryFiles);
    } catch (e) {
      // Ignore parse errors, fallback to raw values
    }

    // Find the project or create a new one if projectId is not provided
    let project;
    if (projectId) {
      project = await ResearchProject.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
    } else {
      // Create a new project with all required info
      project = new ResearchProject({
        title,
        description: abstract,
        objectives: objectives,
        methodology,
        location: typeof parsedLocation === 'object' ? parsedLocation : { lat: 0, lng: 0, name: parsedLocation },
        startDate: parsedStudyPeriod?.start ? new Date(parsedStudyPeriod.start) : new Date(),
        endDate: parsedStudyPeriod?.end ? new Date(parsedStudyPeriod.end) : new Date(),
        leadResearcher: req.user._id,
        tags: parsedKeywords || [],
        status: status,
        budget: budget,
        images: images,
        teamMembers: teamMembers,
        datasetLinks: parsedDatasetUrls,
        publicationLinks: parsedPublicationUrls,
        references: parsedReferences || [],
        keywords: parsedKeywords || [],
        supplementaryFiles: parsedSupplementaryFiles || [],
      });
    }

    // If editing an existing project, update datasetLinks and publicationLinks
    if (projectId) {
      project.datasetLinks = parsedDatasetUrls;
      project.publicationLinks = parsedPublicationUrls;
    }

    // Add finding (store file URLs)
    project.findings.push({
      title,
      description: abstract,
      date: new Date(),
      addedBy: req.user._id,
      attachments: [
        ...parsedDatasetUrls.map(url => ({ fileUrl: url })),
        ...parsedPublicationUrls.map(url => ({ fileUrl: url })),
      ],
    });

    // Add documents (store file URLs)
    parsedPublicationUrls.forEach(url => {
      project.documents.push({
        title,
        description: abstract,
        fileUrl: url,
        uploadedBy: req.user._id,
      });
    });

    await project.save();

    // Send notification (placeholder)
    sendNotification({
      recipients: [req.user._id],
      title: 'Research Finding Published',
      message: `A new research finding has been published: ${title}`,
      type: 'research_finding',
      link: `/researchprojects/${project._id}`,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error publishing finding:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new research project
// @route   POST /api/researchprojects
// @access  Private (Researcher)
exports.createResearchProject = async (req, res) => {
  try {
    const {
      title,
      abstract,
      objectives = [],
      location = { name: '', lat: '', lng: '' },
      tags = [],
      status = 'planning',
      publicationLinks = [],
      budget = { total: 0, spent: 0, currency: 'RWF' },
      images = [],
      teamMembers = [],
    } = req.body;

    const project = new ResearchProject({
      title,
      description: abstract,
      objectives: objectives,
      methodology: req.body.methodology,
      location: typeof location === 'object' ? location : { lat: 0, lng: 0, name: location },
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      endDate: req.body.endDate ? new Date(req.body.endDate) : new Date(),
      leadResearcher: req.user._id,
      tags: tags,
      status: status,
      budget: budget,
      images: images,
      teamMembers: teamMembers,
      datasetLinks: req.body.datasetLinks || [],
      publicationLinks: publicationLinks,
      references: req.body.references || [],
      keywords: req.body.keywords || [],
      supplementaryFiles: req.body.supplementaryFiles || [],
    });
    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all research projects
// @route   GET /api/researchprojects
// @access  Public
exports.getAllResearchProjects = async (req, res) => {
  try {
    const projects = await ResearchProject.find().populate('leadResearcher', 'firstName lastName email');
    // Add ownerEmail to each project
    const projectsWithOwnerEmail = projects.map(project => {
      const ownerEmail = project.leadResearcher && project.leadResearcher.email ? project.leadResearcher.email : undefined;
      return { ...project.toObject(), ownerEmail };
    });
    res.status(200).json({ success: true, data: projectsWithOwnerEmail });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get research projects for a specific user
// @route   GET /api/researchprojects/user/:userId
// @access  Private
exports.getProjectsByUser = async (req, res) => {
    try {
        // Ensure the requester is the user themselves or an admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'administrator') {
            return res.status(403).json({ success: false, error: 'Not authorized to access these projects' });
        }
        const projects = await ResearchProject.find({ leadResearcher: req.params.userId });
        if (!projects) {
            return res.status(404).json({ success: false, error: 'No projects found for this user' });
        }
        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get a single research project by ID
// @route   GET /api/researchprojects/:id
// @access  Public
exports.getResearchProjectById = async (req, res) => {
  try {
    const project = await ResearchProject.findById(req.params.id).populate('leadResearcher', 'firstName lastName email');
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const ownerEmail = project.leadResearcher && project.leadResearcher.email ? project.leadResearcher.email : undefined;
    res.status(200).json({ success: true, data: { ...project.toObject(), ownerEmail } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a research project
// @route   PUT /api/researchprojects/:id
// @access  Private (Author or Admin)
exports.updateResearchProject = async (req, res) => {
  try {
    let project = await ResearchProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if the user is the author or an admin
    if (project.leadResearcher.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
        return res.status(401).json({ success: false, error: 'User not authorized to update this project' });
    }

    project = await ResearchProject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a research project
// @route   DELETE /api/researchprojects/:id
// @access  Private (Author or Admin)
exports.deleteResearchProject = async (req, res) => {
  try {
    const project = await ResearchProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.leadResearcher.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
        return res.status(401).json({ success: false, error: 'User not authorized to delete this project' });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  publishFinding,
  createResearchProject: exports.createResearchProject,
  getAllResearchProjects: exports.getAllResearchProjects,
  getProjectsByUser: exports.getProjectsByUser,
  getResearchProjectById: exports.getResearchProjectById,
  updateResearchProject: exports.updateResearchProject,
  deleteResearchProject: exports.deleteResearchProject,
}; 