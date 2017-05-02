const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const seed = "odower[owo[o[rw o[wrororew";

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: '{VALUE} is not a valid email!'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

//override this method
UserSchema.methods.toJSON = function () {
  let user = this;
  console.log("user", user);
  let userObject = user.toObject();
  console.log("userObject", userObject);
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, seed).toString();
  user.tokens.push({
    access,
    token
  });
  return user.save().then(() => {
    return token;
  })
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, seed);
  } catch (e) {
    return Promise.reject();

  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })

}


// mongoose middleware fired prior to a save
UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (!err) {
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (!err) {
            this.password = hash;
            next();
          }
        });
      }
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User
}