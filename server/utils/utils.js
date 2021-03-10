'use strict';
var logger = require('../logger/logger');
const REST_HEADER = {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'bw6mon'
};
const fileHeaders = {
    'Content-Type': 'application/octet-stream'
};

exports.isPCF = () => {
    return process.env.VCAP_SERVICES? true : false;
}
exports.getInstanceURL = (appnode)=> {
    if (this.isPCF()) {
        if(appnode.routingURL){
            return "https://" + appnode.routingURL;
        }
        else {
            logger.warn("Routing url is not configured for application.Using host ip and port for communication");
            return "http://" + appnode.host + ':' + appnode.port;
        }
    } else {
        return "http://" + appnode.host + ':' + appnode.port;
    }
}

exports.getRestHeaders = (appnode) => {
    if (this.isPCF()) {
        return {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'bw6mon',
            'X-CF-APP-INSTANCE': appnode.applicationGUID + ':' + (appnode.instanceName? appnode.instanceName: appnode.name)
        };

    } else {
        return REST_HEADER;
    }
}
exports.getFileHeaders = (appnode) => {
    if (this.isPCF()) {
        return {
            'Content-Type': 'application/octet-stream',
            'X-CF-APP-INSTANCE': appnode.applicationGUID +':'+ (appnode.instanceName? appnode.instanceName: appnode.name)
        };

    } else {
        return fileHeaders;
    }
}
