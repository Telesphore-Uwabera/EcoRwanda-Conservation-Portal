const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true,
  },
  dataRetentionDays: {
    type: Number,
    default: 365,
  },
  enableTwoFactorAuth: {
    type: Boolean,
    default: false,
  },
  maxFileUploadSizeMB: {
    type: Number,
    default: 10,
  },
  allowedFileTypes: {
    type: String,
    default: '.jpg, .jpeg, .png, .pdf',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  contactEmail: {
    type: String,
    default: 'support@ecorwanda.org',
  },
  welcomeBannerMessage: {
    type: String,
    default: 'Welcome to EcoRwanda Conservation Portal!',
  },
  mapProviderApiKey: {
    type: String,
    default: 'YOUR_MAP_API_KEY',
  },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting; 