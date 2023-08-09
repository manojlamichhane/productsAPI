const express = require('express');
const { getAllOrders } = require('./../controller/orderController');

const { protect } = require('./../controller/authController');

const router = express.Router();

router.route('/:userId').get(protect, getAllOrders);

module.exports = router;
