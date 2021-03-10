
const uuidv1 = require('uuid/v1');

class ProcessObject {
    constructor() {
    }
    init(process) {

        var arr = [];
        process.forEach(processObject => {
            arr.push({
                processinstanceuid: uuidv1(),
                timestmp: new Date().getTime(),
                applicationname: processObject.ApplicationName,
                applicationversion: processObject.ApplicationVersion,
                modulename: processObject.ModuleName,
                processinstancejobid: '',
                //this.jobID : processObject.jobId
                moduleversion: processObject.ModuleVersion,
                componentprocessname: processObject.ComponentProcessName,
                parentprocessname: processObject.ParentProcessName,
                parentprocessinstanceid: processObject.ParentProcessInstanceId,
                processname: processObject.ProcessName,
                processinstanceid: processObject.ProcessInstanceId,
                processinstancestarttime: new Date(processObject.ProcessInstanceStartTime).getTime(),
                processinstanceendtime: new Date(processObject.ProcessInstanceEndTime).getTime(),
                processinstancedurationtime: processObject.ProcessInstanceDurationTime,
                processinstanceevaltime: processObject.ProcessInstanceEvalTime,
                processinstancestate: processObject.ProcessInstanceState,
                domainname: processObject.DomainName,
                appspacename: processObject.AppspaceName,
                appnodename: processObject.AppnodeName,
                activityexecutionid: processObject.ActivityExecutionId
            })
        })

        return arr;
        // this.ActivityExecutionId : processObject.ActivityExecutionId;
    }
}

module.exports = new ProcessObject();