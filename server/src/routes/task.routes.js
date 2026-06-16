const express = require('express');
const taskController = require('../controllers/task.controller');
const { updateTaskSchema } = require('../validations/task.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/tasks
 * @desc    Fetch global tasks for the tenant dashboard
 * @access  Private
 */
router.get(
  '/',
  taskController.getTasks
);

/**
 * @route   PATCH /api/v1/tasks/:id
 * @desc    Update an existing task (e.g., mark COMPLETED, or reschedule)
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateTaskSchema),
  taskController.updateTask
);

module.exports = router;
