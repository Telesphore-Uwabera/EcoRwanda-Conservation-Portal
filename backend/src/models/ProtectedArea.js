const mongoose = require('mongoose');

const ProtectedAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      province: String,
      district: String,
      sector: String,
      cell: String,
    },
  },
  size: {
    value: Number,
    unit: {
      type: String,
      enum: ['hectares', 'square_km'],
      default: 'hectares',
    },
  },
  establishedDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['national_park', 'forest_reserve', 'wildlife_reserve', 'conservation_area', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'proposed', 'under_review', 'inactive'],
    default: 'active',
  },
  biodiversity: {
    species: [{
      name: String,
      scientificName: String,
      category: {
        type: String,
        enum: ['flora', 'fauna'],
      },
      conservationStatus: {
        type: String,
        enum: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered'],
      },
      description: String,
    }],
    ecosystems: [{
      name: String,
      description: String,
      threats: [String],
    }],
  },
  management: {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
      position: String,
    },
    staff: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: String,
      startDate: Date,
    }],
  },
  activities: [{
    type: {
      type: String,
      enum: ['conservation', 'research', 'tourism', 'education', 'monitoring'],
      required: true,
    },
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  threats: [{
    type: {
      type: String,
      enum: ['habitat_loss', 'poaching', 'climate_change', 'invasive_species', 'pollution', 'other'],
      required: true,
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    mitigationMeasures: [String],
    status: {
      type: String,
      enum: ['active', 'mitigated', 'monitoring'],
      default: 'active',
    },
  }],
  resources: [{
    type: {
      type: String,
      enum: ['document', 'image', 'map', 'report', 'other'],
      required: true,
    },
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
  }],
  monitoring: [{
    type: {
      type: String,
      enum: ['biodiversity', 'climate', 'threats', 'visitors', 'other'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    data: mongoose.Schema.Types.Mixed,
    notes: String,
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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

// Create geospatial index for location queries
ProtectedAreaSchema.index({ location: '2dsphere' });

// Update timestamps on save
ProtectedAreaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProtectedArea', ProtectedAreaSchema); 