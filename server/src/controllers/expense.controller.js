const ExpenseService = require('../services/expense.service');
const catchAsync = require('../utils/catchAsync');

exports.createExpense = catchAsync(async (req, res) => {
  const expense = await ExpenseService.createExpense(req.user.tenant_id, req.body);
  res.status(201).json({ status: 'success', data: { expense } });
});

exports.getExpenses = catchAsync(async (req, res) => {
  const expenses = await ExpenseService.getExpenses(req.user.tenant_id, req.query);
  res.status(200).json({ status: 'success', results: expenses.length, data: { expenses } });
});

exports.getExpense = catchAsync(async (req, res) => {
  const expense = await ExpenseService.getExpenseById(req.user.tenant_id, req.params.id);
  res.status(200).json({ status: 'success', data: { expense } });
});

exports.updateExpense = catchAsync(async (req, res) => {
  const expense = await ExpenseService.updateExpense(req.user.tenant_id, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { expense } });
});

exports.deleteExpense = catchAsync(async (req, res) => {
  await ExpenseService.deleteExpense(req.user.tenant_id, req.params.id);
  res.status(204).json({ status: 'success', data: null });
});
