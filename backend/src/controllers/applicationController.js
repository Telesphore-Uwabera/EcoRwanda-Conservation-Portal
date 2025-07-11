const Application = require('../models/Application');

// Get all applications submitted by the logged-in user
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'volunteerRequest',
        select: 'title', // Only get the title of the request
      })
      .sort({ submittedAt: -1 });

    if (!applications) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching user's applications:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 