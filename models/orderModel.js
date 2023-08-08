/* eslint-disable new-cap */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: 'true'
    },
    customerId: { type: String },
    paymentIntentId: { type: String },
    products: [
      {
        title: { type: String },
        price: { type: Number },
        quantity: { type: Number }
      }
    ],
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

const orderModel = new mongoose.model('Orders', orderSchema);

module.exports = orderModel;
