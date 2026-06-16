const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { updateTenantProfileSchema, createLeadSourceSchema } = require('../validations/settings.validation');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const router = express.Router();

// Apply base authentication middleware to all settings routes
router.use(requireAuth);

/**
 * @route   GET /api/v1/settings/profile
 * @desc    Fetch the active workspace configuration profile
 * @access  Private
 */
router.get(
  '/profile', 
  settingsController.getTenantProfile
);

/**
 * @route   PATCH /api/v1/settings/profile
 * @desc    Update workspace configuration profile
 * @access  Private (Admin Only)
 */
router.patch(
  '/profile',
  requireAdmin,
  validate(updateTenantProfileSchema),
  settingsController.updateTenantProfile
);

/**
 * @route   GET /api/v1/settings/lead-sources
 * @desc    Fetch all active custom lead sources for the workspace
 * @access  Private
 */
router.get(
  '/lead-sources', 
  settingsController.getLeadSources
);

/**
 * @route   POST /api/v1/settings/lead-sources
 * @desc    Create a new custom lead source
 * @access  Private (Admin Only)
 */
router.post(
  '/lead-sources',
  requireAdmin,
  validate(createLeadSourceSchema),
  settingsController.createLeadSource
);

module.exports = router;
