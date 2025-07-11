const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add other volunteer-specific fields here
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Volunteer', VolunteerSchema); 