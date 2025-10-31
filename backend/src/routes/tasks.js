const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats,
  getMyTasks
} = require('../controllers/taskController');

const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  validateCreateTask,
  validateUpdateTask,
  validateComment,
  validateObjectId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Task routes
router.route('/')
  .get(validatePagination, validateSearch, handleValidationErrors, getTasks)
  .post(validateCreateTask, handleValidationErrors, createTask);

router.get('/stats', getTaskStats);
router.get('/my-tasks', validatePagination, handleValidationErrors, getMyTasks);

router.route('/:id')
  .get(validateObjectId, handleValidationErrors, getTask)
  .put(validateObjectId, validateUpdateTask, handleValidationErrors, updateTask)
  .delete(validateObjectId, handleValidationErrors, deleteTask);

router.post('/:id/comments', validateObjectId, validateComment, handleValidationErrors, addComment);

module.exports = router;