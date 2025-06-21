const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  volunteerRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VolunteerRequest',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    required: [true, 'A cover letter is required.'],
    trim: true,
  },
  portfolioLink: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only apply once to the same request
ApplicationSchema.index({ volunteerRequest: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema); 