const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router
  .route('/')
  .get(expenseController.getExpenses)
  .post(expenseController.createExpense);

router
  .route('/:id')
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
