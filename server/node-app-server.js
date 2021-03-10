'use strict';

const path = require('path');
const express = require('express');
const routes = require('./routes');
const request = require('request');
var logger = require('./logger/logger');
var statsImplementation = require('./framework.js');

const loggerObj = require('./logger/logger.js');
const crypto = require('crypto'), algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq12qw';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

/**
 * Installs routes that serve production-bundled client-side assets.
 * It is set up to allow for HTML5 mode routing (404 -> /dist/index.html).
 * This should be the last router in your express server's chain.
 */
var user_name;


module.exports = (app) => {
  if (process.env.STATS) {
    statsImplementation(process.env.STATS).init(app);
  } else{
    statsImplementation('REST').init(app);
  }
  app.use('/api/v1', loggerObj.interceptRequest, routes);

  app.use('/loginCheck', function (req, res) {
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    const vapp = JSON.parse(process.env.VCAP_APPLICATION);
    for (const key in vcap) {

      const services = vcap[key];
      if (services && Array.isArray(services)) {
        for (const service of services) {
          const serviceName = service['name'];
          if (serviceName && serviceName === `bwcemon_UAAClient`) {
            const credentials = service['credentials'];
            if (credentials) {
              var client_id = credentials['client_id'];
              var client_secret = credentials['client_secret'];
              var cfUrl = credentials['url'];
            }
          }
        }
      }
    }


    let redirect_uri = vapp['application_uris'][0];



    let options = {
      url: `${cfUrl}/oauth/token`,
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      form: { 'grant_type': 'authorization_code', 'code': req.query.code, 'token_format': 'opaque', 'response_type': 'token', 'redirect_uri': `https://${redirect_uri}/loginCheck` }
    };
    request(options, (err, response, body) => {
      var a = JSON.parse(body);
      var token = encrypt(a.access_token);
      if (err) {
        logger.warn('Error while handling the request ');
        return handleError(res, err);
      }
      res.redirect(`https://${redirect_uri}?${token}`);

    });

  })



  const distPath = path.join(__dirname, '../dist');
  const indexFileName = 'index.html';
  app.use(express.static(distPath));

  app.get('/', (req, res) => res.sendFile(path.join(distPath, indexFileName)));
  app.get('/applications/*', (req, res) => res.sendFile(path.join(distPath, indexFileName)));
  app.get('/login/*', (req, res) => res.sendFile(path.join(distPath, indexFileName)));
};