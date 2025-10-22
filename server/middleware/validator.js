const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidationRules = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// Project validation rules
const projectValidationRules = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Project name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('template')
      .optional()
      .isIn(['react', 'vanilla', 'vue', 'angular', 'node'])
      .withMessage('Invalid template type')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Project name cannot be empty')
      .isLength({ min: 1, max: 100 })
      .withMessage('Project name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
  ]
};

// File validation rules
const fileValidationRules = {
  create: [
    body('projectId')
      .notEmpty()
      .withMessage('Project ID is required')
      .isMongoId()
      .withMessage('Invalid project ID'),
    body('parentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('File/folder name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(['file', 'folder'])
      .withMessage('Type must be either "file" or "folder"'),
    body('content')
      .optional()
      .isString()
      .withMessage('Content must be a string'),
    body('language')
      .optional()
      .isString()
      .withMessage('Language must be a string')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters'),
    body('content')
      .optional()
      .isString()
      .withMessage('Content must be a string'),
    body('language')
      .optional()
      .isString()
      .withMessage('Language must be a string')
  ]
};

module.exports = {
  validate,
  userValidationRules,
  projectValidationRules,
  fileValidationRules
};
