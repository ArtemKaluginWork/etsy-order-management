const express = require('express');
const oauth = require('oauth');
const { promisify } = require('util');

const db = require('../db/index');
const { serialize } = require('../helpers/order.helper');

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

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.oauth) {
    req.session.oauth = {};
  }
  const { shopId } = req.query;
  if (!req.session.oauth.accessToken) {
    res.redirect('auth/get-access-token');
  } else {
    try {
      const data = await getProtectedResourcePromisified(
        `https://openapi.etsy.com/v2/shops/${shopId}/receipts?includes=Transactions/Listing/MainImage`,
        'GET',
        req.session.oauth.accessToken,
        req.session.oauth.accessTokenSecret,
      );
      const dataObject = JSON.parse(data);
      const list = dataObject.results.map(item => serialize(item));
      list.forEach(({ status, receiptId }) => {
        if (status !== 'delivered') {
          db.orders.updateOne({ orderId: receiptId }, {
            orderId: receiptId,
            orderStatus: status,
            accessToken: req.session.oauth.accessToken,
            accessTokenSecret: req.session.oauth.accessTokenSecret,
          }, { upsert: true }, (err, order) => {
            if (err) {
              console.log(err);
            } else if (order.upserted) {
              console.log(`added watcher for ${receiptId}`);
            }
          });
        }
      });
      res.send({ list });
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  }
});

module.exports = router;
