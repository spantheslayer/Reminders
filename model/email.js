const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailSchema = new Schema({
  reminder_name: String,
  description: String,
  scheduled_time: String,
  reminder_email: String,
});

module.exports = mongoose.model("email", emailSchema);
