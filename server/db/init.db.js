require('dotenv').config();
const pg = require('pg');
const winston = require('winston');
const mongo = require('mongodb');
const mysql = require('mysql');
const logger = require('../logger/logger');
const connectionString = process.env.DATABASE_URL1;
const client_postgres = new pg.Client(connectionString);
const client_mongo = mongo;
var clients = { client_postgres: client_postgres, client_mongo: mongo };
if(process.env.PERSISTENCE_TYPE == "oracle") {
    var oracledb = require('oracledb');
}
const JSData = require('js-data');
const DSSqlAdapter = require('./sqladapter');
const DSMongoDBAdapter = require('js-data-mongodb');
const knex = require('knex');
const url = require('url');
const nodeServer = require('../node-server');

const persistenceType = process.env.PERSISTENCE_TYPE;
const DB_RETRY_COUNT = process.env.DB_RETRY_COUNT || 10;
const DB_RETRY_INTERVAL = process.env.DB_RETRY_INTERVAL || 10000;
const DB_POOL_MAX = process.env.DB_POOL_MAX || 10;
const DB_POOL_MIN = process.env.DB_POOL_MIN || 2;
const DB_ENCRYPT = process.env.DB_ENCRYPT && process.env.DB_ENCRYPT === 'true';
const DB_DEBUG = process.env.DB_DEBUG && process.env.DB_DEBUG === 'true'
// Add new tables in below object and use object variable.
var tables = {
    nodeRegistry: 'noderegistry',
    process: 'process',
    activityStats: 'activityloggingstats',
    processStats: 'processinstanceloggingstats',
    statRegistry: 'statregistry',
    transitionStats: 'transitionloggingstats'


};
// Below function is added to handle casing of table names
let initDBSpecificTableNames = function () {
    if (persistenceType === 'mysql') {
        tables.nodeRegistry = 'NodeRegistry';
        tables.process = 'Process';
        tables.activityStats = 'ActivityLoggingStats';
        tables.processStats = 'ProcessInstanceLoggingStats';
        tables.statRegistry = 'StatRegistry';
        tables.transitionStats = 'TransitionLoggingStats';

    }
};
initDBSpecificTableNames();
module.exports = clients;
let NodeStore = (function () {

    let INSTANCE;

    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'noderegistry',
                idAttribute: 'id',
                table: tables.nodeRegistry
            });
            return resource;
        }
        return null;
    }

    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };

}());

let ProcessStore = (function () {
    let INSTANCE;
    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'process',
                idAttribute: 'id',
                table: tables.process
            });
            return resource;
        }
        return null;
    }
    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };
}());

let TransitionStore = (function () {
    let INSTANCE;
    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'transitionstats',
                idAttribute: 'transitioninstanceuid',
                table: tables.transitionStats
            });
            return resource;
        }
        return null;
    }
    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };
}());



let StatStore = (function () {
    let INSTANCE;
    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'statregistry',
                idAttribute: 'statuid',
                table: tables.statRegistry
            });
            return resource;
        }
        return null;
    }
    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };
}());

let ProcessInstanceStore = (function () {
    let INSTANCE;
    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'processinstanceloggingstats',
                idAttribute: 'processinstanceuid',
                table: tables.processStats
            });
            return resource;
        }
        return null;
    }
    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };
}());
let ActivityStore = (function () {
    let INSTANCE;
    function initStore() {
        const store = DBConnector.getInstance();
        if (store) {
            const resource = store.defineResource({
                name: 'activityloggingstats',
                idAttribute: 'activityinstanceuid',
                table: tables.activityStats
            });
            return resource;
        }
        return null;
    }
    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = initStore();
            }
            return INSTANCE;
        }
    };
}());

let DBConnector = (function () {
    let INSTANCE;

    function init() {
        logger.info('Initializing ' + (persistenceType || 'jfs') + ' DB....');
        return initDB();
    }

    return {
        getInstance: function () {
            if (!INSTANCE) {
                INSTANCE = init();
            }
            return INSTANCE;
        }
    };

}());

function isJfsPersistence() {
    return !persistenceType || persistenceType === 'jfs';
}

// init relational db. 
// type: mysql|pg(postgresql) or other relational 
var knexConf;
function createTables() {

    knexConf.schema.hasTable(tables.nodeRegistry).then(function (exist) {
        if (!exist) {
            return knexConf.schema.createTableIfNotExists(tables.nodeRegistry, function (table) {
                    table.string('id');
                    table.string('host');
                    table.string('port');
                    table.string('state');
                    table.string('space');
                    table.string('name');
                    table.string('applicationGUID');
                    table.string('routingURL');
                    table.string('application_name');
					table.string('product_version');
                    table.primary('id');
                }).then(() => {
                    logger.info(tables.nodeRegistry + ' table created');
            knexConf.schema.createTable(tables.process, function (table) {
                table.string('id');
                table.string('nodeId');
                table.string('appName');
                table.string('appVersion');
                table.string('moduleName');
                table.string('name'); // This is the name of process
                // as longtext is not supported in postgres
                if (persistenceType === 'postgres' || persistenceType === 'oracle') {
                    table.text('diagramConfigString');
                    table.text('source');
                } else {
                    table.longtext('diagramConfigString');
                    table.longtext('source');
                }
                table.foreign('nodeId').references(tables.nodeRegistry + '.id').onDelete('CASCADE');
            }).then(() => {
                logger.info(tables.process + ' table created');
        }).catch((err) => {
                logger.error(err);
        });
        }).catch((err) => {
                logger.error(err);
        });
        } else {

            knexConf.schema.hasColumn(tables.nodeRegistry, 'applicationGUID').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.nodeRegistry, (table) => {
                        table.string('applicationGUID');
            }).catch((err) => {
                    logger.error(err);
            });
            }
        })
            knexConf.schema.hasColumn(tables.nodeRegistry, 'routingURL').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.nodeRegistry, (table) => {
                        table.string('routingURL');
            }).catch((err) => {
                    logger.error(err);
            });


            }
        }).catch((err) => {
                logger.error(err);
        });
            knexConf.schema.hasColumn(tables.nodeRegistry, 'application_name').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.nodeRegistry, (table) => {
                        table.string('application_name');
            }).catch((err) => {
                    logger.error(err);
            });


            }
        }).catch((err) => {
                logger.error(err);
        });
		    knexConf.schema.hasColumn(tables.nodeRegistry, 'product_version').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.nodeRegistry, (table) => {
                        table.string('product_version');
            }).catch((err) => {
                    logger.error(err);
            });
            }
        }).catch((err) => {
                logger.error(err);
        });
        }
    }).catch(function(err) {
        logger.error(err);
    });
    knexConf.schema.hasTable(tables.activityStats).then(function (exist) {
        if (!exist) {
            knexConf.schema.createTableIfNotExists(tables.activityStats, function (table) {
                table.string('activityinstanceuid');
                table.bigint('timestmp');
                table.string('applicationname');
                table.string('applicationversion');
                table.string('modulename');
                table.string('moduleversion');
                table.string('processname');
                table.string('processinstanceid');
                table.string('activityname');
                table.bigint('activitystarttime');
                table.bigint('activitydurationtime');
                table.bigint('activityevaltime');
                table.string('activitystate');
                table.string('domainname');
                table.string('appspacename');
                table.string('appnodename');
                table.text('activityinput');
                table.text('activityoutput');
                table.string('activityexecutionid');
                table.primary('activityinstanceuid');
            }).then(() => {
                logger.info(tables.activityStats + ' table created');
        }).catch((err) => {
                logger.error(err);
        });
        } else {

            knexConf.schema.hasColumn(tables.activityStats, 'activityexecutionid').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.activityStats, function (table) {

                        table.string('activityexecutionid');
                    }).catch((err) => {
                        logger.error(err);
            });
            }
        })
            knexConf.schema.hasColumn(tables.activityStats, 'activityoutput').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.activityStats, function (table) {

                        table.text('activityoutput');
                    }).catch((err) => {
                        logger.error(err);
            });
            }
        })
            knexConf.schema.hasColumn(tables.activityStats, 'activityinput').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.activityStats, function (table) {

                        table.text('activityinput');
                    }).catch((err) => {
                        logger.error(err);
            });
            }
        }).catch((err) => {
                logger.error(err);
        })
        }

    }).catch((err) => {
        logger.error(err);
})
    knexConf.schema.hasTable(tables.statRegistry).then(function (exist) {
        if (!exist) {
            knexConf.schema.createTable(tables.statRegistry, function (table) {
                table.string('statuid');
                table.string('status');
                table.string('appname');
                table.string('appversion');
                table.string('space');
                table.primary('statuid');
            }).then(() => {
                logger.info(tables.statRegistry + ' table created');
        }).catch((err) => {
                logger.error(err);
        })
        }
    }).catch((err) => {
        logger.error(err);
});

    knexConf.schema.hasTable(tables.processStats).then(function (exist) {
        if (!exist) {
            knexConf.schema.createTableIfNotExists(tables.processStats, function (table) {
                table.string('processinstanceuid');
                table.bigint('timestmp');
                table.string('applicationname');
                table.string('applicationversion');
                table.string('modulename');
                table.string('moduleversion');
                table.string('componentprocessname');
                table.string('processinstancejobid');
                table.string('parentprocessname');
                table.string('parentprocessinstanceid');
                table.string('processname');
                table.string('processinstanceid');
                table.bigint('processinstancestarttime');
                table.bigint('processinstanceendtime');
                table.bigint('processinstancedurationtime');
                table.bigint('processinstanceevaltime');
                table.string('processinstancestate');
                table.string('domainname');
                table.string('appspacename');
                table.string('appnodename');
                table.string('activityexecutionid');
                table.primary(['processinstanceuid'], 'processInstanceStats_pkey');
            }).then(() => {
                logger.info(tables.processStats + ' table created');
        }).catch((err) => {
                logger.error(err);
        });
        } else {
            knexConf.schema.hasColumn(tables.processStats, 'activityexecutionid').then((exist) => {
                if (!exist) {
                return knexConf.schema.table(tables.processStats, function (table) {
                        table.string('activityexecutionid');
                    }).catch((err) => {
                        logger.error(err);
            });
            }
        }).catch((err) => {
                logger.error(err);
        });
        }
    }).catch((err) => {
        logger.error(err);
});


    knexConf.schema.hasTable(tables.transitionStats).then(function (exist) {
        if (!exist) {
            knexConf.schema.createTableIfNotExists(tables.transitionStats, function (table) {
                table.string('transitioninstanceuid');
                table.bigint('timestmp');
                table.string('applicationname');
                table.string('applicationversion');
                table.string('modulename');
                table.string('moduleversion');
                table.string('componentprocessname');
                table.string('processname');
                table.string('processinstanceid');
                table.string('transitionname');
                table.string('domainname');
                table.string('appspacename');
                table.string('appnodename');
                table.primary('transitioninstanceuid');
            }).then(() => {
                logger.info(tables.transitionStats + ' table created');
        }).catch((err) => {
                logger.error(err);
        });
        }
    }).catch((err) => {
        logger.error(err);
});

}
function initRDBMS(store, host, port, username, password, db, type) {
    // create table
        knexConf = knex({
            client: type,
            connection: {
                host: host,
                port: port,
                user: username,
                password: password,
                database: db,
                options: {
                    encrypt: DB_ENCRYPT
                }
            },
            pool: {
                min: DB_POOL_MIN,
                max: DB_POOL_MAX
            },
            debug: DB_DEBUG
        });
    var retryCount = 0;
    // Try database connection using dummy query and keep retrying it for
    // configured retry attempts and interval if disconnected and exit if not successful
    function retryDB () {
        query = 'select 1+1 as result';
        if (type === 'oracledb'){
            query = 'select * from DUAL';
        }
        knexConf.raw(query).then(()=>{
                createTables();
                // reigster sql adapter
                const sqlAdapter = new DSSqlAdapter({
                    client: type,
                    connection: {
                        host: host,
                        port: port,
                        user: username,
                        password: password,
                        database: db,
                        options: {
                            encrypt: DB_ENCRYPT
                        }
                    },
                    pool: {
                        min: DB_POOL_MIN,
                        max: DB_POOL_MAX
                    },
                    debug: DB_DEBUG
                });
                store.registerAdapter('sql', sqlAdapter, { default: true });
                // emit event to node-server.js to start node server
                nodeServer.app.emit('db-ready');
            }).catch(err => {
            // Added err.errorNum && err.errorNum === 12514 condition for oracle retry mechanism. This error code is returend
            // if listener is down or machine is not accesible
            if(err.code && (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT"
                            || err.code === "ENOTFOUND" || err.code === "ETIMEOUT")
                            || err.code === "ESOCKET" || (err.errorNum && err.errorNum === 12514)) {
                if (retryCount >= DB_RETRY_COUNT) {
                    logger.error("Maximum db retry reached. Shutting down node server ");
                    process.exit(1);
                } else {
                    logger.error(err);
                    logger.info("DB Retry Count :"+ ++retryCount);
                    setTimeout(retryDB, DB_RETRY_INTERVAL)
                }
            } else {
            logger.error("Please check database URL, Shutting down node server ");
            logger.error(err);
            process.exit(1);
        }
        });
    }
    retryDB();
    // docker run -p 8014:8090 -e BW_LOGLEVEL="DEBUG" -e BW_JAVA_OPTS="-Dbw.monitor.provider=REST -Dbw.monitor.rest.port=8080 -Dbw.monitor.rest.host=10.97.242.143 -Dbw.monitor.rest.context=/api/v1 -Dbw.monitor.rest.activity.endpoint=/activitystats -Dbw.monitor.rest.process.endpoint=/processstats -Dbw.monitor.rest.transition.endpoint=/transitionstats" atinsh:latest
}

function initMongo(store, dbUrl) {
    const mongoAdapter = new DSMongoDBAdapter(dbUrl);
    store.registerAdapter('mongodb', mongoAdapter, { default: true });
}

// TODO need to improve to handle all cases: 
// 1. PCF - marketplace mysql|mongo & user-provided mysql|mongo
// 2. Docker - mysql|mongo 
// 3. check if table exists
function initDB() {
    if (isJfsPersistence()) {
        return null;
    }
    let store = new JSData.DS();
    if (process.env.VCAP_SERVICES) {
        const vcap = JSON.parse(process.env.VCAP_SERVICES);
        for (const key in vcap) {
            const services = vcap[key];
            if (services && Array.isArray(services)) {
                for (const service of services) {
                    const serviceName = service['name'];
                    if (serviceName && serviceName === `bwcemon_${persistenceType}`) {
                        const credentials = service['credentials'];
                        if (credentials) {
                            if (persistenceType === 'mysql') {
                                const host = credentials['hostname'];
                                const username = credentials['username'];
                                const password = credentials['password'];
                                const db = credentials['name'];
                                const port = credentials['port'];

                                initRDBMS(store, host, port, username, password, db, 'mysql')
                            } else if (persistenceType === 'mongo') {
                                initMongo(store, credentials.DB_URL);
                            } else if (persistenceType === 'postgres') {
                                let username;
                                let password;
                                let host;
                                let port;
                                let db;
                                if (key === 'user-provided') {
                                    username = credentials['db_username'];
                                    password = credentials['db_password'];
                                    let dbUrl = credentials['db_url'];
                                    // dbUrl=jdbc:postgresql://localhost:5432/sample
                                    dbUrl = dbUrl.split('jdbc:')[1];
                                    const parsed = url.parse(dbUrl);
                                    host = parsed.hostname;
                                    port = parsed.port;
                                    db = parsed.pathname.substring(1, parsed.pathname.length);
                                } else {
                                    host = credentials['host'];
                                    port = credentials['port'];
                                    username = credentials['username'];
                                    password = credentials['password'];
                                    db = credentials['name'];
                                }
                                initRDBMS(store, host, port, username, password, db, 'pg');
                            } else if (persistenceType === 'mssql') {
                                let username;
                                let password;
                                let host;
                                let port;
                                let db;
                                let temp;
                                if (key === 'user-provided') {
                                    username = credentials['db_username'];
                                    password = credentials['db_password'];
                                    let dbUrl = credentials['db_url'];
                                    // dbUrl=jdbc:sqlserver://[username]:[port];databaseName=[dbname]
                                    dbUrl = dbUrl.split('jdbc:')[1];
                                    const parsed = url.parse(dbUrl);
                                    host = parsed.hostname;
                                    port = parsed.port;
                                    temp = parsed.pathname.substring(1, parsed.pathname.length);
                                    db = temp.split('=')[1];
                                } else {
                                    host = credentials['host'];
                                    port = credentials['port'];
                                    username = credentials['username'];
                                    password = credentials['password'];
                                    db = credentials['name'];
                                }
                                initRDBMS(store, host, port, username, password, db, 'mssql');
                            } else if (persistenceType === 'oracle') {
                                let username;
                                let password;
                                let host;
                                let port;
                                let db;
                                let temp;
                                if (key === 'user-provided') {
                                    username = credentials['db_username'];
                                    password = credentials['db_password'];
                                    let dbUrl = credentials['db_url'];
                                    // dbUrl=jdbc:sqlserver://[username]:[port];databaseName=[dbname]
                                    dbUrl = dbUrl.split('jdbc:')[1];
                                    const parsed = url.parse(dbUrl);
                                    host = parsed.hostname;
                                    port = parsed.port;
                                    temp = parsed.pathname.substring(1, parsed.pathname.length);
                                    db = temp.split('=')[1];
                                } else {
                                    host = credentials['host'];
                                    port = credentials['port'];
                                    username = credentials['username'];
                                    password = credentials['password'];
                                    db = credentials['name'];
                                }
                                initRDBMS(store, host, port, username, password, db, 'oracledb');
                            }
                        }
                    } else if (serviceName && serviceName === `bwcemon_UAAClient`) {
                        logger.info(`UAA service configured with mon app`);
                    }
                    else {
                        logger.error(`Database service [${serviceName}] not found`);

                    }
                }
            }

        }
    } else {
        const dbUrl = process.env.DB_URL;
        if (dbUrl) {
          if (isValidUrl(dbUrl)) {
            if (!persistenceType || persistenceType === '') {
                logger.error(`Environment variable [persistenceType] is missing`);
            } else if (persistenceType === 'mysql') {
                //mysql://admin:admin@10.97.98.137:43306/admin
                const parsed = url.parse(dbUrl);
                const host = parsed.hostname;
                const port = parsed.port;
                const auth = parsed.auth;
                const username = auth.split(':')[0];
                const password = auth.split(':')[1];
                const db = parsed.pathname.substring(1, parsed.pathname.length);
                initRDBMS(store, host, port, username, password, db, 'mysql');
            } else if (persistenceType === 'mongo') {
                initMongo(store, dbUrl);
            } else if (persistenceType === 'postgres') {
                // postgresql://[username]:[password]@[host]:[port]/[database]
                const parsed = url.parse(dbUrl);
                const host = parsed.hostname;
                const port = parsed.port;
                const auth = parsed.auth;
                const username = auth.split(':')[0];
                const password = auth.split(':')[1];
                const db = parsed.pathname.substring(1, parsed.pathname.length);
                initRDBMS(store, host, port, username, password, db, 'pg');
            } else if (persistenceType === 'mssql') {
                const parsed = url.parse(dbUrl);
                const host = parsed.hostname;
                const port = parsed.port;
                const auth = parsed.auth;
                const username = auth.split(':')[0];
                const password = auth.split(':')[1];
                const db = parsed.pathname.substring(1, parsed.pathname.length);
                initRDBMS(store, host, port, username, password, db, 'mssql');
            } else if (persistenceType === 'oracle')  {
                const parsed = url.parse(dbUrl);
                const host = parsed.hostname;
                const port = parsed.port;
                const auth = parsed.auth;
                const username = auth.split(':')[0];
                const password = auth.split(':')[1];
                const db = parsed.pathname.substring(1, parsed.pathname.length);
                initRDBMS(store, host, port, username, password, db, 'oracledb');
            } else {
                logger.error(`Database [${persistenceType}] not supported`);
            }
          } else {
          logger.error('Invalid DB_URL.');
          logger.error(`Refer correct DB_URL format => [${persistenceType}]://[db_username]:[db_password]@[hostip]:[port]/[database_name]`);
          }
       } else {
            logger.error(`Environment variable [DB_URL] is missing`);
        }
     }
    return store;
}
function isValidUrl (dbUrl) {
    if(process.env.VALIDATE_DB_URL && process.env.VALIDATE_DB_URL === 'false'){
       return true;
    }
    // Added ([$&+,:;=?@#|'<>.^*()%!-] special character in regular expression for user name and password
  var urlFormat = /^\w+:\/\/\w+([$&+,:;=?@#|'<>.^*()%!-]?\w?)*:\w+([$&+,:;=?@#|'<>.^*()%!-]?\w?)*@(([0-9]+.[0-9]+.[0-9]+.[0-9]+)|(\w+([.-]?\w+)*)):[0-9]+\/\w+([.-]?\w+)*$/;
  return urlFormat.test(dbUrl);
}
module.exports =
    {
        DBConnector: DBConnector,
        NodeStore: NodeStore,
        ProcessStore: ProcessStore,
        ProcessInstanceStore: ProcessInstanceStore,
        ActivityStore: ActivityStore,
        StatStore: StatStore,
        TransitionStore: TransitionStore,
        TableNames: tables,
        knex: function () {
            return knexConf;
        }

    };