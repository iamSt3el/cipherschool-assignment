const express = require('express');
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createProject)
  .get(getUserProjects);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
