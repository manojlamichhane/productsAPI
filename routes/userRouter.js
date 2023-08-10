/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const router = express.Router();

const {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateMyData,
  deleteMe
} = userController;

const { signup, login, protect } = authController;

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/updateMyData').patch(protect, updateMyData);
router.route('/deactivate').delete(protect, deleteMe);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
