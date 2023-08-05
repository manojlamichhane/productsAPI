/* eslint-disable import/no-extraneous-dependencies */

const stripe = require('stripe')(
  'sk_test_51NYfvFHo8tHchr1PTpNIEE0l5ognaf3EK5YPPlC8VZntKXAGziZciDjAGZqVSVLCM4p8hA3Yj6langXYeWdapmPk00mRPBrk1B'
);
const catchAsync = require('../utils/catchAsync');

exports.checkOut = catchAsync(async (req, res, next) => {
  const newArray = req.body.map(item => {
    const obj = {
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.title
        },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    };
    return obj;
  });

  const session = await stripe.checkout.sessions.create({
    success_url: `http://localhost:3000/`,
    cancel_url: `http://localhost:3000/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,

    line_items: newArray,

    mode: 'payment'
  });

  res.json({ url: session.url });
});
