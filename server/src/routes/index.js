const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const leadRoutes = require('./lead.routes');
const taskRoutes = require('./task.routes');
const interactionRoutes = require('./interaction.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

// Mount all module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/leads', interactionRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
