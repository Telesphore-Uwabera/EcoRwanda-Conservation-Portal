const ResearchProject = require('../models/ResearchProject');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

// Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `research-publishings/${Date.now()}_${file.originalname}`);
    },
  }),
});

// Controller to publish a finding (add a document to researchprojects)
const publishFinding = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    // Find the project or create a new one if projectId is not provided
    let project;
    if (projectId) {
      project = await ResearchProject.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
    } else {
      // Create a new project with minimal info
      project = new ResearchProject({
        title: title || 'Untitled Publishing',
        description: description || '',
        objectives: [],
        methodology: '',
        location: { lat: 0, lng: 0, name: '' },
        startDate: new Date(),
        endDate: new Date(),
        leadResearcher: req.user._id,
      });
    }
    // Add the document to the project
    project.documents.push({
      title,
      description,
      fileUrl: file.location,
      uploadedBy: req.user._id,
      fileType: file.mimetype,
      fileSize: file.size,
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
  upload, // Export multer upload for use in routes
}; 