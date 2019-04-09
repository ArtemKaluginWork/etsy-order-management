const express = require('express');
const oauth = require('oauth');

const router = express.Router();

const { API_KEY, API_SECRET, CALLBACK, SERVER_URL } = require('../config/index');

const oa = new oauth.OAuth(
  'https://openapi.etsy.com/v2/oauth/request_token',
  'https://openapi.etsy.com/v2/oauth/access_token',
  API_KEY,
  API_SECRET,
  '1.0A',
  CALLBACK,
  'HMAC-SHA1',
);

router.get('/get-access-token', (req, res) => {
  oa.getOAuthRequestToken((error, token, tokenSecret, results) => {
    if (error) {
      res.status(500).send({ message: 'error in get-access-token' });
    } else {
      req.session.oauth.token = token;
      req.session.oauth.tokenSecret = tokenSecret;
      res.redirect(results.login_url);
    }
  });
});

router.get('/callback', (req, res) => {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    oa.getOAuthAccessToken(
      req.session.oauth.token,
      req.session.oauth.tokenSecret,
      req.query.oauth_verifier,
      (error, token, tokenSecret) => {
        if (error) {
          res.status(500).send({ message: 'error in verification' });
        } else {
          req.session.oauth.accessToken = token;
          req.session.oauth.accessTokenSecret = tokenSecret;
          res.redirect(SERVER_URL);
        }
      },
    );
  }
});

module.exports = router;
