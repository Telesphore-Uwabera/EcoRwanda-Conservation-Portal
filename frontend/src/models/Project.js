const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  objectives: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'on_hold'],
    default: 'planning'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  category: {
    type: String,
    enum: ['research', 'conservation', 'education', 'community_outreach'],
    required: true
  },
  leadResearcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'link']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  findings: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  budget: {
    total: Number,
    spent: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'RWF'
    }
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 