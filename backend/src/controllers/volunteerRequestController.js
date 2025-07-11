const VolunteerRequest = require('../models/VolunteerRequest');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');
const sendEmail = require('../utils/sendEmail');

// Create a new volunteer request
exports.createVolunteerRequest = async (req, res) => {
  try {
    const {
      researchProject,
      title,
      description,
      objectives,
      skillsRequired,
      preferredSkills,
      location,
      startDate,
      endDate,
      duration,
      timeCommitment,
      difficultyLevel,
      compensation,
      trainingProvided,
      accommodationProvided,
      transportationProvided,
      numberOfVolunteersNeeded,
      applicationDeadline,
    } = req.body;

    // Basic validation
    if (!researchProject || !title || !description || !location || !startDate || !endDate || !numberOfVolunteersNeeded || !applicationDeadline) {
        return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }

    const volunteerRequest = new VolunteerRequest({
      researchProject,
      requestedBy: req.user._id,
      title,
      description,
      objectives,
      skillsRequired,
      preferredSkills,
      location,
      startDate,
      endDate,
      duration,
      timeCommitment,
      difficultyLevel,
      compensation,
      trainingProvided,
      accommodationProvided,
      transportationProvided,
      numberOfVolunteersNeeded,
      applicationDeadline,
    });

    await volunteerRequest.save();

    // Notify relevant users about new request
    const researchers = await User.find({ role: 'researcher' });
    await sendNotification({
      recipients: researchers.map(r => r._id),
      title: 'New Volunteer Request',
      message: `A new volunteer request has been created: ${title}`,
      type: 'volunteer_request',
      link: `/volunteer-requests/${volunteerRequest._id}`,
    });

    res.status(201).json({ success: true, data: volunteerRequest });
  } catch (error) {
    console.error("Create Volunteer Request Error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get all volunteer requests
exports.getVolunteerRequests = async (req, res) => {
  try {
    const queryParams = { ...req.query };
    delete queryParams.populate; // Remove populate from find query

    let query = VolunteerRequest.find(queryParams)
      .populate('researchProject', 'title')
      .populate('requestedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (req.query.populate === 'applications') {
      query = query.populate({
        path: 'applications',
        populate: {
          path: 'applicant',
          select: 'firstName lastName email'
        }
      });
    }

    const requests = await query.exec();

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get a single volunteer request
exports.getVolunteerRequest = async (req, res) => {
  try {
    const request = await VolunteerRequest.findById(req.params.id)
      .populate('researchProject', 'title')
      .populate({
        path: 'applications',
        select: 'applicant' // Select only the applicant field
      })
      .lean(); // Use .lean() to get a plain JS object

    if (!request) {
      return res.status(404).json({ success: false, error: 'Volunteer request not found' });
    }

    // To maintain frontend compatibility for the "already applied" check,
    // we will transform the applications data to a simple array of applicant IDs.
    request.applicants = request.applications ? request.applications.map(app => app.applicant.toString()) : [];

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Error in getVolunteerRequest:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Update a volunteer request
exports.updateVolunteerRequest = async (req, res) => {
  try {
    const request = await VolunteerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Volunteer request not found' });
    }

    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const updatedRequest = await VolunteerRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to a volunteer request
exports.applyToRequest = async (req, res) => {
  try {
    const { coverLetter, portfolioLink } = req.body;
    const requestId = req.params.id;
    const applicantId = req.user._id;

    if (!coverLetter) {
      return res.status(400).json({ success: false, error: 'A cover letter is required.' });
    }

    // Check if the request exists
    const request = await VolunteerRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Check if user has already applied (the db index also prevents this)
    const existingApplication = await Application.findOne({ volunteerRequest: requestId, applicant: applicantId });
    if (existingApplication) {
      return res.status(400).json({ success: false, error: 'You have already applied for this opportunity.' });
    }

    // Create new application
    const newApplication = new Application({
      volunteerRequest: requestId,
      applicant: applicantId,
      coverLetter,
      portfolioLink,
    });
    await newApplication.save();

    // Add application to the volunteer request
    request.applications.push(newApplication._id);
    await request.save();

    // Notify the researcher
    await sendNotification({
        recipients: [request.requestedBy],
        title: 'New Application Received!',
        message: `You have a new application for your request: "${request.title}"`,
        type: 'new_application',
        link: `/requests/${request._id}/applications`, // Future link to view all applications
    });

    // Email to volunteer confirming submission
    try {
    await sendEmail({
        to: req.user.email,
        subject: 'Application Received!',
        html: `
            <h1>Thank You for Applying!</h1>
            <p>We have successfully received your application for the volunteer opportunity: <strong>${request.title}</strong>.</p>
            <p>The research team will review it shortly. You can check the status of your application on your dashboard.</p>
        `,
    });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue without failing the whole request
    }

    res.status(201).json({ success: true, data: newApplication });
  } catch (error) {
    console.error("Application Error:", error);
    if (error.code === 11000) { // Mongo duplicate key error
        return res.status(400).json({ success: false, error: 'You have already applied for this opportunity.' });
    }
    // Return detailed error in development, generic in production
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({ success: false, error: isDev ? (error.message || error.toString()) : 'Server Error during application.' });
  }
};

// Get all applications for a specific request (for researchers)
exports.getApplicationsForRequest = async (req, res) => {
    try {
        const request = await VolunteerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        // Authorization: only the researcher who created the request can see applications
        if (request.requestedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to view these applications.' });
        }

        const applications = await Application.find({ volunteerRequest: req.params.id })
            .populate('applicant', 'firstName lastName email profile.bio profile.skills');
        
        res.status(200).json({ success: true, data: applications });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Accept/Reject an application
exports.handleApplication = async (req, res) => {
  try {
    const { applicationId, action } = req.body; // action: 'accept' or 'reject'

    const application = await Application.findById(applicationId).populate('volunteerRequest');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const request = application.volunteerRequest;

    // Authorization: only the researcher who created the request can handle applications
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to handle this application.' });
    }

    if (action === 'accept') {
      application.status = 'accepted';
    } else if (action === 'reject') {
      application.status = 'rejected';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action.' });
    }

    await application.save();

      // Notify the volunteer
      await sendNotification({
      recipients: [application.applicant],
      title: `Application ${application.status}`,
      message: `Your application for "${request.title}" has been ${application.status}.`,
        type: 'application_status',
      link: `/my-applications`, // Future link for volunteer to see all their applications
    });

    // Email to volunteer about their application status
    const applicant = await User.findById(application.applicant);
    if (applicant) {
      try {
        await sendEmail({
            to: applicant.email,
            subject: `Update on your application for ${request.title}`,
            html: `
                <h1>Application ${application.status}</h1>
                <p>Hi ${applicant.firstName},</p>
                <p>This is an update on your application for the volunteer opportunity: <strong>${request.title}</strong>.</p>
                <p>Your application has been <strong>${application.status}</strong>.</p>
                ${application.status === 'accepted' ? '<p>Congratulations! The research team will be in touch with the next steps.</p>' : '<p>Thank you for your interest. We encourage you to apply for other opportunities in the future.</p>'}
                <p>You can view all your applications on your dashboard.</p>
            `,
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Continue without failing the whole request
      }
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Handle Application Error:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 