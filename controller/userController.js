/* eslint-disable import/no-extraneous-dependencies */

const multer = require('multer');
const sharp = require('sharp');
const userModel = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// to save the file in diskstorage

// const multerStorage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, `${__dirname}/../public/images/users`);
//   },
//   filename: function(req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(400, 'Please uplaod a image', 'invalid file format'),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// const upload = multer({ dest: `${__dirname}/../public/images/users` });

const filterObj = (obj, ...allowedVariables) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedVariables.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = (req, res) => {
  res.send('All users');
};
exports.getUser = (req, res) => {
  res.send(`Get one user with id ${req.params.id}`);
};
exports.createUser = (req, res) => {
  res.send('Create one user');
};
exports.updateUser = (req, res) => {
  res.send('Patch for one user');
};
exports.deleteUser = (req, res) => {
  res.send('Delete');
};
exports.updateMyData = catchAsync(async (req, res, next) => {
  const filteredObject = filterObj(req.body, 'name', 'email');
  if (req.file) filteredObject.photo = req.file.filename;
  const currentUser = await userModel.findByIdAndUpdate(
    req.user.id,
    filteredObject,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser
    }
  });
});
exports.deleteMe = async (req, res, next) => {
  await userModel.findByIdAndDelete(req.user.id);
  res.status(204).json({
    status: 'No content',
    data: null
  });
};
exports.uploadProfile = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;
  if (!req.file) return next();
  sharp(req.file.buffer)
    .resize(200, 200, { fit: 'contain' })
    // chooose a good size so that you dont get the error that the processed image is too large
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);
  next();
};
