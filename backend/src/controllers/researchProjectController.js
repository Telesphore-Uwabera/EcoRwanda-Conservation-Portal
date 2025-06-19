const ResearchProject = require('../models/ResearchProject');

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
      datasetFileNames = [],
      publicationFileNames = [],
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
    try {
      if (typeof location === 'string') parsedLocation = JSON.parse(location);
      if (typeof studyPeriod === 'string') parsedStudyPeriod = JSON.parse(studyPeriod);
      if (typeof keywords === 'string') parsedKeywords = JSON.parse(keywords);
      if (typeof collaborators === 'string') parsedCollaborators = JSON.parse(collaborators);
      if (typeof datasetFileNames === 'string') datasetFileNames = JSON.parse(datasetFileNames);
      if (typeof publicationFileNames === 'string') publicationFileNames = JSON.parse(publicationFileNames);
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
        objectives: [],
        methodology,
        location: typeof parsedLocation === 'object' ? parsedLocation : { lat: 0, lng: 0, name: parsedLocation },
        startDate: parsedStudyPeriod?.start ? new Date(parsedStudyPeriod.start) : new Date(),
        endDate: parsedStudyPeriod?.end ? new Date(parsedStudyPeriod.end) : new Date(),
        leadResearcher: req.user._id,
        tags: parsedKeywords || [],
        status: 'planning',
      });
    }

    // Add finding (store file names only)
    project.findings.push({
      title,
      description: abstract,
      date: new Date(),
      addedBy: req.user._id,
      attachments: [
        ...datasetFileNames.map(name => ({ fileName: name })),
        ...publicationFileNames.map(name => ({ fileName: name })),
      ],
    });

    // Add documents (store file names only)
    publicationFileNames.forEach(name => {
      project.documents.push({
        title,
        description: abstract,
        fileName: name,
        uploadedBy: req.user._id,
      });
    });

    await project.save();
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error publishing finding:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  publishFinding,
}; 