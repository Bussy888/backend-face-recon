const app = require('../server');
const serverless = require('serverless-http'); // npm install serverless-http

module.exports = serverless(app);
