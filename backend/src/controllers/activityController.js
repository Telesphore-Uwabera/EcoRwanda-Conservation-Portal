const Activity = require('../models/Activity');

exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20) // Get the last 20 activities
      .populate('user', 'firstName lastName role'); // Populate user details

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 