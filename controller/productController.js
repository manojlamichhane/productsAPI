/* eslint-disable import/no-extraneous-dependencies */

const productModel = require('../models/productModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTop5Discounts = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-discountPercentage';
  next();
};

exports.getAllProducts = catchAsync(async (req, res) => {
  const features = new APIFeatures(productModel.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const datas = await features.query;

  res.status(200).send({
    status: 'success',
    data: { Products: datas }
  });
});
exports.getProduct = catchAsync(async (req, res, next) => {
  const data = await productModel.findById(req.params.id);
  if (!data) {
    return next(new AppError(404, 'Product not found', 'Not Found'));
    // throw new AppError(404, "ID not found", "Not Found");
  }
  res.status(200).json({
    status: 'success',
    data: { Product: data }
  });
});
exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await productModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { Product: newProduct }
  });
});
exports.updateProduct = catchAsync(async (req, res, next) => {
  const data = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      Product: data
    }
  });
});
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const tour = await productModel.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(404, 'Product not found', 'Not found'));
  }
  res.status(204).json({
    status: 'No Content',
    data: null
  });
});
exports.getStats = catchAsync(async (req, res, next) => {
  const data = await productModel.aggregate([
    // { $match: { category: "smartphones", stock: { $gte: 10 } } },
    {
      $group: {
        _id: '$category',
        averagePrice: { $avg: '$price' },
        totalQuantity: { $sum: '$stock' },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        averageDiscount: { $avg: '$discountPercentage' }
      }
    },
    {
      $sort: { averagePrice: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stat: data }
  });
});

// exports.getStats = async (req, res) => {
//   try {
//     const data = await productModel.aggregate([
//       // { $match: { category: "smartphones", stock: { $gte: 10 } } },
//       {
//         $group: {
//           _id: "$category",
//           averagePrice: { $avg: "$price" },
//           totalQuantity: { $sum: "$stock" },
//           totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
//           minPrice: { $min: "$price" },
//           maxPrice: { $max: "$price" },
//           averageDiscount: { $avg: "$discountPercentage" },
//         },
//       },
//       {
//         $sort: { averagePrice: 1 },
//       },
//     ]);
//     res.status(200).json({
//       status: "No Content",
//       data: { stat: data },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
