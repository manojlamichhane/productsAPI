/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cors = require('cors');

const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const AppError = require('./utils/appError');
const gloablErrorHandler = require('./controller/errorController');

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:
    'You have reached the maximum limit to access this api. Pleas try again after an hour!!'
});

app.use(cors());
// to allow cors for get post methods

app.options('*'.cors());
// to allow cors for put patch delete methods

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/ap1', limiter);
// to prevent denial of service

app.use(helmet());
// setting security http headers

app.use(mongoSanitize());
//  data sanitization from nosql query injection

app.use(xss());
// data sanitization to prevent cross site scripting attack or passing malicious scripts

app.use(hpp());
// data sanitization from http parameter pollution

app.use('/ap1/v1/products', productRouter);
app.use('/ap1/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(
    '400',
    `Cannot find ${req.originalUrl} on the server`,
    'NOT FOUND'
  );

  next(err);
});

app.use(gloablErrorHandler);
module.exports = app;
