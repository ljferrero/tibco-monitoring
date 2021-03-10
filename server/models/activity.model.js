const uuidv1 = require('uuid/v1');

class ActivityObject {
    constructor() {

    }
    init(activity) {
        var arr = [];
        activity.forEach(activityObject => {
            arr.push({
                activityinstanceuid: uuidv1(),
                timestmp: new Date().getTime(),
                applicationname: activityObject.ApplicationName,
                applicationversion: activityObject.ApplicationVersion,
                modulename: activityObject.ModuleName,
                moduleversion: activityObject.ModuleVersion,
                activityname: activityObject.ActivityName,
                processname: activityObject.ProcessName,
                processinstanceid: activityObject.ProcessInstanceId,
                activitystarttime: new Date(activityObject.ActivityStartTime).getTime(),
                //   applicationname : activityObject.ActivityEndTime,
                activitydurationtime: activityObject.ActivityDurationTime,
                activityevaltime: activityObject.ActivityEvalTime,
                activitystate: activityObject.ActivityState,
                domainname: activityObject.DomainName,
                appspacename: activityObject.AppspaceName,
                appnodename: activityObject.AppnodeName,
                activityinput: JSON.stringify(activityObject.ActivityInput),
                activityoutput: JSON.stringify(activityObject.ActivityOutput),
                activityexecutionid: activityObject.ActivityExecutionId
            })
        })

        //     return [{

        //     //   this.applicationname : activityObject.ActivityExecutionId,
        //     // this.applicationname : activityObject.ActivityInput,
        //     //this.applicationname : activityObject.ActivityOutput,
        // }]

        return arr;
    }

}

module.exports = new ActivityObject();