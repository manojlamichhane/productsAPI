const express = require('express');

const { checkOut } = require('./../controller/bookingController');
const { protect } = require('./../controller/authController');

const router = express.Router();

router.get('/checkout-session/:productId', protect, checkOut);

module.exports = router;
