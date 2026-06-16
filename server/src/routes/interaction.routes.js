const express = require('express');
const interactionController = require('../controllers/interaction.controller');
const { createInteractionSchema } = require('../validations/interaction.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all interaction routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/leads/:leadId/interactions
 * @desc    Fetch all historical interactions for a specific lead
 * @access  Private
 */
router.get(
  '/:leadId/interactions',
  interactionController.getInteractionsByLeadId
);

/**
 * @route   POST /api/v1/leads/:leadId/interactions
 * @desc    Create a new interaction record for a specific lead
 * @access  Private
 */
router.post(
  '/:leadId/interactions',
  validate(createInteractionSchema),
  interactionController.createInteraction
);

module.exports = router;
