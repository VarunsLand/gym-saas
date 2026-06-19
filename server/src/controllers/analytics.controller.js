const AnalyticsService = require('../services/analytics.service');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const analytics = await AnalyticsService.getDashboardAnalytics(req.user.tenant_id, startDate, endDate);
  
  res.status(200).json({
    status: 'success',
    data: analytics
  });
});
exports.getMemberGrowthAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate, groupBy } = req.query;
  const analytics = await AnalyticsService.getMemberGrowthAnalytics(req.user.tenant_id, startDate, endDate, groupBy);
  
  res.status(200).json({
    status: 'success',
    data: analytics
  });
});
