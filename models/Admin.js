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

const Admin = mongoose.model("admin", userSchema);

module.exports = Admin;
