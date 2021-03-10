/**
 * Created by Srikanta Dutta on 4/1/2018.
 * Validate environmnet varibles provided
 */

const logger = require('./logger/logger');
exports.validateEnvironmentVariable = function (startServerCallback) {
  if (process.env.VCAP_SERVICES && process.env.AUTHENTICATION_MODE === "UAA") {
    var isExists = false;
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    for (const key in vcap) {
      const services = vcap[key];
      if (services && Array.isArray(services)) {
        for (const service of services) {
          const serviceName = service['name'];
          if (serviceName && serviceName === `bwcemon_UAAClient`) {
            isExists = true;
          }
        }
      }
    }
    if (!isExists) {
      logger.error('Please specify the bwcemon_UAAClient service in manifest file');
      process.exit();
    }
  }
  if (!process.env.PERSISTENCE_TYPE) {
    if (process.env.PERSISTENCE_TYPE === '') {
      logger.error('Environment variable [PERSISTENCE_TYPE] value should not be empty');
    } else {
      logger.error('Environment varible name [PERSISTENCE_TYPE] is incorrect or undefined');
    }
    process.exit();
  } else {
    if (process.env.PERSISTENCE_TYPE === 'jfs') {
      startServerCallback();
    } else if (process.env.PERSISTENCE_TYPE === 'postgres' || process.env.PERSISTENCE_TYPE === 'mysql' || process.env.PERSISTENCE_TYPE === 'mssql' || process.env.PERSISTENCE_TYPE === 'oracle') {
      if (process.env.VCAP_SERVICES) {
        startServerCallback();
      } else if (process.env.DB_URL) {
        if (process.env.DB_URL === '') {
          logger.error('Environment variable [DB_URL] value should not be empty');
          process.exit();
        } else {
          startServerCallback();
        }
      } else {
        logger.error('Environment variable name [DB_URL] is incorrect or undefined');
        process.exit();
      }
    } else {
      logger.error('Environment variable [PERSISTENCE_TYPE] value is not valid, value should be either "postgres" , "mysql" or "mssql" or "oracle"');
      process.exit();
    }
  }
}
