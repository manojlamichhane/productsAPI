const AppError = require('../utils/appError');

const errorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const errorForProd = (err, res) => {
  // operational error are only shown in the production other errors are masked as general error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('Error : ', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} with value ${err.value}`;
  return new AppError(400, message, 'Invalid details');
};
const handleDuplicateFieldsDB = err => {
  const message = `Duplicate ${err.value} for ${err.path} `;
  return new AppError(400, message, 'Invalid details');
};
const handleVaidationDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Inputs ${errors.join('. ')}`;
  return new AppError(400, message, 'Invalid details');
};
const handleJWTError = () => {
  return new AppError(
    401,
    'Login failed. Please try again',
    'Unauthorized access'
  );
};
const handleJWTExpiredError = () => {
  return new AppError(
    401,
    'Token has expired. Please login again',
    'Unauthorized access'
  );
};

const gloablErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Internal Server error';

  if (process.env.NODE_ENV === 'development') {
    errorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleVaidationDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err);
    errorForProd(error, res);
  }

  next();
};

module.exports = gloablErrorHandler;
