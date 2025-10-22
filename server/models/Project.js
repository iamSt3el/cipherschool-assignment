const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  template: {
    type: String,
    enum: ['react', 'vanilla', 'vue', 'angular', 'node'],
    default: 'react'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
projectSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
