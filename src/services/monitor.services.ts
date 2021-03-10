/**
 * Created by bmane on 2/2/2017.
 */
'use strict';

const endpoints: any = {
    appNodes: '/api/v1/appnodes',
    applications: '/api/v1/applications',
    fileOperation: 'api/v1/appnodes',
    platformDetails: '/api/v1/appnodes/platformDetails'
    // process: 'api/v1/processstats'
};

export class MonitorServices {
    public static $inject: any = ['$http'];
    constructor(private $http: ng.IHttpService) {
    }



/*    public getProcessData(): ng.IPromise<any> {
        return this.$http.get(`${endpoints.process}`);
    }*/
    public getConfigData(): ng.IPromise<any> {
        return this.$http.get(`${endpoints.applications}/getConfigData`);
    }

    public getPlatformDetails(token: any): ng.IPromise<any> {
        return this.$http.get(endpoints.platformDetails);
    }
    public downloadFile(nodeId: string): any {
        window.location.href = `${window.location.origin}/api/v1/appnodes/${nodeId}/logBack`;
    }

    public uploadFile(file: any, nodeIdArray: any): ng.IPromise<any> {
        return this.$http.put(`${endpoints.fileOperation}/logBackUpload`, { params: { key: file, nodeIdArray: nodeIdArray } });
    }
    public getAppnodes(): ng.IPromise<any> {
        return this.$http.get(endpoints.appNodes);
    }
    public changeStats(space: any, name: string, application_name: string, statType: string, version: string, flag: any, token: any): ng.IPromise<any> {
        if (space === '') {
            space = null;
        }
        return this.$http.put(`${endpoints.applications}/changeStats`,
            { params: { space: space, name: name, application_name: application_name, statType: statType, version: version, flag: flag } },
            { headers: { token: token } });
    }

    public addAppNode(params: any): ng.IPromise<any> {
        return this.$http.post(endpoints.appNodes, params);
    }

    public deleteAppNode(nodeId: string): ng.IPromise<any> {
        return this.$http.delete(`${endpoints.appNodes}/${nodeId}`);
    }

    public getAppNode(nodeId: string): ng.IPromise<any> {
        return this.$http.get(`${endpoints.appNodes}/${nodeId}`);
    }
    public getUserName(token: any): ng.IPromise<any> {
        return this.$http.get(`${endpoints.applications}/getName`, { headers: { token: token } });
    }
    public checkToken(token: any): ng.IPromise<any> {
        return this.$http.get(`${endpoints.applications}/checkToken`, { headers: { token: token } });
    }

    public getAppNodeRuntimeInfo(nodeId: string): ng.IPromise<any> {
        return this.$http.get(`${endpoints.appNodes}/${nodeId}/info`);
    }

    public getAppNodeRuntimeState(nodeId: string): ng.IPromise<any> {
        return this.$http.get(`${endpoints.appNodes}/${nodeId}/state`);
    }

    public getApplications(token: any): ng.IPromise<any> {
        return this.$http.get(endpoints.applications, { headers: { token: token } });
    }

    public getApplicationJobStats(nodeId: string, applicationName: string, applicationVersion: string, token: any): ng.IPromise<any> {
return this.$http.get(`${endpoints.appNodes}/${nodeId}/jobstats?appName=${applicationName}&appVersion=${applicationVersion}`, { headers: { token: token } });
    }


    public getApplicationById(nodeId: string): ng.IPromise<any> {
        return this.$http.get(`${endpoints.applications}/${nodeId}`);
    }

    public getApplicationStatsCollectionStatus(nodeId: string, applicationName: string, applicationVersion: string, token: any): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/statsenablements?appName=${applicationName}&appVersion=${applicationVersion}`, { headers: { token: token } });
    }
    public getStats(name: string, version: any, space: any, token: any): ng.IPromise<any> {
        if (space === '') {
            space = null;
        }
        return this.$http.put(`${endpoints.applications}/getStats`, { params: { name: name, space: space, version: version } }, { headers: { token: token } });
    }
    public getProcessDiagram(nodeId: string, applicationName: string, applicationVersion: string, token: any): ng.IPromise<any> {
        return this.$http({
            method: 'GET',
            url: `${endpoints.applications}/${nodeId}/processdiagram?appName=${applicationName}&appVersion=${applicationVersion}`,
            headers: {
                compression: true,
                token: token
            }
        });
    }
    public enableApplicationStats(nodeId: string, applicationName: string,
        applicationVersion: string, statType: string, token: any, flagHeader: any): ng.IPromise<any> {
        return this.$http.post(
            `${endpoints.applications}/${nodeId}/statsenablements?appName=${applicationName}
&appVersion=${applicationVersion}&statType=${statType}`, {}, { headers: { token: token, flagHeader: flagHeader } });
    }
    public disableApplicationStats(nodeId: string, applicationName: string,
        applicationVersion: string, statType: string, token: any, flagHeader: any): ng.IPromise<any> {
        return this.$http.delete(
            `${endpoints.applications}/${nodeId}/statsenablements?appName=${applicationName}
&appVersion=${applicationVersion}&statType=${statType}`, { headers: { token: token, flagHeader: flagHeader } });
    }
    public getProcessInfo(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string, token: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/processstat?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}`,  { headers: { token: token } });

    }
    public getActivityInfo(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string, token: any): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/activitystat?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}`, { headers: { token: token } });

    }
    public getConfigInfo(nodeId: string,
        applicationName: string,
        applicationVersion: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/config?appName=${applicationName}
&appVersion=${applicationVersion}`, {});

    }
    public getProcessInstance(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string,
        offset: number, limit: number, status: string, sortBy: string, sortOrder: string,
        startDateMills: Number, endDateMills: Number,
        searchtext: string): ng.IPromise<any> {
        let sortString: string = '';
        let dateString: string = '';
        let searchSt: string = (searchtext && searchtext.length && searchtext.trim().length > 0) ? `&searchText=${searchtext.trim()}` : '';
        if (sortBy && sortBy.length > 0) {
            sortString = `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        }
        if (startDateMills && startDateMills > 0 && endDateMills && endDateMills > 0) {
            dateString = `&startDate=${startDateMills}&endDate=${endDateMills}`;
        }

        return this.$http.get(
            `${endpoints.applications}/${nodeId}/processinstancestats?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}&offset=${offset}&limit=${limit}&status=${status}${sortString}${dateString}${searchSt}`, {});

    }
    public getProcessInstanceCount(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string,
        status: string, startDateMills: Number, endDateMills: Number, searchtext: string): ng.IPromise<any> {
        let dateString: string = '';
        let searchSt: string = (searchtext && searchtext.length && searchtext.trim().length > 0) ? `&searchText=${searchtext.trim()}` : '';
        if (startDateMills && startDateMills > 0 && endDateMills && endDateMills > 0) {
            dateString = `&startDate=${startDateMills}&endDate=${endDateMills}`;
        }
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/processinstancecount?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}&status=${status}${dateString}${searchSt}`, {});

    }

    public processinstancecountByStatus(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/processinstancecountByStatus?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}`, {});

    }

    public getAllProcessInstance(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/allprocessinstancestats?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}`, {});

    }
    public getActivityInstance(nodeId: string,
        applicationName: string,
        applicationVersion: string,
        processName: string, processinstancejobid: string, processstarttime: string, processendtime: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/activityinstancestats?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}&processinstancejobid=${processinstancejobid}
&processstarttime=${processstarttime}&processendtime=${processendtime}`, {});

    }
    public getSubProcesses(nodeId: string,
                               applicationName: string,
                               applicationVersion: string,
                               processName: string, processinstancejobid: string, processstarttime: string, processendtime: string): ng.IPromise<any> {
        return this.$http.get(
            `${endpoints.applications}/${nodeId}/subprocessinstances?appName=${applicationName}
&appVersion=${applicationVersion}&processName=${processName}&processinstancejobid=${processinstancejobid}
&processstarttime=${processstarttime}&processendtime=${processendtime}`, {});

    }
}

