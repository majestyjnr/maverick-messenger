const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  accountSid: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
    required: true,
  },
});

const Config = mongoose.model("config", configSchema);

module.exports = Config;
