const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./index');

process.on('uncaughtException', err => {
  console.log(err.name, err.message, err.stack);
  console.log('Uncaught Exception Closing Server');
  process.exit(1);
});

dotenv.config();
const port = 3000;

const DB = process.env.DB_CONNECTION_STRING.replace(
  'PASSWORD',
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() => console.log('DB connection Success!!'));
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection Closing Server');
  server.close(() => {
    process.exit(1);
  });
});
