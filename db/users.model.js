const mongoose = require('mongoose');

const Schema = mongoose.Schema({
  accessToken: String,
  endpoint: String,
  p256dh: String,
  auth: String,
});
module.exports = mongoose.model('users', Schema);
