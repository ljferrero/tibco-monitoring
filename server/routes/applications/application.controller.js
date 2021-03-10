'use strict';
const request = require('request');
const async = require('async');
const _ = require('lodash');
var db = require('../../datastore/init.datastore.js').nodedb;
var statdb = require('../../datastore/init.datastore.js').statdb;
var logger = require('../../logger/logger');
var operations = require('../../db/db.opts.js');
var client = require('../../db/init.db.js');
var utils = require('../../utils/utils.js');
var convert = require('xml-js');

const persistenceType = process.env.persistenceType;




exports.changeStats = (req, res) => {
    var name = req.body.params.name;
    var application_name = req.body.params.application_name;
    var statType = req.body.params.statType;
    var flag = req.body.params.flag;
    var space = req.body.params.space;
    var version = req.body.params.version;

    operations.changeStats(space, name, application_name, statType, version, flag, res, () => {
        res.status(200).json({});
    });
}
exports.deleteBeforeInsert = (details, callback) => {
    let requests = prepareRequests(details, 'bw/app.json/state?name=' + '*');
    async.parallel(requests, (err, results) => {
        for (let result in results) {
            if (results[result].delete === true) {
                delete results[result];
            }
        }


        callback(null, results);
    });
};


exports.getConfigData = (req, res) => {
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

    res.status(200).json({ client_id: client_id, redirect_uri: `https://${redirect_uri}/loginCheck`, url: cfUrl });

}
exports.index = (req, res) => {
    operations.getDetails((details) => {
    if(details.stack) {
		logger.error(details)
        res.status(500).json(details);
    } else {
            getApplicationStates(details, '*', (err, results) => {
                if (err) {
                    logger.warn('Error while handling the request ');
                    return handleError(res, err);
                }
                logger.info('Request Successful');
            res.status(200).json(results);
        });
    }
    });
};
// need to midify condition once configuration for all data store is done
exports.getProcessDiagram = (req, res) => {
    if (persistenceType === 'jfs') {
        let node = req.appnode;
        let appName = req.query.appName;
        let appVersion = req.query.appVersion;
        let options = {
            url: utils.getInstanceURL(node) + `/bw/app.json/process?name=${appName}&version=${appVersion}`,
            method: 'GET',
            json: true,
            headers: utils.getRestHeaders(node)
        };
        request(options, (err, response, body) => {
            if (err) {
                return handleError(res, err);
            }
            if (response.statusCode === 503) {
                let body = {};
                body.processess = [];
                return res.status(200).json(body);
            } else if (response.statusCode >= 400) {
                return res.status(response.statusCode).send(response.statusMessage);
            }
            body.forEach(value => {
                // it is not required in client so setting source as null in response as it is hampering performance while downloading content.
                value['source'] = null;
            });
            res.status(response.statusCode).json(body);
        });
    } else {
        operations.getProcesses(req, res, function (res1, processes) {
            res1.status(res.statusCode).json(processes);
        });
    }
}

exports.loadAppNodeById = (req, res, next, id) => {
    operations.loadAppNodeById(req, res, next, id);
};

exports.show = (req, res) => {
    let node = req.appnode;
    let options = {
        url: utils.getInstanceURL(node) + "/bw/app.json/state?name=*",
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            logger.warn('Error while handling the request ');
            return handleError(res, err);
        }
        if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        logger.info('Request Successful');
        res.status(response.statusCode).json(body);
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
}

function getApplicationStates(nodes, appId, callback) {
    let requests = prepareRequests(nodes, 'bw/app.json/state?name=' + appId);
    async.parallel(requests, (err, results) => {
        for (let result in results) {
            if (result && results[result].delete === true) {
                delete results[result];
            }
        }


        callback(null, results);
    });
};

function prepareRequests(nodes, endpoint) {
    return Object.keys(nodes).reduce((accumulator, nodeId) => {
        accumulator[nodeId] = function (callback) {
            let node = nodes[nodeId],
                host = node.host,
                port = node.port;
            let options = {
                url: utils.getInstanceURL(nodes[nodeId]) + `/${endpoint}`,
                method: 'GET',
                headers: utils.getRestHeaders(nodes[nodeId])
            };
            request(options, (err, response, body) => {
                if (typeof response === 'undefined') {

                    operations.delete(nodeId, node, callback);

                } else if (err) {
                    if (err.code === 'ECONNREFUSED') {
                        operations.delete(nodeId, node, callback);

                    }
                } else if (response.statusCode != 200) {
                    operations.delete(nodeId, node, callback);
                    /*                    if(response.statusCode === 404){
                                            operations.delete(nodeId, node, callback);
                                        } else {
                                            callback(response.statusMessage);
                                        }*/
                } else {
                    body = JSON.parse(body);
                    body.appnodeName = node.name;
                    body.host = node.host;
                    body.port = node.port;
                    if(node.product_version) {
                        var versionsToken = node.product_version.split(" ");
                        body.product_version = versionsToken[0];
                    }
                    else
                        body.product_version = "";
                    if (node.space) {
                        body.space = node.space;
                        body.states[0].space = node.space;
                        body.applicationGUID = node.applicationGUID;
                        body.routingURL = node.routingURL;
                    } else {

                    }
                    body.states[0].application_name = (process.env.DISPLAY_ALIAS==='true' && node.application_name) ? node.application_name : body.states[0].name;
                    body.nodeId = nodeId;
                    callback(null, body);
                }
            });
        };

        return accumulator;
    }, {});
}
exports.getStats = (req, res) => {
    operations.getStats(req.body.params.name, req.body.params.version, req.body.params.space, (data) => {
        if (data.stack) {
		    logger.error(data);
            res.status(500).send(data);
        } else {
            var arr = [];
            var stats = data.split('-');
            arr.push(stats[0]);
            arr.push(stats[1]);
            arr.push(stats[2]);

            res.status(200).send(arr);
        }

    });
}
exports.getApplicationStatsEnablements = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let endpointUrl;
    let requests = [
        'process',
        'processinstance',
        'activityinstance',
        'transitioninstance',
            'opentracing'
    ].reduce((accumulator, endpoint) => {
        accumulator[endpoint] = function (callback) {
            let actualEndpoint;
            if (endpoint === "process") {
                endpointUrl = utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}/instrumentationstat`;
            } else if (endpoint === "processinstance") {
                endpointUrl = utils.getInstanceURL(node) + `/bwm/monitor.json/${appName}/${appVersion}/executionstat?entity=process`;
            } else if (endpoint === "activityinstance") {
                endpointUrl = utils.getInstanceURL(node) + `/bwm/monitor.json/${appName}/${appVersion}/executionstat?entity=activity`;
            } else if (endpoint === "transitioninstance") {
                endpointUrl = utils.getInstanceURL(node) + `/bwm/monitor.json/${appName}/${appVersion}/executionstat?entity=transition`;
            } else if (endpoint === "opentracing") {
                endpointUrl = utils.getInstanceURL(node) + `/bwm/monitor.json/isopentracingenabled`;
            }

            let options = {
                url: `${endpointUrl}`,
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
            logger.warn('Error while handling the request /applications/statsenablements');
            return handleError(res, err);
        }
        logger.info('Request Successful /applications/statsenablements');

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
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let methodType = req.method;
    let endpoint;
    let baseUrl = utils.getInstanceURL(node) + `/bwm/monitor.json/${appName}/${appVersion}`;
    if (statType === "process") {
        baseUrl = utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}`;
        endpoint = 'instrumentationstat';
    } else if (statType === "activityinstance") {
        endpoint = 'executionstat?entity=activity';
    } else if (statType === "processinstance") {
        endpoint = 'executionstat?entity=process';
    } else if (statType === "transitioninstance") {
        endpoint = 'executionstat?entity=transition';
    } else if (statType === "opentracing") {
        baseUrl = utils.getInstanceURL(node) + `/bwm/monitor.json`;
        if(methodType === "POST")
            endpoint = 'enableopentracing';
        else  if (methodType === "DELETE")
            endpoint = 'disableopentracing';
    }
    let options = {
        url: `${baseUrl}/${endpoint}`,
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
exports.processCount = (req, res) => {
    operations.processCount(req, res);

}
exports.processCountByStatus = (req, res) => {
    operations.processCountByStatus(req, res);

}
exports.getProcessStat = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let options = {
        url: utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}/processstat` + (!!processName ? `?processName=${processName}` : ''),
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            logger.warn('Error while handling the request /applications/processstat');
            return handleError(res, err);
        };
        if (response.statusCode === 503) {
            let body = {};
            body.processInfoList = [];
            return res.status(200).json(body);
        } else if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        logger.info('Request Successful /applications/processstat');
        res.status(response.statusCode).json(body);
    });
};

exports.getActivityStat = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let processName = req.query.processName;
    let url1;
    if (processName) {
        url1 = utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}/activitystat?processName=${processName}`;
    }
    else {
        url1 = utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}/activitystat`;
    }
    let options = {
        url: url1,
        method: 'GET',
        json: true,
        headers: utils.getRestHeaders(node)
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode === 503) {
            let body = {};
            body.activityInfoList = [];
            return res.status(200).json(body);
        } else if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        res.status(response.statusCode).json(body);
    });
};
exports.getConfig = (req, res) => {
    let node = req.appnode;
    let appName = req.query.appName;
    let appVersion = req.query.appVersion;
    let CONFIG_REST_HEADER = utils.getRestHeaders(node);
    CONFIG_REST_HEADER.login = 'admin';
    let options = {
        url: utils.getInstanceURL(node) + `/bw/app.json/${appName}/${appVersion}/config`,
        method: 'GET',
        json: true,
        headers: CONFIG_REST_HEADER
    };
    request(options, (err, response, body) => {
        if (err) {
            return handleError(res, err);
        }
        if (response.statusCode === 503) {
            let body = {};
            body.activityInfoList = [];
            return res.status(200).json(body);
        } else if (response.statusCode >= 400) {
            return res.status(response.statusCode).send(response.statusMessage);
        }
        let headers1 = {
            'Accept': 'application/octet-stream',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'bw6mon',
            'login': 'admin'
        };
        if (utils.isPCF()) {
            headers1['X-CF-APP-INSTANCE'] = node.applicationGUID + ':' + (node.instanceName? node.instanceName: node.name);
        }
        let options1 = {
            url: utils.getInstanceURL(node) + `/bw/app.json/profile`,
            method: 'GET',
            headers: headers1
        };
        request(options1, (err1, response1, body1) => {
            try{
                if(err1) {
                    throw new Error('Error gathering profile');
                } else if (response1.statusCode === 503) {
                    throw new Error('Error gathering profile');
                } else if (response1.statusCode >= 400) {
                    throw new Error('Error gathering profile');
                }
                var result = JSON.parse(convert.xml2json(body1, {compact: true}));
                result = result.repository.globalVariables.globalVariable;
                result.forEach(function(item) {
                    if(item.type['_text'] === 'Password') {
                        body[item.name['_text']] = '************';
                    }
                });
            } catch(error) {
                logger.error('Failed to retrieve Profile');
            } finally {
                res.status(response.statusCode).json(body);
            }
        });
    });
};

exports.getProcessInstanceStats = (req, res) => {
    if (persistenceType === 'jfs') {
        res.status(200).json([]);
    } else {
        operations.getProcessInstanceStats(req, res);
    }
}

exports.getName = (req, res) => {
    res.status(200).json({});

}


exports.checkToken = (req, res) => {
    res.status(200).json({ status: false });
}
exports.getAllProcessInstanceStats = (req, res) => {
    if (persistenceType === 'jfs') {
        res.status(200).json([]);
    } else {
        operations.getAllProcessInstanceStats(req, res);
    }
}

exports.getActivityInstanceStats = (req, res) => {
    if (persistenceType === 'jfs') {
        res.status(200).json([]);
    } else {
        operations.getActivityInstanceStats(req, res);
    }
}

exports.getSubprocessInstances = (req, res) => {
    operations.getSubprocessInstances(req, res);
}
