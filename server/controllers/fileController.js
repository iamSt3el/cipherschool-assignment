const File = require('../models/File');
const Project = require('../models/Project');
const { uploadToS3, getFromS3, deleteFromS3, deleteManyFromS3 } = require('../config/s3');

// Helper function to check project ownership
const checkProjectOwnership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  if (project.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized to access this project');
  }
  return project;
};

// Helper function to recursively get all child file IDs
const getAllChildFileIds = async (fileId) => {
  const children = await File.find({ parentId: fileId });
  let allIds = [fileId];

  for (const child of children) {
    if (child.type === 'folder') {
      const childIds = await getAllChildFileIds(child._id);
      allIds = allIds.concat(childIds);
    } else {
      allIds.push(child._id);
    }
  }

  return allIds;
};

// @desc    Create a new file or folder
// @route   POST /api/files
// @access  Private
const createFile = async (req, res) => {
  try {
    const { projectId, parentId, name, type, content, language } = req.body;

    if (!projectId || !name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, name, and type'
      });
    }

    // Check project ownership
    await checkProjectOwnership(projectId, req.user._id);

    // Verify parent exists if parentId is provided
    if (parentId) {
      const parent = await File.findById(parentId);
      if (!parent || parent.type !== 'folder') {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent folder'
        });
      }
    }

    let s3Key = null;
    let fileContent = content || '';

    // If it's a file, upload to S3
    if (type === 'file' && content) {
      s3Key = `projects/${projectId}/${parentId || 'root'}/${Date.now()}-${name}`;
      try {
        await uploadToS3(s3Key, content, 'text/plain');
      } catch (s3Error) {
        console.error('S3 Upload Error:', s3Error);
        // Continue without S3, store in MongoDB
        s3Key = null;
      }
    }

    const file = await File.create({
      projectId,
      parentId: parentId || null,
      name,
      type,
      s3Key,
      content: s3Key ? '' : fileContent, // Store in DB only if S3 failed
      language: language || 'javascript'
    });

    // Update project's lastModified
    await Project.findByIdAndUpdate(projectId, { lastModified: new Date() });

    res.status(201).json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Create File Error:', error);
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get file/folder by ID
// @route   GET /api/files/:id
// @access  Private
const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check project ownership
    await checkProjectOwnership(file.projectId, req.user._id);

    // If file has S3 key, get content from S3
    if (file.type === 'file' && file.s3Key) {
      try {
        const s3Content = await getFromS3(file.s3Key);
        file.content = s3Content;
      } catch (s3Error) {
        console.error('S3 Get Error:', s3Error);
        // Return file without content if S3 fails
      }
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Get File Error:', error);
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all files/folders in a project or folder
// @route   GET /api/files/project/:projectId
// @access  Private
const getFilesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { parentId } = req.query;

    // Check project ownership
    await checkProjectOwnership(projectId, req.user._id);

    const query = { projectId };

    if (parentId) {
      query.parentId = parentId;
    } else if (parentId === 'null' || parentId === undefined) {
      // Get root level files - don't filter by parentId to get ALL files
      // This allows building the complete file tree
      delete query.parentId;
    }

    const files = await File.find(query).sort({ type: -1, name: 1 }); // Folders first, then alphabetically

    // Fetch content from S3 for files that have s3Key
    const filesWithContent = await Promise.all(
      files.map(async (file) => {
        const fileObj = file.toObject();

        // If file has S3 key, get content from S3
        if (fileObj.type === 'file' && fileObj.s3Key) {
          try {
            const s3Content = await getFromS3(fileObj.s3Key);
            fileObj.content = s3Content;
          } catch (s3Error) {
            console.error('S3 Get Error for file:', fileObj.name, s3Error.message);
            // Keep empty content if S3 fails
          }
        }

        return fileObj;
      })
    );

    res.json({
      success: true,
      count: filesWithContent.length,
      data: filesWithContent
    });
  } catch (error) {
    console.error('Get Files Error:', error);
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update file/folder
// @route   PUT /api/files/:id
// @access  Private
const updateFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check project ownership
    await checkProjectOwnership(file.projectId, req.user._id);

    const { name, content, language } = req.body;

    if (name) file.name = name;
    if (language) file.language = language;

    // Update content for files
    if (file.type === 'file' && content !== undefined) {
      if (file.s3Key) {
        // Update in S3
        try {
          await uploadToS3(file.s3Key, content, 'text/plain');
        } catch (s3Error) {
          console.error('S3 Update Error:', s3Error);
          // Fall back to MongoDB
          file.content = content;
          file.s3Key = null;
        }
      } else {
        // Update in MongoDB
        file.content = content;
      }
    }

    file.updatedAt = new Date();
    await file.save();

    // Update project's lastModified
    await Project.findByIdAndUpdate(file.projectId, { lastModified: new Date() });

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Update File Error:', error);
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete file/folder
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check project ownership
    await checkProjectOwnership(file.projectId, req.user._id);

    // If it's a folder, recursively delete all children
    if (file.type === 'folder') {
      const allFileIds = await getAllChildFileIds(file._id);
      const allFiles = await File.find({ _id: { $in: allFileIds } });

      // Collect S3 keys to delete
      const s3Keys = allFiles
        .filter(f => f.s3Key)
        .map(f => f.s3Key);

      // Delete from S3
      if (s3Keys.length > 0) {
        try {
          await deleteManyFromS3(s3Keys);
        } catch (s3Error) {
          console.error('S3 Delete Error:', s3Error);
          // Continue with deletion even if S3 fails
        }
      }

      // Delete all files from database
      await File.deleteMany({ _id: { $in: allFileIds } });
    } else {
      // Delete single file
      if (file.s3Key) {
        try {
          await deleteFromS3(file.s3Key);
        } catch (s3Error) {
          console.error('S3 Delete Error:', s3Error);
          // Continue with deletion even if S3 fails
        }
      }

      await File.findByIdAndDelete(req.params.id);
    }

    // Update project's lastModified
    await Project.findByIdAndUpdate(file.projectId, { lastModified: new Date() });

    res.json({
      success: true,
      message: 'File/folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete File Error:', error);
    res.status(error.message.includes('authorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  createFile,
  getFileById,
  getFilesByProject,
  updateFile,
  deleteFile
};
