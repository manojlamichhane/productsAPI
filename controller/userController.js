/* eslint-disable import/no-extraneous-dependencies */
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
