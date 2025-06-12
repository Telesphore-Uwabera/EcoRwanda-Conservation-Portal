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
  skillsRequired: {
    type: [String],
    default: [],
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
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
  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Volunteers who have applied
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
});

// Update `updatedAt` field on save
VolunteerRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VolunteerRequest', VolunteerRequestSchema); 