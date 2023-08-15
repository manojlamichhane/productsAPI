/* eslint-disable import/no-extraneous-dependencies */

const stripe = require('stripe')(
  'sk_test_51NYfvFHo8tHchr1PTpNIEE0l5ognaf3EK5YPPlC8VZntKXAGziZciDjAGZqVSVLCM4p8hA3Yj6langXYeWdapmPk00mRPBrk1B'
);
const OrderModel = require('../models/orderModel');
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

  // create a customer so that we can pass the cart item and userId that can be used to save in database
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.user._id.toString(),
      cart: JSON.stringify(req.body)
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customer.id,
    line_items: newArray,
    invoice_creation: {
      enabled: true
    },
    success_url: `https://products-cart-wheat.vercel.app/`,
    cancel_url: `https://products-cart-wheat.vercel.app/cart`,
    client_reference_id: req.params.productId
  });
  res.json({ url: session.url });
});

const createOrder = catchAsync(async (customer, data) => {
  const items = JSON.parse(customer.metadata.cart);
  const newOrder = new OrderModel({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: items,
    subTotal: data.amount_subtotal,
    total: data.amount_total,
    paymentStatus: data.payment_status
  });

  await newOrder.save();
});

// these webhooks come in to action when certain events occur like in this case when checkout.session.completed

exports.webHookCheckout = (req, res, next) => {
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const endpointSecret = 'whsec_wGKqMJnbzKZrTRXd3HhwlyVFBzryDt7q';
  // 'whsec_8b79e07ae382f029baa2f1efa8f43e78957d2560408609bba5baef8504480fdc';
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  const data = event.data.object;
  // const eventType = event.type;

  if (event.type === 'checkout.session.completed') {
    stripe.customers
      .retrieve(data.customer)
      .then(customer => {
        createOrder(customer, data);
      })
      .catch(err => console.log(err.message));
  }
  res.status(200).json({ received: true });
};
