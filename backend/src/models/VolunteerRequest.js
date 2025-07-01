const mongoose = require('mongoose');

const VolunteerRequestSchema = new mongoose.Schema({
  researchProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchProject',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The researcher making the request
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  objectives: {
    type: [String],
    default: [],
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  preferredSkills: {
    type: [String],
    default: [],
  },
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    name: { type: String, required: true },
  },
  duration: {
    type: String, // e.g., "3 weeks", "2 months"
  },
  timeCommitment: {
    type: String, // e.g., "10 hours/week"
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
  compensation: {
    type: String,
  },
  trainingProvided: {
    type: Boolean,
    default: false,
  },
  accommodationProvided: {
    type: Boolean,
    default: false,
  },
  transportationProvided: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  numberOfVolunteersNeeded: {
    type: Number,
    required: true,
    min: 1,
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
  ],
  status: {
    type: String,
    enum: ['open', 'closed', 'in-progress', 'completed'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  support: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
});

// Update `updatedAt` field on save
VolunteerRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VolunteerRequest', VolunteerRequestSchema); 