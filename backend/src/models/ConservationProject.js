const mongoose = require('mongoose');

const ConservationProjectSchema = new mongoose.Schema({
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
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  requiredVolunteers: {
    type: Number,
    required: true,
    min: 1,
  },
  currentVolunteers: {
    type: Number,
    default: 0,
    min: 0,
  },
  impact: {
    treesPlanted: { type: Number, default: 0 },
    wildlifeProtected: { type: Number, default: 0 },
    areaRestored: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  requirements: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'wildlife',
      'forest',
      'water',
      'community',
      'research',
      'climate',
      'agriculture',
      'energy',
      'health',
      'education',
      'technology',
      'other',
    ],
  },
  images: [{
    type: String,
    trim: true,
  }],
  // Research publication fields
  content: {
    type: String,
    trim: true,
  },
  authors: [{
    type: String,
    trim: true,
  }],
  contributors: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
  }],
  publicationDate: {
    type: Date,
  },
  datasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' }],
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
  strict: false,
});

ConservationProjectSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('ConservationProject', ConservationProjectSchema); 