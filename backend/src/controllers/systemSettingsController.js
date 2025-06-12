const Setting = require('../models/Setting');

const getSystemSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // If no settings exist, create default ones
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const { registrationOpen, emailNotificationsEnabled, dataRetentionDays, enableTwoFactorAuth, maxFileUploadSizeMB, allowedFileTypes, maintenanceMode, contactEmail, welcomeBannerMessage } = req.body;

    const updatedSettings = await Setting.findOneAndUpdate(
      {},
      {
        registrationOpen,
        emailNotificationsEnabled,
        dataRetentionDays,
        enableTwoFactorAuth,
        maxFileUploadSizeMB,
        allowedFileTypes,
        maintenanceMode,
        contactEmail,
        welcomeBannerMessage,
      },
      { new: true, upsert: true } // Return the updated document, create if it doesn't exist
    );

    res.status(200).json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
}; 