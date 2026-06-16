const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Ensure all dashboard endpoints require a valid authenticated session
router.use(requireAuth);

/**
 * @route   GET /api/v1/dashboard/metrics
 * @desc    Fetch high-level KPIs for the tenant dashboard
 * @access  Private
 */
router.get('/metrics', dashboardController.getDashboardMetrics);

/**
 * @route   GET /api/v1/dashboard/activity
 * @desc    Fetch recent global timeline activity across all leads
 * @access  Private
 */
router.get('/activity', dashboardController.getRecentActivity);

module.exports = router;
