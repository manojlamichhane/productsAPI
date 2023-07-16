/* eslint-disable new-cap */
const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name cannot be null']
  },
  email: {
    type: String,
    required: [true, 'Email cannot be null'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid email address']
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password cannot be null'],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not same!!!'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // runs only when the password is modified
  if (!this.isModified('password')) return next();

  // encrypting the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  // defining passwordConfirm as undefined because it may try to validate with encrypted
  // password and encryption is not required here as it has already been done
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTtimestamp) {
  // here we check if the password has been changed after receiving the token
  // for this we get issued time as JWTtimestamp and compared it with passwordchangedAt time
  //  that we get from the model
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTtimestamp < changeTimeStamp;
  }
  return false;
};

const userModel = new mongoose.model('Users', userSchema);

module.exports = userModel;
