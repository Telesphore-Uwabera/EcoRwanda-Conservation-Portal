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
    try {
      if (typeof location === 'string') parsedLocation = JSON.parse(location);
      if (typeof studyPeriod === 'string') parsedStudyPeriod = JSON.parse(studyPeriod);
      if (typeof keywords === 'string') parsedKeywords = JSON.parse(keywords);
      if (typeof collaborators === 'string') parsedCollaborators = JSON.parse(collaborators);
      if (typeof datasetUrls === 'string') parsedDatasetUrls = JSON.parse(datasetUrls);
      if (typeof publicationUrls === 'string') parsedPublicationUrls = JSON.parse(publicationUrls);
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
        datasetLinks: parsedDatasetUrls,
        publicationLinks: parsedPublicationUrls,
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

module.exports = {
  publishFinding,
}; 