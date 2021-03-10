'use strict';

require('dotenv').config();
let multer = require('multer');
let upload = multer();
const logger = require('../logger/logger');
var FormData = require('form-data');
var appnodes = require('../routes/appnodes/appnode.controller.js');
const _ = require('lodash');
var db = require('../datastore/init.datastore.js').nodedb;
var statdb = require('../datastore/init.datastore.js').statdb;
const JSData = require('js-data');
const async = require('async');

const store = require('./init.db');
const uuidv1 = require('uuid/v1');
const request = require('request');
var utils = require('../utils/utils.js');
const persistenceType = process.env.PERSISTENCE_TYPE;
//Added for PCF manifest alias name change. aName is aliasName
const displayAppName = process.env.DISPLAY_ALIAS === 'true';

var activityModel = require('../models/activity.model.js');
var processModel = require('../models/process.model.js');
var transitionModel = require('../models/transition.model.js');


exports.processCount = (req, res) => {
    var knex = store.knex();

    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let status = req.query.status;
    let processName = req.query.processName;
    let startDate = +req.query.startDate;
    let endDate = +req.query.endDate;
    let searchText = req.query.searchText;
    let whereClause = {
        applicationname: { '==': appName },
        applicationversion: { '==': appVersion },
        appnodename: { '==': node.name }
    };
    if (status !== 'null') {
        whereClause.processinstancestate = { '==': status }
    }
    if (processName !== 'null') {
        whereClause.processname = { '==': processName }
    }
    if (startDate > 0 && endDate > 0) {
        whereClause.processinstancestarttime = { '>=': startDate, '<=': endDate };
    }
    if (searchText && searchText !== 'null') {
        // add the list of process instance id's having searchText from input/output data of activity logging stats table
        const activityloggingstats = store.ActivityStore.getInstance();
        if (activityloggingstats) {
            activityloggingstats.findAll(
                {
                    where: {
                        activityinput: { '|like': '%' + searchText + '%' },
                        activityoutput: { '|like': '%' + searchText + '%' }
                    }
                }
            ).then(activities => {
                let processInstanceIds = [];
                for (let actId in activities) {
                    processInstanceIds.push(activities[actId].processinstanceid);
                }
                whereClause.processinstanceid = { 'in': processInstanceIds }
                getProcessCount(res, whereClause);
            })
        } else {
            getProcessCount(res, whereClause);
        }
    } else {
        getProcessCount(res, whereClause);
    }

}

function getProcessCount(res, whereClause) {
    const processInstanceRegistry = store.ProcessInstanceStore.getInstance();
    if (processInstanceRegistry) {
        processInstanceRegistry.findAll(
            {
                where: whereClause
            }
        ).then(processInstanceData => {
            res.status(200).json({ count: processInstanceData.length });
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        res.status(200).json({ count: 0 });
    }
}

exports.processCountByStatus = (req, res) => {
    const processInstanceRegistry = store.ProcessInstanceStore.getInstance();
    async.parallel({
        COMPLETED: (callback) => {
            if (processInstanceRegistry) {
                processInstanceRegistry.findAll(
                    {
                        where: getWhereClauseForCountByState(req, 'COMPLETED')
                    }
                ).then(completedData => {
                    callback(null, completedData.length)
                }).catch((err) => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            } else {
                callback(null, 0);
            }
        },
        CANCELLED: (callback) => {
            if (processInstanceRegistry) {
                processInstanceRegistry.findAll(
                    {
                        where: getWhereClauseForCountByState(req, 'CANCELLED')
                    }
                ).then(completedData => {
                    callback(null, completedData.length)
                }).catch((err) => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            } else {
                callback(null, 0);
            }
        },
        FAULTED: (callback) => {
            if (processInstanceRegistry) {
                processInstanceRegistry.findAll(
                    {
                        where: getWhereClauseForCountByState(req, 'FAULTED')
                    }
                ).then(completedData => {
                    callback(null, completedData.length)
                }).catch((err) => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            } else {
                callback(null, 0);
            }
        }
    }, function (error, results) {
        res.status(200).json(results);
    })
}
// function to get whereclause for count query. It's a separate function because there are scoping issues with using common where clause inside async module.
function getWhereClauseForCountByState(req, state) {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let whereClause = {
        applicationname: { '==': appName },
        applicationversion: { '==': appVersion },
        appnodename: { '==': node.name },
        processinstancestate: { '==': state }
    };
    if (processName !== 'null') {
        whereClause.processname = { '==': processName }
    }
    return whereClause;
}

exports.getAllTransitionStats = (req, res) => {
    const transitionloggingstats = store.TransitionStore.getInstance();
    if (transitionloggingstats) {
        transitionloggingstats.findAll().then(nodes => {
            res.status(200).json({ data: nodes })
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
    }
}

exports.getAllActivityStats = (req, res) => {
    const activityloggingstats = store.ActivityStore.getInstance();
    if (activityloggingstats) {
        activityloggingstats.findAll().then(nodes => {
            res.status(200).json({ data: nodes })
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
    }
}
exports.getHealthStatus = (req, res) => {
    var knexConf = store.knex();
    query = 'select 1+1 as result';
    if (persistenceType === 'oracle'){
        query = 'select * from DUAL';
    }
    knexConf.raw(query)
        .then(() => {
            logger.info('Application is running and DB is connected');
            res.status(200).json({ status: 'running' })
        })
        .catch(err => {
            logger.error('Application is running but DB connection is failed');
            logger.error(err);
            res.status(500).json({ status: 'Application is running but DB connection is failed', error: err })
        });
}

exports.getAllProcessStats = (req, res) => {
    // var limit, offset, processName;
    // req.body.limit ? limit = req.body.limit : null;
    // req.body.offset ? limit = req.body.offset : null;
    // req.body.processName ? processName = req.body.processName : '*'
    const processloggingstats = store.ProcessInstanceStore.getInstance();
    if (processloggingstats) {
        // knex.select('*').from('users').limit(limit).offset(offset).then(nodes => {
        //     res.status(200).json({ data: nodes })
        // })
        processloggingstats.findAll().then(nodes => {
            res.status(200).json({ data: nodes })
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
    }
}
exports.saveActivityStats = (req, res) => {
    var activityModelData = activityModel.init(req.body);  
   store.knex().batchInsert(store.TableNames.activityStats, activityModelData)
        .returning(['processinstanceid', 'activityname'])
        .then(function (ids) {
            if(persistenceType === 'mysql'){
                var logIdsMyql =[];
                activityModelData.forEach(function (element, index){
                    logIdsMyql.push(element.processinstanceid + '-' + element.activityname)
                });
                logger.info('Activity stats inserted for : '+ logIdsMyql.toString())
              } else { 
                var logIds = [];
                ids.forEach(id => {
                logIds.push(id.processinstanceid + '-' + id.activityname)
            });
            logger.info("Activity stats inserted for : " + logIds.toString())
        }
            logger.debug(activityModelData);
            res.status(200).json({});
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
}
exports.saveProcessStats = (req, res) => {
    var processModelData = processModel.init(req.body)
    store.knex().batchInsert(store.TableNames.processStats, processModelData)
        .returning('processinstanceid')
        .then(function (ids) {
            if(persistenceType === 'mysql'){
                 processModelData.forEach(function (element, index){
                 logger.info('Process stats inserted for : '+ element.processinstanceid)
              })
             } else { 
            logger.info("Process stats inserted for : " + ids.toString())
             }
            logger.debug(processModelData);
            res.status(200).json({});
        
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
}
exports.saveTransitionStats = (req, res) => {
    var transitionModelData = transitionModel.init(req.body)
    store.knex().batchInsert(store.TableNames.transitionStats, transitionModelData)
        .returning(['processinstanceid', 'transitionname'])
        .then(function (ids) {
            if(persistenceType === 'mysql'){
                var logIdsMyql =[];
                transitionModelData.forEach(function (element, index){
                    logIdsMyql.push(element.processinstanceid + '-' + element.transitionname);
                })
                  logger.info('Transition stats inserted for : '+ logIdsMyql.toString())              
             } else { 
            var logIds = [];
            ids.forEach(id => {
                logIds.push(id.processinstanceid + '-' + id.transitionname)
            });
            logger.info("Transition stats inserted for : " + logIds.toString())
        }
            logger.debug(transitionModelData);
            res.status(200).json({});
       
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
}

exports.getLogBack = (req, res) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        noderegistry.findAll({ id: req.params.id }).then(nodes => {
            nodes.forEach(node => {
                let options = {
                    url: utils.getInstanceURL(node) + "/bw/framework.json/logback",
                    method: 'GET',
                    headers: utils.getFileHeaders(node)
                };
                request(options, (err, response, body) => {
                    if (err) {
                        return handleError(res, error);
                    }
                    res.setHeader('Content-Type', 'application/xml');
                    res.setHeader('Content-Disposition', 'attachment');

                    res.status(response.statusCode).send(body);
                });
            });
        });

    } else {
        db.get(req.params.id, (err, obj) => {
            let options = {
                url: utils.getInstanceURL(obj) + "/bw/framework.json/logback",
                method: 'GET',
                headers: utils.getFileHeaders(obj)
            };
            request(options, (err, response, body) => {
                if (err) {
                    return handleError(res, error);
                }
                res.setHeader('Content-Type', 'application/xml');
                res.setHeader('Content-Disposition', 'attachment');
                res.status(response.statusCode).send(body);
            });
        });
    }
}

exports.uploadLogBack = (req, res, callback) => {
    var results = {};
    var count = 0;
    const noderegistry = store.NodeStore.getInstance();
    req.body.params.nodeIdArray.forEach((node) => {
        if (persistenceType === 'jfs') {
            db.get(node, (err, details) => {
                results[node] = details;
                count++;
                if (count === req.body.params.nodeIdArray.length) {
                    callback(req, res, results);
                }
            })
        } else {
            noderegistry.findAll({ id: node }).then((details) => {
                details.forEach(el => {
                    results[el.id] = el;
                    count++;
                });
            }).then((result) => {
                if (count === req.body.params.nodeIdArray.length)
                    callback(req, res, results);
            }).catch((err) => {
                logger.error(err);
                res.status(500).json(err);
            });
        }
    });
}

exports.getDetails = (callback) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        noderegistry.findAll().then((details) => {
            let results = {};
            details.forEach(el => {
                results[el.id] = el;
            });
            callback(results);
        }).catch((err) => {
            logger.error(err);
            callback(err);
        });
    } else {
        db.all((err, nodes) => {
            if (err) {
                return handleError(res, err);
            }
            callback(nodes, '*', (err, states) => {
                if (err) {
                    logger.warn('Error while handling the request ');
                    return handleError(res, err);
                }
                logger.info('Request Successful');
                res.status(200).json(states);
            });
        });
    }

}

function handleError(res, err) {
    return res.status(500).send(err);
}



exports.hostClash = (req, res) => {
    const noderegistry = store.NodeStore.getInstance();
    const statregistry = store.StatStore.getInstance();
    var flag = false;

    if (noderegistry) {
        var updatedID;
        noderegistry.findAll().then(details => {
            if (req.body.space_name) {
                for (let data in details) {
                    if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name === req.body.instanceName && details[data].routingURL === req.body.routingURL) {
                        res.status(200).json(_.extend(details[data], { id: details[data].id }));
                    } /*else if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name !== req.body.instaneName) {
                        noderegistry.update(details[data].id, { name: req.body.instanceName, space: req.body.space_name }).then(response => {
                            logger.info('Successfully Inserted the stat details same host and port  ');
                            res.status(200).json(_.extend(details[data], { id: details[data].id }));

                        }).catch(err => {
                            logger.error(err);
                        });
                    }*/ else if ((details[data].host !== req.body.host || details[data].port !== req.body.port) && details[data].name === req.body.instanceName && details[data].routingURL === req.body.routingURL) {
                        console.log("in duplicate update");
                        noderegistry.update(details[data].id, { host: req.body.host, port: req.body.port, applicationGUID: req.body.applicationGUID, space: req.body.space_name }).then(response => {
                            logger.info('Successfully Updated node registery for same instance name and routing URL  ');
                            res.status(200).json(_.extend(details[data], { id: details[data].id }));

                        }).catch(err => {
                            logger.error(err);
                            res.status(500).json(err);
                        });
                    }
                }

            } else {
                for (let data in details) {
                    if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name === req.body.instaneName) {
                        res.status(200).json(_.extend(details[data], { id: details[data].id }));

                    } else if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name !== req.body.instaneName) {
                        noderegistry.update(details[data].id, { name: req.body.instanceName }).then(response => {
                            // saveProcesstoDb(node);
                            logger.info('Successfully Inserted the stat details same host and port  ');

                            res.status(200).json(_.extend(details[data], { id: details[data].id }));
                        }).catch(err => {
                            logger.error(err);
                            res.status(500).json(err);
                        });
                    }
                }
            }
        }).catch((err) => {
            logger.error(err);
            res.status(500).json(err);
        });
    }


    else {
        let details = nodedb.allSync();
        for (let data in details) {
            if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name === req.body.instaneName) {
                logger.log('Successfully saved the data ')
                res.status(200).json(_.extend(details[data], { id: details[data].id }));
            } else if (details[data].host === req.body.host && details[data].port === req.body.port && details[data].name !== req.body.instaneName) {
                db.delete(details[data].id, (err, res) => {
                    if (err) { }
                    db.save({ name: req.body.instanceName }, (err, results) => {
                        logger.log('Successfully updated the data ')
                        res.status(200).json(_.extend(details[data], { id: details[data].id }));

                    })
                })
            }
        }
    }
}





exports.registerNode = (req, res, callback) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        let duplicate = false;
        noderegistry.findAll().then(details => {
            if (details.length > 0) {
                details.forEach(el => {
                    if (req.body.hasOwnProperty('space_name')) {
                        if (el.name === req.body.instanceName && el.routingURL === req.body.routingURL) {
                            duplicate = true;
                        }
                    } else {
                        if (el.host === req.body.host && el.port === req.body.port) {
                            duplicate = true;
                        }
                    }

                });
                callback(req, res, duplicate);
            } else {
                callback(req, res, false);
            }
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        // For local environment
        var objs = db.allSync();
        let duplicate = false;
        let instStatsForExisting = false;
        for (let obj in objs) {
            if (objs[obj].host === req.body.host && objs[obj].port === req.body.port) {
                duplicate = true;
            }
        }
        callback(req, res, duplicate);
    }
}

exports.getState = (callback, test, req, res, response, body) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        const tempObj = {};
        noderegistry.findAll().then((details) => {
            if (details.length > 0) {
                details.forEach(el => {
                    const id = el.id;
                    tempObj[id] = { host: el.host, port: el.port, name: el.name, applicationGUID: el.applicationGUID, routingURL: el.routingURL }
                });
                callback(tempObj, test, req, res, response, body);

            } else {
                callback({}, test, req, res, response, body);
            }
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        var nodes = db.allSync();
        callback(nodes, test, req, res, response, body);
    }
}
exports.changeStats = (space, name, application_name, statType, version, flag, res, callback) => {
    const statregistry = store.StatStore.getInstance();
    var statflag = false;
    //changed for name alias
    //var aName = (displayAppName && application_name) ? application_name : name;
    var aName = name;
    if (statregistry) {
        statregistry.findAll().then(details => {
            for (let data in details) {
                if (space !== null) {
                    if (details[data].appname === aName && details[data].appversion === version && details[data].space === space) {
                        var statusApp;
                        var stats = details[data].status.split('-');
                        let processStatus = stats[0];
                        var id = details[data].statuid;
                        let activityInstanceStatus = stats[2];
                        statflag = true;
                        let processinstanceStatus = stats[1];
                        if (statType === 'process' && flag) {
                            statusApp = 'true-'.concat(stats[1], '-', stats[2])
                        } else if (statType === 'process' && !flag) {
                            statusApp = 'false-'.concat(stats[1], '-', stats[2])

                        }
                        if (statType === 'processinstance' && flag) {
                            statusApp = stats[0].concat('-true-', 'true');
                        } else if (statType === 'processinstance' && !flag) {
                            statusApp = stats[0].concat('-false-', 'false');

                        }
                        if (statType === 'activityinstance' && flag) {
                            statusApp = stats[0].concat('-', 'true', '-true');
                        } else if (statType === 'activityinstance' && !flag) {
                            statusApp = stats[0].concat('-', 'false', '-false');

                        }
                        if (statType === 'transitioninstance') {
                            statflag = false;
                        }
                    }
                    if (statflag) {
                        if (statusApp) {
                            statregistry.update(id, { status: statusApp }).then(res => {
                                logger.info(' Few stats calls failed and updated accordingly');

                            }).catch(err => {
                                logger.error(err);
                                res.status(500).json(err);
                            });
                        }
                    }
                } else {

                    if (details[data].appname === aName && details[data].appversion === version) {
                        var statusApp;
                        var stats = details[data].status.split('-');
                        let processStatus = stats[0];
                        var id = details[data].statuid;
                        statflag = true;

                        let activityInstanceStatus = stats[2];
                        let processinstanceStatus = stats[1];
                        if (statType === 'process' && flag) {
                            statusApp = 'true-'.concat(stats[1], '-', stats[2])
                        } else if (statType === 'process' && !flag) {
                            statusApp = 'false-'.concat(stats[1], '-', stats[2])

                        }
                        if (statType === 'processinstance' && flag) {
                            statusApp = stats[0].concat('-true-', 'true');
                        } else if (statType === 'processinstance' && !flag) {
                            statusApp = stats[0].concat('-false-', 'false');

                        }
                        if (statType === 'activityinstance' && flag) {
                            statusApp = stats[0].concat('-', 'true', '-true');
                        } else if (statType === 'activityinstance' && !flag) {
                            statusApp = stats[0].concat('-', 'false', '-false');

                        }
                        if (statType === 'transitioninstance') {
                            statflag = false;
                        }
                    }
                    if (statflag) {
                        if (statusApp) {
                            statregistry.update(id, { status: statusApp }).then(res => {
                                logger.info(' Few stats calls failed and updated accordingly');

                            }).catch(err => {
                                logger.error(err);
                                res.status(500).json(err);
                             })
                        }

                    }


                }
            }
        })
        callback();
    } else {
        var statDet;
        let details = statdb.allSync();
        for (let data in details) {
            if (space !== null) {

                if (details[data].appname === aName && details[data].space === space && details[data].appversion === version) {
                    var statusApp;
                    var stats = details[data].status.split('-');
                    let processStatus = stats[0];
                    statDet = details[data];
                    statflag = true;

                    var id = data;
                    let activityInstanceStatus = stats[2];
                    let processinstanceStatus = stats[1];
                    if (statType === 'process' && flag) {
                        statusApp = 'true-'.concat(stats[1], '-', stats[2])
                    } else if (statType === 'process' && !flag) {
                        statusApp = 'false-'.concat(stats[1], '-', stats[2])

                    }
                    if (statType === 'processinstance' && flag) {
                        statusApp = stats[0].concat('-true-', 'true');
                    } else if (statType === 'processinstance' && !flag) {
                        statusApp = stats[0].concat('-false-', 'false');

                    }
                    if (statType === 'activityinstance' && flag) {
                        statusApp = stats[0].concat('-', 'true', '-true');
                    } else if (statType === 'activityinstance' && !flag) {
                        statusApp = stats[0].concat('-', 'false', '-false');

                    }
                    if (statType === 'transitioninstance') {
                        statflag = false;
                    }
                    statDet.status = statusApp;
                }
                if (statflag) {

                    statdb.delete(id, function (err) {
                        statdb.save(statDet, (error, ids) => {
                            if (error) {
                                return handleError(res, error);
                            }
                            logger.info('Updated details successfully ');

                        }).catch(err => {
                            logger.error(err);
                            res.status(500).json(err);
                        });
                    });
                }



            } else {

                if (details[data].appname === aName && details[data].appversion === version) {
                    var statusApp;
                    var stats = details[data].status.split('-');
                    let processStatus = stats[0];
                    var id = data;
                    statDet = details[data];
                    statflag = true;

                    let activityInstanceStatus = stats[2];
                    let processinstanceStatus = stats[1];
                    if (statType === 'process' && flag) {
                        statusApp = 'true-'.concat(stats[1], '-', stats[2])
                    } else if (statType === 'process' && !flag) {
                        statusApp = 'false-'.concat(stats[1], '-', stats[2])

                    }
                    if (statType === 'processinstance' && flag) {
                        statusApp = stats[0].concat('-true-', 'true');
                    } else if (statType === 'processinstance' && !flag) {
                        statusApp = stats[0].concat('-false-', 'false');

                    }
                    if (statType === 'activityinstance' && flag) {
                        statusApp = stats[0].concat('-', 'true', '-true');
                    } else if (statType === 'activityinstance' && !flag) {
                        statusApp = stats[0].concat('-', 'false', '-false');

                    }
                    if (statType === 'transitioninstance') {
                        statflag = false;
                    }
                    statDet.status = statusApp;
                }
                if (statflag) {
                    statdb.delete(id, function (err) {
                        statdb.save(statDet, (error, ids) => {
                            if (error) {
                                return handleError(res, error);
                            }
                            logger.info('Updated details successfully ');

                        });
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                }



            }
        }
        callback();


    }
}

var getStatus = (statDetailsData, callback, name, space, version) => {
    for (let data in statDetailsData) {
        if (space !== null) {
            if (statDetailsData[data].appname === name && statDetailsData[data].space === space && statDetailsData[data].appversion === version) {
                callback(statDetailsData[data].status);
            }
        } else {
            if (statDetailsData[data].appname === name && statDetailsData[data].appversion === version) {
                callback(statDetailsData[data].status);

            }
        }
    }
}
var sample = [];
var body1;
exports.getStats = (name, version, space, callback) => {
    sample = [].slice();
    var count = 0;
    var ids = uuidv1();
    const statregistry = store.StatStore.getInstance();
    const noderegistry = store.NodeStore.getInstance();
    const process = store.ProcessStore.getInstance();
    if (statregistry) {
        statregistry.findAll().then(details => {
            if (details.length === 0) {
                noderegistry.findAll().then(nodeDetails => {

                    for (let node in nodeDetails) {
                        let optionsApp = {
                            url: utils.getInstanceURL(nodeDetails[node]) + "/bw/app.json/state?name=*",
                            method: 'GET',
                            headers: utils.getRestHeaders(nodeDetails[node])
                        };
                        request(optionsApp, (err, responseApp, bodyApp) => {
                            var testSample = false;
                            if (typeof responseApp === 'undefined') {
                            } else if (responseApp.statusCode != 200) {
                            }
                            else {
                                count++;
                                var body1 = Object.assign(JSON.parse(bodyApp));
                                var a = { name: body1.states[0].name, version: body1.states[0].version, space: nodeDetails[node].space };

                                var body2 = [].slice();
                                body2 = body1.states;
                                var nameApp = body2[0].name;
                                var versionApp = body2[0].version;
                                for (let x in sample) {
                                    if (sample[x].name === nameApp && sample[x].version === versionApp && sample[x].space === nodeDetails[node].space) {
                                        testSample = true;
                                        break;

                                    }
                                }
                                if (testSample) {
                                    if (count === nodeDetails.length) {
                                        statregistry.findAll().then(statDetailsData => {

                                            getStatus(statDetailsData, callback, name, space, version);
                                        }).catch(err => {
                                            logger.error(err);
                                            callback(err);
                                        });
                                    }
                                } else {
                                    sample.push(a);
                                    var ids = uuidv1();
                                    // changed for name alias
                                    let aName = (displayAppName && body1.states[0].application_name) ? body1.states[0].application_name : body1.states[0].name;
                                    statregistry.create({ statuid: ids, space: nodeDetails[node].space, appversion: body1.states[0].version, status: 'false-false-false', appname: aName }).then(res => {
                                        if (count === nodeDetails.length) {
                                            statregistry.findAll().then(statDetailsData => {

                                                getStatus(statDetailsData, callback, name, space, version);

                                            }).catch(err => {
                                                logger.error(err);
                                                callback(err);
                                            });
                                        }
                                    }).catch(err => {
                                        logger.error(err);
                                        callback(err);
                                    });
                                }
                            }
                        });
                    }
                }).catch(err => {
                    logger.error(err);
                    callback(err);
                });
            }
            else {
                getStatus(details, callback, name, space, version);
            }
        }).catch(err => {
            logger.error(err);
            callback(err);
        });

    } else {
        let details = statdb.allSync();
        if (details.length === 0) {
            let nodeDetails = db.allSync();
            for (let node in nodeDetails) {
                let optionsApp = {
                    url: utils.getInstanceURL(nodeDetails[node]) + "/bw/app.json/state?name=*",
                    method: 'GET',
                    headers: utils.getRestHeaders(nodeDetails[node])
                };
                request(optionsApp, (err, responseApp, bodyApp) => {
                    if (typeof responseApp === 'undefined') {
                    } else if (responseApp.statusCode != 200) {
                    }
                    else {

                        var a = { name: body1.states[0].name, version: body1.states[0].version, space: nodeDetails[node].space };

                        var body2 = [].slice();
                        body2 = body1.states;
                        var nameApp = body2[0].name;
                        var versionApp = body2[0].version;
                        for (let x in sample) {
                            if (sample[x].name === nameApp && sample[x].version === versionApp && sample[x].space === nodeDetails[node].space) {
                                testSample = true;
                                break;

                            }
                        }
                        if (testSample) {
                            if (count === nodeDetails.length) {
                                let StatsDetails = statdb.allSync();
                                getStatus(StatsDetails, callback, name, space, version);

                                callback('false-false-false');
                            }
                        } else {
                            sample.push({ name: body1.states[0].name, version: body1.states[0].version, space: nodeDetails[node].space });

                            statdb.save(a, (err, id) => {
                                if (err) {
                                    logger.warn('Error saving status in stat registry');
                                }
                                logger.info('Successfully Inserted the stat details ');
                                if (count === nodeDetails.length) {
                                    let StatsDetails = statdb.allSync();
                                    getStatus(StatsDetails, callback, name, space, version);

                                    callback('false-false-false');
                                }
                            })
                        }

                    }
                });
            }
        } else {
            getStatus(details, callback, name, space, version);

            callback('false-false-false');
        }


    }

}

exports.saveToDb = (res, response, body, node, saveProcesstoDb) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        node.nodeId = uuidv1();
        if (node.space_name) {
            createUpdateStats(node, (flag) => {
                if (flag) {
                    noderegistry.create({ id: node.nodeId, host: node.host, port: node.port, name: node.name, state: node.state, space: node.space_name, applicationGUID: node.applicationGUID, routingURL: node.routingURL, application_name: node.application_name, product_version: node.product_version }).then(item => {
                        logger.info('Registered container with (host, port):(' + node.host + ', ' + node.port + ')');
                        saveProcesstoDb(node);
                        res.status(response.statusCode).json(_.extend(body, { id: item.id }));
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                }
            });
        } else {
            createUpdateStats(node, (flag) => {
                if (flag) {
                    noderegistry.create({ id: node.nodeId, host: node.host, port: node.port, name: node.name, state: node.state, product_version: node.product_version }).then(item => {
                        logger.info('Registered container with (host, port):(' + node.host + ', ' + node.port + ')');
                        saveProcesstoDb(node);
                        res.status(response.statusCode).json(_.extend(body, { id: item.id }));
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                }
            });
        }
    } else {
        createUpdateStats(node, (flag) => {
            node.space = node.space_name;
            delete node.space_name;
            delete node.appName;
            db.save(node, (error, id) => {
                if (error) {
                    return handleError(res, error);
                }
                body.host = node.host;
                body.port = node.port;
                body.name = node.name;
                logger.info('Registered container with (host, port):(' + node.host + ', ' + node.port + ')');
                res.status(response.statusCode).json(_.extend(body, {
                    id: id
                }));
            });
        });
    }

}



var createUpdateStats = (node, callback) => {
    const statregistry = store.StatStore.getInstance();
    node.nodeId = uuidv1();
    var flag = false;
    var appStatus = 'false-false-false';
    var updatedId;
    // changed for display name alias pcf
    //var aName = (displayAppName && node.application_name) ? node.application_name : node.appName;
    var aName = node.appName;
    if (statregistry) {
        statregistry.findAll().then(details => {
            for (let data in details) {
                if (node.space_name) {
                    if (details[data].space == node.space_name && details[data].appname == aName && details[data].appversion == node.appVersion) {
                        appStatus = details[data].status;
                        flag = true;
                        updatedId = details[data].statuid;
                        break;
                    }
                } else {
                    if (details[data].appname === aName && details[data].appversion == node.appVersion) {
                        appStatus = details[data].status;
                        flag = true;
                        updatedId = details[data].statuid;
                        break;
                    }
                }
            }
            let id = uuidv1();
            // TODO add appname as well into datatbase 
            if (!flag) {
                if (node.space_name) {
                    statregistry.create({ statuid: id, space: node.space_name, appversion: node.appVersion, status: appStatus, appname: aName }).then(res => {
                        logger.info('Successfully Inserted the stat details ');
                        updatedId = id;
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                } else {
                    statregistry.create({ statuid: id, status: appStatus, appversion: node.appVersion, appname: aName }).then(res => {
                        logger.info('Successfully Inserted the stat details ');
                        updatedId = id;
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                }
            }
            appnodes.updateStatDetails(node, appStatus, (results, stats) => {
                var arr1 = [];
                for (let result in results) {
                    if (!results[result]) {
                        arr1.push(result);
                    }
                }
                if (arr1.length !== 0) {
                    statregistry.findAll({ statuid: updatedId }).then(res => {
                        if (res.status) {
                            var stats = res.status.split('-');
                            var fstats;
                            arr1.forEach(data => {
                                if (data === 'process') {
                                    fstats = 'false-'.concat(stats[1], '-', stats[2]);
                                } else if (data === 'processinstance') {
                                    fstats = stas[0].concat('-false-', stats[2]);
                                } else if (data === 'activityinstance') {
                                    fstats = stats[0].concat('-', stats[1], '-false')
                                }
                            })
                            statregistry.update(updatedId, { status: fstats }).then(res => {
                                logger.info(' Few stats calls failed and updated accordingly ');

                            }).catch(err => {
                                logger.error(err);
                                res.status(500).json(err);
                            });
                        }
                    }).catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
                }
                callback(true);

            })
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        let details = statdb.allSync();
        for (let data in details) {
            if (node.space_name) {
                if (details[data].space === node.space_name && details[data].appname === aName && details[data].appversion === node.appVersion) {
                    appStatus = details[data].status;
                    flag = true;
                    updatedId = details[data].statuid;
                    break;
                }
            } else {
                if (details[data].appname === aName && details[data].appversion === node.appVersion) {
                    appStatus = details[data].status;
                    flag = true;
                    updatedId = details[data].statuid;
                    break;
                }
            }
        }
        if (!flag) {
            var obj;
            if (node.space_name) {
                obj = { appversion: node.appVersion, space: node.space_name, status: appStatus, name: node.name, appname: aName };
            } else {
                obj = { appversion: node.appVersion, status: appStatus, name: node.name, appname: aName };

            }
            statdb.save(obj, (err, id) => {
                if (err) {
                    logger.warn('Error saving status in stat registry');
                }
                logger.info('Successfully Inserted the stat details ');
                updatedId = id;
            })

        }
        appnodes.updateStatDetails(node, appStatus, (results, stats) => {
            let arr1 = [];
            for (let result in results) {
                if (!results[result]) {
                    arr1.push(result);
                }
            }
            if (arr1.length !== 0) {
                statdb.get(updatedId, (err, res) => {
                    if (res.status) {
                        var resp = res;
                        var stats = res.status.split('-');
                        var fstats;
                        arr1.forEach(data => {
                            if (data === 'process') {
                                fstats = 'false-'.concat(stats[1], '-', stats[2]);
                            } else if (data === 'processinstance') {
                                fstats = stas[0].concat('-false-', stats[2]);
                            } else if (data === 'activityinstance') {
                                fstats = stats[0].concat('-', stats[1], '-false')
                            }
                        })
                        statdb.delete(updatedId, function (err) {
                            statdb.save(resp, (error, id) => {
                                if (error) {
                                    return handleError(res, error);
                                }
                                logger.info('Updated details successfully ');

                            });
                        }).catch(err => {
                            logger.error(err);
                            res.status(500).json(err);
                        });
                    }
                }).catch(err => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            }
            callback(true);

        })
    }
}


exports.delete = (nodeID, node, callback) => {
    const noderegistry = store.NodeStore.getInstance();
    const processRegistry = store.ProcessStore.getInstance();
    if (noderegistry) {
        noderegistry.destroy(nodeID).then(nd => {
            if (processRegistry && persistenceType === 'mongo') {
                processRegistry.findAll({ nodeId: nodeID }).then(nodes => {
                    nodes.forEach((node) => {
                        processRegistry.destroy(node.id).then(res => {
                            logger.info('Successfully removed the entry from process table');
                        });
                    });
                }).catch(err => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            }
            logger.info('Unregistered container with (host, port):(' + node.host + ', ' + node.port + ')');
            callback(null, { 'delete': true });
        });
    } else {
        db.delete(nodeID, function (err) {
            logger.info('Unregistered container with (host, port):(' + node.host + ', ' + node.port + ')');
            callback(null, { 'delete': true });
        });
    }

}

// Delete a node 
exports.deleteSync = (req, res) => {
    const nodeId = req.params.id;
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        noderegistry.destroy(nodeId).then(id => {
            logger.info('Unregistered container');
            res.status(200).json('Unregistered container');
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        db.deleteSync(nodeId);
        res.status(200).json('Unregistered container');
    }
}

exports.loadAppNodeById = (req, res, next, id) => {
    const noderegistry = store.NodeStore.getInstance();
    if (noderegistry) {
        noderegistry.findAll({ id: id }).then(nodes => {
            nodes.forEach(node => {
                req.appnode = node;
                next();
            });
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        db.get(id, (err, obj) => {
            if (err) {
                return next(err);
            }
            if (!obj) {
                return next(new Error('Failed to load AppNode by id ' + id));
            }
            req.appnode = obj;
            next();
        });
    }
}
exports.getProcesses = (req, res, callback) => {
    const processRegistry = store.ProcessStore.getInstance();
    let processes = [];
    if (processRegistry) {
        processRegistry.findAll({ nodeId: req.appnode.id }).then(processes1 => {
            processes1.forEach(value => {
                // it is not required in client so setting source as null in response as it is hampering performance while downloading content.
                value['source'] = null;
                processes.push(value);
            });
            callback(res, processes);
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        callback(res, null);
    }
}

exports.getProcessInstanceStats = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let offset = req.query.offset;
    let limit = req.query.limit;
    let instanceName = node.name;
    let status = req.query.status;
    let sortBy = req.query.sortBy;
    let sortOrder = req.query.sortOrder;
    let startDate = +req.query.startDate;
    let endDate = +req.query.endDate;
    let searchText = req.query.searchText;
    let orderBy;
    let whereClause = {
        applicationname: { '==': appName },
        applicationversion: { '==': appVersion },
        appnodename: { '==': instanceName }
    };
    if (processName !== 'null') {
        whereClause.processname = { '==': processName }
    }
    if (status !== 'null') {
        whereClause.processinstancestate = { '==': status }
    }
    if (sortBy === undefined || sortBy === 'null') {
        orderBy = ['processinstanceuid', 'asc'];
    } else {
        orderBy = [sortBy, sortOrder];
    }

    if (startDate > 0 && endDate > 0) {
        whereClause.processinstancestarttime = { '>=': startDate, '<=': endDate };
    }

    if (searchText && searchText !== 'null') {
        // add the list of process instance id's having searchText from input/output data of activity logging stats table
        const activityloggingstats = store.ActivityStore.getInstance();
        if (activityloggingstats) {
            activityloggingstats.findAll(
                {
                    where: {
                        activityinput: { '|like': '%' + searchText + '%' },
                        activityoutput: { '|like': '%' + searchText + '%' }
                    }
                }
            ).then(activities => {
                let processInstanceIds = [];
                for (let actId in activities) {
                    processInstanceIds.push(activities[actId].processinstanceid);
                }
                whereClause.processinstanceid = { 'in': processInstanceIds }
                getProcessInstanceStats(res, whereClause, limit, offset, orderBy);

            })
        } else {
            getProcessInstanceStats(res, whereClause, limit, offset, orderBy);
        }
    } else {
        getProcessInstanceStats(res, whereClause, limit, offset, orderBy);
    }
}

function getProcessInstanceStats(res, whereClause, limit, offset, orderBy) {
    const processInstanceRegistry = store.ProcessInstanceStore.getInstance();
    if (processInstanceRegistry) {
        processInstanceRegistry.findAll(
            {
                where: whereClause,
                limit: limit,
                offset: offset,
                orderBy: [orderBy]
            }
        ).then(processInstanceData => {
            res.status(200).json(processInstanceData);
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        res.status(200).json([]);
    }
}

exports.getAllProcessInstanceStats = (req, res) => {
    const processInstanceRegistry = store.ProcessInstanceStore.getInstance();
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let instanceName = node.name;
    let whereClause = {
        applicationname: { '==': appName },
        applicationversion: { '==': appVersion },
        processname: { '==': processName },
        appnodename: { '==': instanceName }
    };
    if (processInstanceRegistry) {
        processInstanceRegistry.findAll(
            {
                where: whereClause
            }
        ).then(processInstanceData => {
            res.status(200).json(processInstanceData);
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        res.status(200).json([]);
    }
}

exports.getActivityInstanceStats = (req, res) => {
    const activityInstanceRegistry = store.ActivityStore.getInstance();
    const transactionInstanceRegistry = store.TransitionStore.getInstance();
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let processinstancejobid = req.query.processinstancejobid;
    let processstarttime = req.query.processstarttime;
    let processendtime = req.query.processendtime;
    let instanceName = node.name;

    async.parallel({
        activity: (callback) => {
            if (activityInstanceRegistry) {
                activityInstanceRegistry.findAll(
                    {
                        where: {
                            applicationname: { '==': appName },
                            applicationversion: { '==': appVersion },
                            processname: { '==': processName },
                            appnodename: { '==': instanceName },
                            processinstanceid: { '==': processinstancejobid },
                            activitystarttime: {
                                '>=': processstarttime,
                                '<=': processendtime
                            }
                        }
                    }
                ).then(processActivityData => {
                    callback(null, processActivityData)
                }).catch(err => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            } else {
                callback(null, []);
            }
        },
        transition: (callback) => {
            if (transactionInstanceRegistry) {
                transactionInstanceRegistry.findAll(
                    {
                        where: {
                            applicationname: { '==': appName },
                            applicationversion: { '==': appVersion },
                            processname: { '==': processName },
                            appnodename: { '==': instanceName },
                            processinstanceid: { '==': processinstancejobid }
                        }
                    }
                ).then(transitionActivityData => {
                    callback(null, transitionActivityData)
                }).catch(err => {
                    logger.error(err);
                    res.status(500).json(err);
                });
            } else {
                callback(null, []);

            }
        }
    }, function (error, results) {
        res.status(200).json(results);
    })
}
exports.getSubprocessInstances = (req, res) => {
    const processInstanceRegistry = store.ProcessInstanceStore.getInstance();
    let orderBy;
    let sortBy;
    if (sortBy === undefined || sortBy === 'null') {
        orderBy = ['processinstanceuid', 'asc'];
    } else {
        orderBy = [req.query.sortBy, req.query.sortOrder];
    }
    let whereClause = {
        applicationname: { '==': req.query.appName },
        applicationversion: { '==': req.query.appVersion },
        appnodename: { '==': req.appnode.name },
        parentprocessname: { '==': req.query.processName },
        parentprocessinstanceid: { '==': req.query.processinstancejobid },
        processinstancestarttime: {
            '>=': req.query.processstarttime,
            '<=': req.query.processendtime
        }
    };
    if (processInstanceRegistry) {
        processInstanceRegistry.findAll(
            {
                where: whereClause,
                orderBy: [orderBy]
            }
        ).then(subProcessInstanceData => {
            res.status(200).json(subProcessInstanceData);
        }).catch(err => {
            logger.error(err);
            res.status(500).json(err);
        });
    } else {
        res.status(200).json([]);
    }
}