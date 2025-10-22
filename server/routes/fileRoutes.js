const express = require('express');
const router = express.Router();
const {
  createFile,
  getFileById,
  getFilesByProject,
  updateFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createFile);

router.route('/project/:projectId')
  .get(getFilesByProject);

router.route('/:id')
  .get(getFileById)
  .put(updateFile)
  .delete(deleteFile);

module.exports = router;
