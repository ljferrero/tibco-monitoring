'use strict';

const compression = require('compression');
const express = require('express');
const logger = require('./logger/logger');
const helmet = require('helmet');
const nodeProxy = require('./node-proxy');
const nodeAppServer = require('./node-app-server');
const authPassport = require('./auth-passport');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const store = require('./db/init.db');
const env = require('./validate.server.environment');
const fs = require('fs');
const path =  require('path');
const https = require('https');

let users;
var appDetails = require('../app-version.json');
logger.info(`${appDetails.appName}@${appDetails.version}, build ${appDetails.build} ${appDetails.timestamp}`);


/**
 * Heroku-friendly production http server.
 *
 * Serves your app and allows you to proxy APIs if needed.
 */

const app = express();
const PORT = process.env.PORT || 8085;
const HTTP_PAYLOAD_LIMIT = process.env.HTTP_PAYLOAD_LIMIT || '10mb';

// compress response before sending to client
app.use(compression({ filter: shouldCompress }));

// set compression: true in request header to compress response
function shouldCompress(req, res) {
  if (req.headers['compression']) {
    // fallback to standard filter function to compress
    return compression.filter(req, res);
  }
  // don't compress responses if 'compression' request header is not set or set to false
  return false;
}

authPassport.readUsers()
  .then((_users) => {
    users = _users;
  })
  .catch((err) => {
    throw err;
  });

// Enable various security helpers.
app.use(helmet());

app.use(bodyParser.urlencoded({ limit: HTTP_PAYLOAD_LIMIT, extended: false }));
app.use(bodyParser.json({limit: HTTP_PAYLOAD_LIMIT}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  (username, password, done) => {
    authPassport.authenticateUser(username, password, users)
      .then((authResult) => {
        return done(null, authResult);
      })
      .then(null, (message) => {
        return done(null, false, message);
      });
  }

));

passport.serializeUser((user, done) => {
  done(null, user.meta.id);
});

passport.deserializeUser((id, done) => {
  done(null, authPassport.getUserById(id, users));
});

app.post('/api/v1/auth/login',
  passport.authenticate('local'),
  (req, res) => {
    res.status(200).send(JSON.stringify(req.user));
  }
);

// Disable HTTPS Service for PCF Environment
if(process.env.VCAP_SERVICES) {
  process.env.HTTPS = 'false';
}

if (process.env.HTTPS && process.env.HTTPS === 'true') {
  if(process.env.HTTPS_CONFIG === undefined || process.env.HTTPS_CONFIG === '') {
    const root = path.join(__dirname, '..', 'certs');
    if(fs.existsSync(root + '/https_config.json')){
      process.env.HTTPS_CONFIG = fs.readFileSync(root + '/https_config.json').toLocaleString();
    } else {
      logger.error('Https config json not Found');
    }
  }
}

// API proxy logic: if you need to talk to a remote server from your client-side
// app you can proxy it though here by editing ./proxy-config.js
nodeProxy(app);

// Serve the distributed assets and allow HTML5 mode routing. NB: must be last.
nodeAppServer(app);
env.validateEnvironmentVariable(() => {
    store.NodeStore.getInstance();
    store.ProcessStore.getInstance();
});
app.on('db-ready', function() {
  startServer();
  startHttpsServer();
})
  function startServer() {
  app.listen(PORT, (err) => {
    if (err) {
      logger.error(err);
      return;
    }
    logger.info(`Listening on port ${PORT}`);
  });
}

function getFileContent(filePath) {
  if(filePath === path.basename(filePath)){
    const certsFolder = path.join(__dirname, '..', 'certs');
    if( fs.existsSync(certsFolder + '/' + filePath)) {
      return fs.readFileSync(certsFolder + '/' + filePath);
    } else {
      throw new Error(filePath + ' - file missing');
    }
  } else {
    if( fs.existsSync(certsFolder + '/' + filePath)) {
      return fs.readFileSync(certsFolder + '/' + filePath);
    } else {
      throw new Error(filePath + ' - file missing');
    }
  }
}

function isJSON(json) {
  try {
    var t = JSON.parse(json);
    return true;
  } catch (err) {
    return false;
  }
}

function configHttpsServer() {
  var options = {};
  if (isJSON(process.env.HTTPS_CONFIG)) {
    var config = JSON.parse(process.env.HTTPS_CONFIG);
    if('key' in config) {
      options.key = getFileContent(config.key);
      if(!('cert' in config)) {
        throw new Error('Cert File Not Found');
      }
    } else {
      if('pfx' in config) {
        options.pfx = getFileContent(config.pfx);
        if(!('passphrase' in config)) {
          throw new Error('Pass Phrase in mandatory if the file is not encrypted then the user must add the passsphrase as ""');
        }
      } else {
        throw new Error('Key/PFX File Not Found');
      }
    }
    if('cert' in config) {
      options.cert = getFileContent(config.cert);
    }
    if('ca' in config) {
      options.ca = getFileContent(config.ca);
    }
    if('passphrase' in config) {
      options.passphrase = config.passphrase;
    }
  }
  return options;
}

function startHttpsServer() {
  if(process.env.HTTPS && process.env.HTTPS === 'true') {
    try{
      var options = configHttpsServer();
      https.createServer(options,app).listen(parseInt(process.env.HTTPS_PORT, 10) || 443, (err) => {
        if(err) {
          logger.error(err);
          return;
        }
        logger.info('HTTPS Server started at port:- ' + (parseInt(process.env.HTTPS_PORT, 10) || 443));
      });
    } catch (err) {
      logger.error('HTTPS Server start failed:- ', err);
      return;
    }
  }
}
exports.app = app;
