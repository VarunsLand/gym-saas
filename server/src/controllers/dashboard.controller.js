const DashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get high-level KPIs for the tenant dashboard
 * @route   GET /api/v1/dashboard/metrics
 * @access  Private
 */
const getDashboardMetrics = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;

  const metrics = await DashboardService.getDashboardMetrics(tenantId);

  res.status(200).json({
    status: 'success',
    data: { metrics }
  });
});

/**
 * @desc    Get recent global timeline activity across all leads
 * @route   GET /api/v1/dashboard/activity
 * @access  Private
 */
const getRecentActivity = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  // Sanitize and bound the optional limit parameter (max 100)
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = (!isNaN(rawLimit) && rawLimit > 0 && rawLimit <= 100) ? rawLimit : undefined;

  const activity = await DashboardService.getRecentActivity(tenantId, limit);

  res.status(200).json({
    status: 'success',
    results: activity.length,
    data: { activity }
  });
});

module.exports = {
  getDashboardMetrics,
  getRecentActivity
};
