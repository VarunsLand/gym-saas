const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const taskRoutes = require('./task.routes');
const interactionRoutes = require('./interaction.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const saleRoutes = require('./sale.routes');
const expenseRoutes = require('./expense.routes');

const router = express.Router();

// Mount all module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/leads', interactionRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', require('./analytics.routes'));
router.use('/settings', settingsRoutes);
router.use('/sales', saleRoutes);
router.use('/expenses', expenseRoutes);

module.exports = router;
