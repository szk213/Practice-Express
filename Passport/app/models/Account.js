'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

// set up a mongoose model
var AccountSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  mail: {
      type: String,
      unique: true,
      required: true
  },
  password: {
    type: String,
    required: true
  }
});

AccountSchema.pre('save', function (next) {
  console.log('saveきた！');
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

AccountSchema.methods.verify = function (planePassword, cb) {
  console.log('検証きた！');
  bcrypt.compare(planePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Account', AccountSchema);