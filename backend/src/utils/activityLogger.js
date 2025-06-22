const Activity = require('../models/Activity');

/**
 * Logs an activity to the database.
 * @param {string} message - The human-readable message for the activity.
 * @param {string|null} userId - The ID of the user who performed the action. Can be null for system events.
 * @param {string|null} link - An optional link to the relevant resource.
 */
const logActivity = async (message, userId = null, link = null) => {
  try {
    const activity = new Activity({
      message,
      user: userId,
      link,
    });
    await activity.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Depending on requirements, you might want more robust error handling here
  }
};

module.exports = { logActivity }; 