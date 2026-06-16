const SettingsService = require('../services/settings.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Fetch the active workspace/tenant configuration profile
 * @route   GET /api/v1/settings/profile
 * @access  Private
 */
const getTenantProfile = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;

  const profile = await SettingsService.getTenantProfile(tenantId);

  res.status(200).json({
    status: 'success',
    data: { profile }
  });
});

/**
 * @desc    Update the workspace configuration profile
 * @route   PATCH /api/v1/settings/profile
 * @access  Private (Admin Only logic enforced by Service)
 */
const updateTenantProfile = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const requesterRole = req.user.role;

  const profile = await SettingsService.updateTenantProfile(tenantId, requesterRole, req.body);

  res.status(200).json({
    status: 'success',
    data: { profile }
  });
});

/**
 * @desc    Fetch all active custom lead sources for drop-downs
 * @route   GET /api/v1/settings/lead-sources
 * @access  Private
 */
const getLeadSources = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;

  const sources = await SettingsService.getLeadSources(tenantId);

  res.status(200).json({
    status: 'success',
    results: sources.length,
    data: { sources }
  });
});

/**
 * @desc    Create a new custom lead source
 * @route   POST /api/v1/settings/lead-sources
 * @access  Private (Admin Only logic enforced by Service)
 */
const createLeadSource = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const requesterRole = req.user.role;

  const source = await SettingsService.createLeadSource(tenantId, requesterRole, req.body);

  res.status(201).json({
    status: 'success',
    data: { source }
  });
});

module.exports = {
  getTenantProfile,
  updateTenantProfile,
  getLeadSources,
  createLeadSource
};
