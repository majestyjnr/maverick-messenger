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
  },
  password: {
    type: String,
    required: true,
  },

});

const User = mongoose.model("user", userSchema);

module.exports = User;
