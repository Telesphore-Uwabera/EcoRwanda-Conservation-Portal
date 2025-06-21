const VolunteerRequest = require('../models/VolunteerRequest');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');

// Create a new volunteer request
exports.createVolunteerRequest = async (req, res) => {
  try {
    const {
      researchProject,
      title,
      description,
      skillsRequired,
      location, // Expecting an object { name, lat, lng }
      startDate,
      endDate,
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
      skillsRequired,
      location, // Storing the location object directly
      startDate,
      endDate,
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
    const requests = await VolunteerRequest.find(req.query)
      .populate('researchProject', 'title')
      .sort({ createdAt: -1 });

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
      .populate('applicants', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ success: false, error: 'Volunteer request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
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
        const request = await VolunteerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        if (request.applicants.includes(req.user._id)) {
            return res.status(400).json({ success: false, error: 'You have already applied' });
        }
        request.applicants.push(req.user._id);
        await request.save();
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Accept/Reject an application
exports.handleApplication = async (req, res) => {
  try {
    const { applicationId, action } = req.body;
    const request = await VolunteerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Volunteer request not found' });
    }

    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to handle applications' });
    }

    const applicant = await User.findById(applicationId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    if (action === 'accept') {
      // Add to accepted volunteers
      request.acceptedVolunteers = request.acceptedVolunteers || [];
      request.acceptedVolunteers.push(applicationId);
      
      // Remove from applicants
      request.applicants = request.applicants.filter(
        id => id.toString() !== applicationId.toString()
      );

      // Notify the volunteer
      await sendNotification({
        recipients: [applicationId],
        title: 'Application Accepted',
        message: `Your application for "${request.title}" has been accepted!`,
        type: 'application_status',
        link: `/volunteer-requests/${request._id}`,
      });
    } else if (action === 'reject') {
      // Remove from applicants
      request.applicants = request.applicants.filter(
        id => id.toString() !== applicationId.toString()
      );

      // Notify the volunteer
      await sendNotification({
        recipients: [applicationId],
        title: 'Application Rejected',
        message: `Your application for "${request.title}" has been rejected.`,
        type: 'application_status',
        link: `/volunteer-requests/${request._id}`,
      });
    }

    await request.save();
    res.json({ message: `Application ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 