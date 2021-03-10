'use strict';
const request = require('request');
const async = require('async');
var operations = require('../../db/db.opts.js');
const _ = require('lodash');
var db = require('../../datastore/init.datastore.js').nodedb;
var statdb = require('../../datastore/init.datastore.js').statdb;
var logger = require('../../logger/logger');
require('dotenv').config();
const uuidv1 = require('uuid/v1');
var store = require('../../db/init.db.js');
var applications = require('../applications/application.controller.js');
var utils = require('../../utils/utils.js');
var getStateRetryCount = 0;
const ROUTING_RETRY_COUNT = process.env.ROUTING_RETRY_COUNT || 20;
const ROUTING_RETRY_INTERVAL = process.env.ROUTING_RETRY_INTERVAL || 3000;
var appDetails = require('../../../app-version.json');

// Get list of nodes
exports.index = (req, res) => {
    db.all((err, objs) => {
        if (err) {
            return handleError(res, err);
        }

        var requests = {};
        for (let nodeId in objs) {
            let node = objs[nodeId];
            requests[nodeId] = function (callback) {
                let host = node.host;
                let port = node.port;
                let options = {
                    // url: `http://${host}:${port}/bw/framework.json/state`,
                    url: utils.getInstanceURL(node)+"/bw/framework.json/state",
                    method: 'GET',
                    headers: utils.getRestHeaders(node)
                };
                request(options, (err, response, body) => {
                    if (err) {
                        if (err.code === 'ECONNREFUSED') {
                            node.state = "Stopped";
                            callback(null, node);
                        }
                    } else if (response.statusCode != 200) {
                        callback(response.statusMessage);
                    } else {
                        //code to update appnode name and status.
                        body = JSON.parse(body);
                        node.name = body.name;
                        node.state = body.state;
                        body.port = node.port;
                        body.host = node.host;
                        body.applicationGUID = node.applicationGUID;
                        body.routingURL = node.routingURL;
						body.product_version = node.product_version;
                        callback(null, body); //.replace(/\r?\n|\r/g, "")));                                                                        
                    }
                });
            }
        }
        async.parallel(requests, (err, results) => {
            if (err) {
                return handleError(res, err);
            }
            for (var node in results) {
                var newNode = results[node];
                let data = {};
                data.name = newNode.name;
                data.state = newNode.state;
                data.host = newNode.host;
                data.port = newNode.port;
                data.applicationGUID = newNode.applicationGUID;
                data.routingURL = newNode.routingURL;
				data.product_version = newNode.product_version;
                db.saveSync(node, data);
                //db.save
            }
            res.status(200).json(results);
        });
        //return res.status(200).json(objs);
    });
};
const LoadUAA= process.env.AUTHENTICATION_MODE ;

exports.platformDetails = (req, res) => {
    var UAA = false;
     var ver = appDetails.version;
    if (process.env.VCAP_SERVICES) {
        if (LoadUAA === 'UAA') {
            UAA = true;
        }
        res.status(200).json({ env: 'pcf', LoadUAA: UAA, version: ver });

    } else {
        res.status(200).json({ env: 'others', version: ver });
    }

}

exports.updateStatDetails = (node, appStatus, testFn) => {
    var status = appStatus.split('-');
    let baseUrl = utils.getInstanceURL(node) + "/bw/statistics.json";
    var requests12 = [
        'process',
        'processinstance',
        'activityinstance',
        'transitioninstance'
    ];
    if (status[0] === 'true') {
    } else {
        requests12.splice(requests12.indexOf('process'), 1);

    }
    if (status[1] === 'true') {
    } else {
        requests12.splice(requests12.indexOf('processinstance'), 1);

    }
    if (status[2] === 'true') {
    } else {
        requests12.splice(requests12.indexOf('activityinstance'), 1);

    }
    if (status[2] === 'true') {
    } else {
        requests12.splice(requests12.indexOf('transitioninstance'), 1);

    }
    let requests = requests12.reduce((accumulator, endpoint) => {
            accumulator[endpoint] = function (callback) {
                let actualEndpoint;
                if (endpoint === "process") {
                    actualEndpoint = utils.getInstanceURL(node) + "/bw/statistics.json/instrumentationstat";
                } else if (endpoint === "processinstance") {
                    actualEndpoint = utils.getInstanceURL(node) + "/bwm/monitor.json/executionstat?entity=process";
                } else if (endpoint === "activityinstance") {
                    actualEndpoint = utils.getInstanceURL(node) + "/bwm/monitor.json/executionstat?entity=activity";
                }
                else if (endpoint === "transitioninstance") {
                    actualEndpoint = utils.getInstanceURL(node) + "/bwm/monitor.json/executionstat?entity=transition";
                }
                let options = {
                    url: `${actualEndpoint}`,
                    method: 'POST',
                    headers: utils.getRestHeaders(node)
                };
                request(options, (err, response, body) => {
                    if (err) {
                        callback(err, false);
                    } else if (response.statusCode != 200) {
                    callback(null, true);
                }
            });
            };
    return accumulator;
}, {});

    async.parallel(requests, (err, results) => {
        if (err) {
            return handleError(res, err);
        }
    testFn(results, requests12);
});
}
exports.uploadlogBack = (req, res) => {
    operations.uploadLogBack(req, res, uploadFile);


}

exports.getLogBack = (req, res) => {
    operations.getLogBack(req, res);

}
exports.getHealthStatus = (req, res) => {
    operations.getHealthStatus(req, res);
}



// Creates a new node.
exports.create = (req, res) => {
    logger.info("Register details:");
    logger.info(req.body);
    operations.getDetails((details) => {
        if(details.stack) {
		    logger.error(details)
            res.status(500).json(details);
    } else {
        applications.deleteBeforeInsert(details, (err, results) => {
            if (err) {
                logger.warn('Error while handling the request ');
                return handleError(res, err);
            }
            operations.registerNode(req, res, validCheck);
    })
    }
    })

    // var objs = db.allSync();
};

var validCheck = (req, res, duplicate) => {
    let incompleteRequest = false;
    if (req.body.hasOwnProperty('instanceName')) {
        if (!req.body.hasOwnProperty('host') || !req.body.hasOwnProperty('port') || !req.body.hasOwnProperty('instanceName')) {
            incompleteRequest = true;
        }
    } else {
        if (!req.body.hasOwnProperty('host') || !req.body.hasOwnProperty('port')) {
            incompleteRequest = true;
        }
    }

    if (!duplicate && !incompleteRequest) {
        const data = req.body;
        data.state = "Stopped";
        data.name = "default";
        req.appnode = data;
        return getState(req, res);
    } else {
        if (incompleteRequest) {
            logger.warn('Incomplete request please send complete request ');
            res.status(400).json({
                message: 'Incomplete request please send complete request '

            });
        } else if (duplicate) {
            operations.hostClash(req, res);
         
        }
    }
}


exports.loadAppNodeById = (req, res, next, id) => {
    operations.loadAppNodeById(req, res, next, id);
};

// Get a single node
exports.show = (req, res) => {
    return res.status(200).json(req.appnode);
    // db.get(req.params.id, (err, obj) => {
    //     if (err) {
    //         return handleError(res, err);
    //     }
    //     if (!obj) {
    //         return res.send(404);
    //     }
    //     return res.status(200).json(obj);
    // });
};

// Updates an existing node.
exports.update = (req, res) => {
    var updated = _.merge(req.appnode, req.body);
    // db.get(req.params.id, (err, obj) => {
    //     if (err) {
    //         return handleError(res, err);
    //     }
    //     if (!obj) {
    //         return res.send(404);
    //     }        
    db.save(req.params.id, updated, (err, id) => {
        if (err) {
            return handleError(err);
        }
        return res.status(201).json(_.extend(updated, {
            id: id
        }));
    });
};

// Deletes a node.
exports.destroy = (req, res) => {
    operations.deleteSync(req, res);
};
function handleError(res, err) {
    return res.status(500).send(err);
}

exports.getAppNodeRuntimeInfo = (req, res) => {
    let node = req.appnode;
    let options = {
        url: utils.getInstanceURL(node) +"/bw/framework.json/info",
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode != 200) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        res.status(response.statusCode).json(body);
    });
};

exports.getAppNodeRuntimeState = (req, res) => {
    return getState(req, res);
};

function saveToDb(res, response, body, node, saveProcesstoDb) {
    operations.saveToDb(res, response, body, node, saveProcesstoDb);
}
function getState(req, res) {
    let node = req.appnode;
    let optionsState = {
        url: utils.getInstanceURL(node) +"/bw/framework.json/state",
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(optionsState, (err, response, body) => {
        if (typeof response !== 'undefined' && response.statusCode == 200) {
            node.state = "Running";
            if (req.body.hasOwnProperty('instanceName')) {
                node.name = node.instanceName;
                delete node['instanceName'];
            } else {
                node.name = body.name;
            }


            // Get applications for registered container
            let optionsApp = {
                url: utils.getInstanceURL(node)+ "/bw/app.json/state?name=*",
                method: 'GET',
                headers: utils.getRestHeaders(node)
            };
            request(optionsApp, (err, responseApp, bodyApp) => {
                if (typeof responseApp === 'undefined') {
                    callback(null, {});
                } else if (responseApp.statusCode != 200) {
                    callback(responseApp.statusMessage);
                } else {
                    // Check containers of instrumentation status and set current to true if existing  true.
                    operations.getState(getStateDetails, bodyApp, req, res, response, body);
                    // end of instrumentation stats
                }
            });
            // end of get applications
        } else if (utils.isPCF() && response) {
            if (getStateRetryCount < ROUTING_RETRY_COUNT){
                setTimeout(()=>{
                    getState(req, res);
                    logger.info('Retry attempt '+getStateRetryCount+' for routing url: ' + req.body.routingURL);
                }, ROUTING_RETRY_INTERVAL);
                getStateRetryCount ++;
            } else {
                logger.warn('Maximum attempt for retry reached for ' + req.body.routingURL);
                res.status(400).json({
                    message: logger.warn('Requested route ' + req.body.routingURL+ ' does not exist.')
                });
            }
        }else {
            logger.warn('Container is not running for (host, port):(' + req.body.host + ', ' + req.body.port + '). Please register running container');
            res.status(400).json({
                message: 'Container is not running for (host, port):(' + req.body.host + ', ' + req.body.port + '). Please register running container'
            });
        }
    });
}



var getStateDetails = (nodes, bodyApp, req, res, response, body) => {
    let node = req.appnode;
    const application_name = req.body.appName;
    let body1 = JSON.parse(bodyApp);
    if (body1.states.length > 0) {
        let applicationName = body1.states[0].name;
        let applicationVersion = body1.states[0].version;
        node.appName = applicationName;
        node.appVersion = applicationVersion;
        //added for pcf manifest name change
        node.application_name = application_name;
        let instStatsForExisting = false;
        var requests = Object.keys(nodes).reduce((accumulator, nodeId) => {
            accumulator[nodeId] = function (callback) {
                let node = nodes[nodeId],

                    host = node.host,
                    port = node.port;
                let optionsInst = {
                    url: utils.getInstanceURL(node) + `/bw/app.json/${applicationName}/${applicationVersion}/instrumentationstat`,
                    method: 'GET',
                    headers: utils.getRestHeaders(node)
                };
                request(optionsInst, (err, responseInst, bodyInst) => {
                    if (typeof responseInst === 'undefined') {
                        callback(null, { 'status': 'false' });
                    } else if (err) {
                        if (err.code === 'ECONNREFUSED') {
                            callback(null, { 'status': 'false' });
                        }
                    } else if (responseInst.statusCode != 200) {
                        callback(responseInst.statusMessage);
                    } else {
                        callback(null, { 'status': bodyInst });
                    }
                })
            };
            return accumulator;
        }, {});

        async.parallel(requests, (err, results) => {
            for (let result in results) {
                instStatsForExisting = instStatsForExisting || results[result].status === 'true';
            }
            logger.info('Process Instrumentation for registered container is set to ' + instStatsForExisting);
            if (instStatsForExisting) {
                let options = {
                    url: utils.getInstanceURL(node) +`/bw/app.json/${applicationName}/${applicationVersion}/instrumentationstat`,
                    method: 'POST',
                    json: true,
                    headers: utils.getRestHeaders(node)
                };
                let clonedBody = {};
                Object.assign(clonedBody, body);
                request(options, (err, response1, body) => {
                    if (err) {
                        return handleError(res, err);
                    }
                    saveToDb(res, response, clonedBody, node, saveProcesstoDb)
                })
            } else {
                // special case if register container has no applications then save container without changing stats value
                saveToDb(res, response, body, node, saveProcesstoDb);
            }
        })
    } else {
        saveToDb(res, response, body, node, saveProcesstoDb)
    }

}


var uploadFile = (req, res, nodes) => {
    var requests = Object.keys(nodes).reduce((accumulator, nodeId) => {
        accumulator[nodeId] = function (callback) {
            let node = nodes[nodeId],

                host = node.host,
                port = node.port;
            let optionsInst = {
                url: utils.getInstanceURL(node) +"/bw/framework.json/logback",
                method: 'PUT',
                headers: utils.getFileHeaders(node),
                body: req.body.params.key
            };
            request(optionsInst, (err, response, body) => {
                if (err) {
                    // return handleError(res, error);
                    callback(err, false)
                }
                callback(null, true)
            });
        };
        return accumulator;
    }, {});

    async.parallel(requests, (err, results) => {
        for (let result in results) {
            if (!results[result]) {
                res.status(500).send(err);
                break;
            }
        }
        res.status(204).send();
    })


}

var saveProcesstoDb = (node) => {
    let options = {
        url: utils.getInstanceURL(node) +`/bw/app.json/process?name=${node.appName}&version=${node.appVersion}`,
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode === 200 || response.statusCode === 304) {
            const process = store.ProcessStore.getInstance();
            if (process && body.length > 0) {
                body.forEach((value) => {
                    let diagram = JSON.stringify(value.diagramConfigString);
                    process.create({ id: uuidv1(), nodeId: node.nodeId, appName: node.appName, appVersion: node.appVersion, moduleName: value.moduleName, name: value.name, diagramConfigString: value.diagramConfigString, source: value.source }).then(item => {
                    }).catch(err => {
                        logger.error(err);
                    });
                });
            }
        }
    });
}

exports.getJobStats = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let baseUrl = utils.getInstanceURL(node)+`/bw/app.json/${appName}/${appVersion}`;
    let requests = [
        'createdjobscount',
        'runningjobscount',
        'faultedjobscount',
        'scheduledjobscount',
        'cancelledjobscount'
    ].reduce((accumulator, endpoint) => {
        accumulator[endpoint] = function (callback) {
            let options = {
                url: `${baseUrl}/${endpoint}`,
                method: 'GET',
                headers: utils.getRestHeaders(node)
            };
            request(options, (err, response, body) => {
                if (err) {
                    callback(err);
                } else if (response.statusCode != 200) {
                    callback(response.statusMessage);
                } else {
                    callback(null, body);
                }
            });
        };
        return accumulator;
    }, {});

    async.parallel(requests, (err, results) => {
        if (err) {
            logger.warn('Error while handling the request /appnodes/jobstats');
            return handleError(res, err);
        }
        logger.info('Request Successful /appnodes/jobstats');
        res.status(200).json(results);
    });
}

exports.getApplications = (req, res) => {
    let node = req.appnode;
    let options = {
        url: utils.getInstanceURL(node) +"/bw/app.json/state?name=*",
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode != 200) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        res.status(response.statusCode).json(body);
    });
};

exports.getStatsEnablements = (req, res) => {
    let node = req.appnode;
    let enpointUrl;
    let requests = [
        'process',
        'processinstance',
        'activityinstance',
        'transitioninstance'
    ].reduce((accumulator, endpoint) => {
        accumulator[endpoint] = function (callback) {
            let actualEndpoint;
            if (endpoint === "process") {
                enpointUrl = utils.getInstanceURL(node)+"/bw/statistics.json/instrumentationstat";
            } else if (endpoint === "processinstance") {
                enpointUrl = utils.getInstanceURL(node)+"/bwm/monitor.json/executionstat?entity=activity";
            } else if (endpoint === "activityinstance") {
                enpointUrl = utils.getInstanceURL(node)+"/bwm/monitor.json/executionstat?entity=process";
            } else if (endpoint === "transitioninstance") {
                enpointUrl = utils.getInstanceURL(node)+"/bwm/monitor.json/executionstat?entity=transition";
            }
            let options = {
                url: `${enpointUrl}`,
                method: 'GET',
                headers: utils.getRestHeaders(node)
            };
            request(options, (err, response, body) => {
                if (err) {
                    callback(err);
                } else if (response.statusCode != 200) {
                    callback(response.statusMessage);
                } else {
                    callback(null, body);
                }
            });
        };
        return accumulator;
    }, {});

    async.parallel(requests, (err, results) => {
        if (err) {
            return handleError(res, err);
        }
        res.status(200).json(results);
    });
}
exports.enableApplicationStatsOnAppNode = (req, res) => {
    updateApplicationStatsOnAppNode(req, res);
}

exports.disableApplicationStatsOnAppNode = (req, res) => {
    updateApplicationStatsOnAppNode(req, res);
}


var updateApplicationStatsOnAppNode = (req, res) => {
    let node = req.appnode;
    let statType = req.query.statType;
    let methodType = req.method;
    let endpoint;
    let baseUrl = utils.getInstanceURL(node)+`/bwm/monitor.json`;
    if (statType === "process") {
        baseUrl = utils.getInstanceURL(node)+`/bw/statistics.json`;
        endpoint = "instrumentationstat";
    } else if (statType === "activityinstance") {
        endpoint = 'executionstat?entity=activity';
    } else if (statType === "processinstance") {
        endpoint = 'executionstat?entity=process';
    } else if (statType === "transitioninstance") {
        endpoint = 'executionstat?entity=transition';
    }
    let options = {
        url: baseUrl+`/${endpoint}`,
        method: methodType,
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode != 200) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        res.status(response.statusCode); //.json(body);
    });
};