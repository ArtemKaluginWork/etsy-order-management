const mongoose = require('mongoose');

const orders = require('./orders.model');
const users = require('./users.model');

mongoose.connect('mongodb://mongodb:27017/etsy', { useNewUrlParser: true });

module.exports = {
  orders,
  users,
};
