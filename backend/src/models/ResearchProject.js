const mongoose = require('mongoose');

const ResearchProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    // This field stores the publication abstract (called 'abstract' in API/frontend)
  },
  objectives: [{
    type: String,
    required: true,
  }],
  methodology: {
    type: String,
    required: true,
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
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning',
  },
  leadResearcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['researcher', 'volunteer', 'assistant'],
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  documents: [{
    title: String,
    description: String,
    fileUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    fileType: String,
    fileSize: Number,
  }],
  findings: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [{
      fileUrl: String,
      fileType: String,
      fileSize: Number,
    }],
  }],
  budget: {
    total: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'RWF',
    },
  },
  tags: [{
    type: String,
  }],
  datasetLinks: [{
    type: String,
  }],
  publicationLinks: [{
    type: String,
  }],
  references: [{
    type: String,
  }],
  keywords: [{
    type: String,
  }],
  supplementaryFiles: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
ResearchProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ResearchProject', ResearchProjectSchema); 