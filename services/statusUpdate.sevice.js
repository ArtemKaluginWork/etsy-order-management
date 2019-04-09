const oauth = require('oauth');
const { promisify } = require('util');

const db = require('../db/index');
const { webpush } = require('./webPush.service');
const { serialize } = require('../helpers/order.helper');
const { chunkArray } = require('../helpers/array.helper');
const { asyncForEach, timeout } = require('../helpers/async.helper');
const { API_KEY, API_SECRET, CALLBACK } = require('../config/index');


const oa = new oauth.OAuth(
  'https://openapi.etsy.com/v2/oauth/request_token',
  'https://openapi.etsy.com/v2/oauth/access_token',
  API_KEY,
  API_SECRET,
  '1.0A',
  CALLBACK,
  'HMAC-SHA1',
);
const getProtectedResourcePromisified = promisify(oa.getProtectedResource.bind(oa));


const updateStatus = async (orders) => {
  const promiseList = [];
  orders.forEach((order) => {
    promiseList.push(async () => {
      try {
        const data = await getProtectedResourcePromisified(
          `https://openapi.etsy.com/v2/receipts/${order.orderId}?includes=Transactions/Listing/MainImage`,
          'GET',
          order.accessToken,
          order.accessTokenSecret,
        );
        const dataObject = JSON.parse(data);
        const newOrder = serialize(dataObject.results[0]);
        if (newOrder.status !== order.orderStatus) {
          await db.orders.updateOne({ orderId: order.orderId }, { orderStatus: newOrder.status });
          const user = await db.users.findOne({ accessToken: order.accessToken });
          const { endpoint, p256dh, auth } = user;
          const subscription = {
            endpoint,
            expirationTime: null,
            keys: {
              p256dh,
              auth,
            },
          };
          const payload = JSON.stringify({
            title: `Status for ${order.orderId} has been changed`,
            body: `New status: ${newOrder.status}`,
          });
          webpush.sendNotification(subscription, payload).catch((error) => {
            console.error('ERROR', error.stack);
          });
          if (newOrder.status === 'delivered') {
            await db.orders.remove({ orderId: order.orderId });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
  await Promise.all(promiseList.map(item => item()));
  await timeout(1000);
};

const checkStatus = async (orders) => {
  const chunkOrders = chunkArray(orders, 10);
  await asyncForEach(chunkOrders, chunk => updateStatus(chunk));
};


module.exports = {
  checkStatus,
};
