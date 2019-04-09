const express = require('express');
const oauth = require('oauth');
const { promisify } = require('util');

const router = express.Router();

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

const findAllUserShops = async (req, res, userInfo) => {
  try {
    const data = await getProtectedResourcePromisified(
      `https://openapi.etsy.com/v2/users/${userInfo.id}/shops`,
      'GET',
      req.session.oauth.accessToken,
      req.session.oauth.accessTokenSecret,
    );
    const dataObject = JSON.parse(data);
    res.render('index', { ...userInfo, shops: dataObject.results });
  } catch (e) {
    res.status(500).send({ message: 'error in findAllUserShops' });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const data = await getProtectedResourcePromisified(
      'https://openapi.etsy.com/v2/users/__SELF__',
      'GET',
      req.session.oauth.accessToken,
      req.session.oauth.accessTokenSecret,
    );
    const dataObject = JSON.parse(data);
    const { user_id: id, primary_email: email } = dataObject.results[0];
    findAllUserShops(req, res, { id, email });
  } catch (e) {
    res.status(500).send({ message: 'error in getUserInfo' });
  }
};

router.get('/', (req, res) => {
  if (!req.session.oauth) {
    req.session.oauth = {};
  }
  if (!req.session.oauth.accessToken) {
    res.redirect('auth/get-access-token');
  } else {
    getUserInfo(req, res);
  }
});

module.exports = router;
