
const uuidv1 = require('uuid/v1');

class TransitionObject {
    constructor() {
    }
    init(transition) {

        var arr = [];
        transition.forEach(transitionObject => {
            arr.push({
                transitioninstanceuid: uuidv1(),
                timestmp: new Date().getTime(),
                applicationname: transitionObject.ApplicationName,
                applicationversion: transitionObject.ApplicationVersion,
                modulename: transitionObject.ModuleName,
                moduleversion: transitionObject.ModuleVersion,
                processname:transitionObject.ProcessName,
                componentprocessname: transitionObject.ComponentProcessName,
                componentprocessname: transitionObject.ComponentProcessName,
                processinstanceid: transitionObject.ProcessInstanceId,
                transitionname: transitionObject.TransitionName,
                domainname: transitionObject.DomainName,
                appspacename: transitionObject.AppspaceName,
                appnodename: transitionObject.AppnodeName,
            })
        })
        return arr;
    }
}

module.exports = new TransitionObject();