const mongoose = require('mongoose');
const uniquePasswordValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const secret = require('../config').secret;

var userSchema = mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  hash: String,
  profilePic: String,
  salt: String
}, {timestamps: true});

userSchema.plugin(uniquePasswordValidator, {message: 'is already taken.'});

userSchema.pre('save', function(next) {
  console.log(this);
  console.log('passwordinner', this.hash);
  this.salt = crypto.randomBytes(16).toString('hex');
  console.log('saltinner', this.salt);
  this.hash = crypto.pbkdf2Sync(this.hash, this.salt, 10000, 512, 'sha512').toString('hex');
  console.log('hashinner', this.hash);

  next();
});

userSchema.methods.isValidPassword = function(password)  {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

module.exports = mongoose.model('User', userSchema);