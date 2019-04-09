const webpush = require('web-push');

const { EMAIL_FOR_WEB_PUSH } = require('../config/index')

const vapidKeys = webpush.generateVAPIDKeys();

const { publicKey, privateKey } = vapidKeys;

webpush.setVapidDetails(EMAIL_FOR_WEB_PUSH, publicKey, privateKey);


module.exports = {
  publicKey,
  webpush,
};
