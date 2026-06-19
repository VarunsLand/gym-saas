const express = require('express');
const saleController = require('../controllers/sale.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router
  .route('/')
  .get(saleController.getSales)
  .post(saleController.createSale);

router
  .route('/:id')
  .put(saleController.updateSale)
  .delete(saleController.deleteSale);

module.exports = router;
