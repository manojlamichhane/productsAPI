/* eslint-disable import/no-extraneous-dependencies */

const orderModel = require('../models/orderModel');

const catchAsync = require('./../utils/catchAsync');

exports.getAllOrders = catchAsync(async (req, res) => {
  const response = await orderModel
    .find({ userId: req.user._id.toString() })
    .exec();

  res.status(200).send({
    status: 'success',
    data: { Orders: response }
  });
});
