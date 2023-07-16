const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title cannot be null'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description cannot be null']
  },
  price: {
    type: Number,
    required: [true, 'Price cannot be null']
  },
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  brand: String,
  category: String,
  thumbnail: String,
  images: [String]
});

const productModel = mongoose.model('Products', productSchema);

module.exports = productModel;
