const express = require('express');

const { checkOut } = require('./../controller/bookingController');
const { protect } = require('./../controller/authController');

const router = express.Router();

router.post('/checkout-session', protect, checkOut);

module.exports = router;
