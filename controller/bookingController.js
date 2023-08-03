/* eslint-disable import/no-extraneous-dependencies */

const stripe = require('stripe')(
  'sk_test_51NYfvFHo8tHchr1PTpNIEE0l5ognaf3EK5YPPlC8VZntKXAGziZciDjAGZqVSVLCM4p8hA3Yj6langXYeWdapmPk00mRPBrk1B'
);
const productModel = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.checkOut = catchAsync(async (req, res, next) => {
  const response = await productModel.findById(req.params.productId);

  const product = await stripe.products.create({
    name: response.title,
    description: response.description
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: response.price * 100,
    currency: 'cad'
  });

  const session = await stripe.checkout.sessions.create({
    success_url: `http://localhost:3000/`,
    cancel_url: `http://localhost:3000/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,

    line_items: [
      {
        price: price.id,
        quantity: 1
      }
    ],

    mode: 'payment'
  });

  res.json({ url: session.url });

  // res.redirect(303, session.url);

  // res.status(200).json({
  //   status: 'success',
  //   session
  // });
});
