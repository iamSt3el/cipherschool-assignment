const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a file/folder name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  s3Key: {
    type: String,
    default: null
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
fileSchema.index({ projectId: 1, parentId: 1 });
fileSchema.index({ projectId: 1, type: 1 });

module.exports = mongoose.model('File', fileSchema);
