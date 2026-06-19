const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/member-growth', analyticsController.getMemberGrowthAnalytics);

module.exports = router;
