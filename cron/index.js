const cron = require('node-cron');

const db = require('../db/index');
const { checkStatus } = require('../services/statusUpdate.sevice');

cron.schedule('* */59 * * * *', () => {
  db.orders.find({}, (err, orders) => {
    if (err) {
      console.log(err);
    } else if (orders.length) {
      checkStatus(orders);
    }
  });
});
