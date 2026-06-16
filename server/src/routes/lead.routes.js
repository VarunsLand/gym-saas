const express = require('express');
const leadController = require('../controllers/lead.controller');
const taskController = require('../controllers/task.controller');
const { createLeadSchema, updateLeadSchema } = require('../validations/lead.validation');
const { createTaskSchema } = require('../validations/task.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication strictly to all routes within this module
router.use(requireAuth);

/**
 * @route   GET /api/v1/leads
 * @desc    Fetch all active leads for the current tenant
 * @access  Private
 */
router.get('/', leadController.getLeads);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Fetch a single lead by its UUID
 * @access  Private
 */
router.get('/:id', leadController.getLeadById);

/**
 * @route   POST /api/v1/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post(
  '/',
  validate(createLeadSchema),
  leadController.createLead
);

/**
 * @route   PATCH /api/v1/leads/:id
 * @desc    Update an existing lead
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateLeadSchema),
  leadController.updateLead
);

/**
 * @route   POST /api/v1/leads/:leadId/tasks
 * @desc    Create a new task specifically tied to this lead
 * @access  Private
 */
router.post(
  '/:leadId/tasks',
  validate(createTaskSchema),
  taskController.createTask
);

module.exports = router;
