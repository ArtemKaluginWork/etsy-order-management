const config = {
  API_KEY: '<API_KEY>', // add ETSY api key {string}
  API_SECRET: '<API_SECRET>', // add ETSY api secret key {string}
  CALLBACK: 'http://localhost:3000/auth/callback',
  API_URL: 'https://openapi.etsy.com/v2/',
  SERVER_URL: 'http://localhost:3000/',
  CMS_ID: 'outvio',
  DEFAULT_EMPTY_VALUE: null,
  EMAIL_FOR_WEB_PUSH: 'mailto:<EMAIL>', // replace <EMAIL> on your email address for web push
};

module.exports = config;
