const express = require('express');

const productController = require('../controller/productController');

const { protect, restrictTo } = require('./../controller/authController');

const router = express.Router();
const {
  aliasTop5Discounts,
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  getStats
} = productController;

router.route('/top5Discounts').get(aliasTop5Discounts, getAllProducts);
router.route('/stats').get(getStats);

router
  .route('/')
  .get(protect, getAllProducts)
  .post(protect, createProduct);
router
  .route('/:id')
  .get(protect, getProduct)
  .patch(updateProduct)
  .delete(protect, restrictTo('admin'), deleteProduct);

module.exports = router;
