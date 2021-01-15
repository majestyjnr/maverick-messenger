const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  smsTotal: {
    type: Number,
    required: true
  },
  contacts:{
    type: Array,
    required: true
  },
  sentMessagesTotal:{
    type: Number,
    required: true
  },
  userType: {
    type: String,
    required: true,
  },
  datejoined: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
  },

});

const User = mongoose.model("user", userSchema);

module.exports = User;
