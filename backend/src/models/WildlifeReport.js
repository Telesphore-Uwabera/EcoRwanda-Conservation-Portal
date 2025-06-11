const mongoose = require('mongoose');

const WildlifeReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
  },
  photos: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ['poaching', 'habitat_destruction', 'wildlife_sighting', 'human_wildlife_conflict', 'other'],
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'investigating', 'resolved'],
    default: 'pending',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  verifiedAt: {
    type: Date,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('WildlifeReport', WildlifeReportSchema); 