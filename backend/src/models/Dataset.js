const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const datasetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: locationSchema, required: true },
  accessLevel: { type: String, enum: ['open', 'restricted', 'upon_request'], default: 'open' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  researchType: { type: String },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'ConservationProject' },
  downloadUrl: { type: String },
});

module.exports = mongoose.model('Dataset', datasetSchema); 