const mongoose = require('mongoose');

const Schema = mongoose.Schema({
  orderId: String,
  orderStatus: String,
  accessToken: String,
  accessTokenSecret: String,
});
module.exports = mongoose.model('orders', Schema);
