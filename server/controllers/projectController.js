const Project = require('../models/Project');
const File = require('../models/File');
const { deleteManyFromS3 } = require('../config/s3');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, template } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project name'
      });
    }

    const project = await Project.create({
      userId: req.user._id,
      name,
      description: description || '',
      template: template || 'react'
    });

    // Create root folder for the project
    await File.create({
      projectId: project._id,
      parentId: null,
      name: name,
      type: 'folder'
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ lastModified: -1 });

    // Get file count for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const fileCount = await File.countDocuments({
          projectId: project._id,
          type: 'file'
        });

        return {
          ...project.toObject(),
          fileCount
        };
      })
    );

    res.json({
      success: true,
      count: projects.length,
      data: projectsWithStats
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    // Get all files/folders for the project
    const files = await File.find({ projectId: project._id });

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        files
      }
    });
  } catch (error) {
    console.error('Get Project Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { name, description } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    project.lastModified = new Date();

    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Get all files associated with the project
    const files = await File.find({ projectId: project._id });

    // Delete files from S3
    const s3Keys = files
      .filter(file => file.s3Key)
      .map(file => file.s3Key);

    if (s3Keys.length > 0) {
      try {
        await deleteManyFromS3(s3Keys);
      } catch (s3Error) {
        console.error('S3 Delete Error:', s3Error);
        // Continue with deletion even if S3 fails
      }
    }

    // Delete all files/folders from database
    await File.deleteMany({ projectId: project._id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject
};
