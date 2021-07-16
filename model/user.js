const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email_confirmed: {
    type: Boolean,
    default: false,
  },
  email_verification_code: String,
  is_logged_in: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", userSchema);
