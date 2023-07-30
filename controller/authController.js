const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const userModel = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const generateToken = newUser => {
  return jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res) => {
  // const newUser = await userModel.create(req.body);

  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  // this is to avaoid users from regisetring with the roles
  // we want to define the roles for users in a different way

  const token = generateToken(newUser);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production ') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);

  newUser.password = 'undefined';
  // so that password is not returned when the response sents the detials of user
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password is provided
  if (!email || !password) {
    return next(
      new AppError(400, 'Enter the email and password', 'Missing parameters')
    );
  }

  // check if given email and password is in the database
  const user = await userModel.findOne({ email: email }).select('+password');

  // now we need to encrypt the given password and match it to the password that we get from above query
  // since it is related to the data in the model we check it in the user model
  // we use instance method correctPassword for that

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(401, 'Email/Password is incorrect', 'Bad Credentials')
    );
  }

  //  generate token for the same
  const token = generateToken(user);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production ') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);

  res.status(200).json({
    status: 'success',
    id: user._doc._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // check if request has token and extracting the token
  // check if the token exists in the request
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(
      new AppError(401, 'Please login to access', 'Unauthorized access')
    );
  }
  // verfication of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  // check if the token exists in the request
  const freshUser = await userModel.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        401,
        'User with this token do not exist',
        'Unauthorized access'
      )
    );
  }

  // check if password has been changed
  if (await freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        401,
        'Password has been changed recently',
        'unauthorized access'
      )
    );
  }
  // grant access to protocted route
  req.user = freshUser;
  next();
});

exports.restrictTo = roles => {
  return (req, res, next) => {
    // when we call this middleware through delete controller admin is allowed to perform the action
    // so we confirm if its admin or user in this part
    if (!roles === req.user.role) {
      return next(
        new AppError(
          403,
          'You do not have permission to perform this action',
          'Forbidden'
        )
      );
    }
    next();
  };
};
