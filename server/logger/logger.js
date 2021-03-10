/**
 * Modified by Srikanta Dutta on 4/1/2018.
 * Customized logger for better visiblity of logged message with color text and date time
 */
const winston = require('winston');
var config = winston.config;
const request = require('request');

const crypto = require('crypto'), algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq12qw';
function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}
const tsFormat = () => (new Date()).toJSON();
winston.loggers.add('mon-logger', {
  console: {
    level: process.env.LOG_LEVEL || 'info',
    colorize: true,
    timestamp: tsFormat,
    prettyPrint: true,
    handleExceptions: true,
    formatter: function (options) {
      let msgPrefix = '';
      if (!process.env.VCAP_SERVICES) {
        msgPrefix = config.colorize('verbose', '[' + options.timestamp() + ']') + ' => ' +
          config.colorize(options.level, options.level.toUpperCase()) + ' : ';
      }
      return msgPrefix + (options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
    }
  }
});

var logger = winston.loggers.get('mon-logger');

exports.info = function () {
  logger.info.apply(this, arguments);
};

exports.warn = function () {
  logger.warn.apply(this, arguments);
};

exports.error = function () {
  logger.error.apply(this, arguments);
};
exports.debug = function () {
  logger.debug.apply(this, arguments);
};
const LoadUAA= process.env.AUTHENTICATION_MODE ;
exports.interceptRequest = (req, res, next) => {
  exports.info('Requested path is ' + req.url + '');
  exports.info('Request Method ' + req.method + '');
  if (process.env.VCAP_SERVICES && LoadUAA === 'UAA') {
    if (req.path === '/applications/getConfigData' ||
      (req.url.indexOf('logBack') >= 0) ||
      req.path === '/appnodes/logBackUpload' ||
      req.path === '/appnodes/' ||
      req.path === '/applications/getStats' ||
      req.path === '/applications/changeStats' ||
      req.path === '/register' ||
      req.path === '/monitor/health' ||
      req.path === '/appnodes/platformDetails' ||
      (req.method === 'GET' && req.url.indexOf('jobstats') >= 0) ||
      (req.method === 'GET' && req.url.indexOf('statsenablements?appName') >= 0) ||
      (req.method === 'POST' && !req.headers.flagheader && req.url.indexOf('statsenablements') >= 0) ||
      (req.method === 'DELETE' && !req.headers.flagheader && req.url.indexOf('statsenablements') >= 0)) {
      next()
    } else {
      if (req.headers.token) {

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
        var redirect_uri = vapp['application_uris'][0];
        var token = decrypt(req.headers.token);
        let options = {
          url: `${cfUrl}/check_token`,
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          form: { 'token': `${token}` }
        };
        request(options, (err, response, body) => {
          var a = JSON.parse(body);

          if (a.error) {
            res.status(200).json({ status: true });
          } else {
            if (req.path === '/applications/getName') {
              res.status(200).json({ name: a.user_name })
            } else {
              next();
            }
          }

        });
      } else {
        res.status(200).json({ status: true });
      }
    }
  } else {
    next();
  }
}

