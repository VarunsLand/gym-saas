const SaleService = require('../services/sale.service');
const catchAsync = require('../utils/catchAsync');

exports.createSale = catchAsync(async (req, res) => {
  const sale = await SaleService.createSale(req.user.tenant_id, req.body);
  res.status(201).json({ status: 'success', data: { sale } });
});

exports.getSales = catchAsync(async (req, res) => {
  const sales = await SaleService.getSales(req.user.tenant_id, req.query);
  res.status(200).json({ status: 'success', results: sales.length, data: { sales } });
});

exports.getSale = catchAsync(async (req, res) => {
  const sale = await SaleService.getSaleById(req.user.tenant_id, req.params.id);
  res.status(200).json({ status: 'success', data: { sale } });
});

exports.updateSale = catchAsync(async (req, res) => {
  const sale = await SaleService.updateSale(req.user.tenant_id, req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { sale } });
});

exports.deleteSale = catchAsync(async (req, res) => {
  await SaleService.deleteSale(req.user.tenant_id, req.params.id);
  res.status(204).json({ status: 'success', data: null });
});
