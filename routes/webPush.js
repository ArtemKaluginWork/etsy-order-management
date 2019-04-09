const express = require('express');
const db = require('../db/index');

const router = express.Router();

const { publicKey } = require('../services/webPush.service');

router.get('/subscribe', (req, res) => {
  if (!req.session.oauth) {
    req.session.oauth = {};
  }
  if (!req.session.oauth.accessToken) {
    res.redirect('auth/get-access-token');
  } else {
    res.send({ publicKey });
  }
});

router.post('/subscribe', (req, res) => {
  const { endpoint, keys: { p256dh, auth } } = req.body;
  const { accessToken } = req.session.oauth;
  db.users.updateOne({ accessToken }, {
    accessToken,
    endpoint,
    p256dh,
    auth,
  }, { upsert: true }, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.status(201).send({ message: 'added new subscribe' });
    }
  });
});

module.exports = router;
