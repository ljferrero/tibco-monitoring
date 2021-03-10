

/**
 * Created by bmane on 2/2/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ApplicationGridLevel1Component implements ng.IComponentOptions {
    public controller: any = ApplicationGridLevel1Controller;
    public template: any = require('../partials/application-grid-level1.html');
}

export class ApplicationGridLevel1Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public routeStateObject: any = {};
    public applicationsGridHeader: any;
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public dataToBeRemoved: any;
    public filterDataLength: number = 0;
    public isFlag: boolean = false;
    public finalcount: any;
    public env: any;
    constructor(
        private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any,
        private monLabels: any) {
        this.globalVariables.viewType = $state.params.viewType;
        this.applicationsGridHeader = this.gridConfig.grid.applications.columns;
        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.globalVariables.LoadUAA = res.data.LoadUAA;
            if (this.globalVariables.env === 'pcf' && res.data.LoadUAA) {
                if (!localStorage.getItem('token')) {
                    $state.go('login');
                } else {
                    this.details(localStorage.getItem('token'));
                }
            } else {
                this.details(null);
            }
        });
    }

    public details(token: any): any {
        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.env = res.data.env;
            this.monitorServices.getApplications(token).then((response: any) => {
                if (response.data.status) {
                    localStorage.setItem('token', '');
                    this.$state.go('login');
                } else {
                    this.routeStateObject.name =
                        'applications.application.defaultDetails' +
                        '({"applicationName" : data.application_name, "version": data.version, "currentAppTab" : "appInstances"})';
                    this.routeStateObject.appNodes =
                        'applications.application.defaultDetails({"applicationName" : data.name, "version": data.version, "currentAppTab" : "appNodes"})';
                    let tempArray: any = [];
                    for (let nodeId in response.data) {
                        if (response.data[nodeId].space) {
                            if (this.globalVariables.spaces.indexOf(response.data[nodeId].space) >= 0) {

                            } else {
                                this.globalVariables.spaces.push(response.data[nodeId].space);
                            }
                            if (this.globalVariables.spaces.length !== 0) {
                                this.globalVariables.space = this.globalVariables.spaces[0];
                            }
                        } else {

                        }
                        if (response.data[nodeId]) {
                            response.data[nodeId].states.forEach((app: any) => {
                                if (tempArray.length === 0) {
                                    let temp: any = {};
                                    temp.name = app.name;
                                    temp.version = app.version;
                                    temp.nodeId = nodeId;
                                    temp.appnodesCount = 1;
                                    // todo sm may need to remove this since its only for pcf. Or keep it in case of generic implementation.
                                    temp.application_name = app.application_name;
                                    if (response.data[nodeId].space) {
                                        temp.space = response.data[nodeId].space;
                                    } else {

                                    }
                                    temp.state = this.setStatus(app.state);
                                    tempArray.push(temp);
                                } else {
                                    if (this.env === 'pcf') {
                                        let isAppFound: boolean = false;
                                        for (let j in tempArray) {
                                            if (tempArray[j].space === app.space
                                                && tempArray[j].application_name === app.application_name
                                                && tempArray[j].version === app.version) {
                                                tempArray[j].appnodesCount++;
                                                if (tempArray[j].state === 'Running' || app.state === 'Running') {
                                                    tempArray[j].state = 'Running';
                                                } else {
                                                    if (tempArray[j].state === 'Impaired' || app.state === 'Impaired') {
                                                        tempArray[j].state = 'Degraded';
                                                    } else {
                                                        if (tempArray[j].state === 'App error' || app.state === 'AppError') {
                                                            tempArray[j].state = 'App error';
                                                        } else {
                                                            if (tempArray[j].state === 'Start failed' || app.state === 'StartFailed') {
                                                                tempArray[j].state = 'Start failed';
                                                            } else {
                                                                tempArray[j].state = 'Stopped';
                                                            }
                                                        }
                                                    }
                                                }
                                                isAppFound = true;
                                                break;
                                            }
                                        }
                                        if (!isAppFound) {
                                            let temp: any = {};
                                            temp.name = app.name;
                                            temp.version = app.version;
                                            temp.nodeId = nodeId;
                                            temp.space = response.data[nodeId].space;
                                            temp.appnodesCount = 1;
                                            temp.application_name = app.application_name;
                                            temp.state = this.setStatus(app.state);
                                            tempArray.push(temp);
                                        }
                                    } else {
                                        let isAppFound: boolean = false;
                                        for (let j in tempArray) {
                                            // todo sm check---- changed for application_name change
                                            if (tempArray[j].application_name === app.application_name && tempArray[j].version === app.version) {
                                                tempArray[j].appnodesCount++;
                                                if (tempArray[j].state === 'Running' || app.state === 'Running') {
                                                    tempArray[j].state = 'Running';
                                                } else {
                                                    if (tempArray[j].state === 'Impaired' || app.state === 'Impaired') {
                                                        tempArray[j].state = 'Degraded';
                                                    } else {
                                                        if (tempArray[j].state === 'App error' || app.state === 'AppError') {
                                                            tempArray[j].state = 'App error';
                                                        } else {
                                                            if (tempArray[j].state === 'Start failed' || app.state === 'StartFailed') {
                                                                tempArray[j].state = 'Start failed';
                                                            } else {
                                                                tempArray[j].state = 'Stopped';
                                                            }
                                                        }
                                                    }
                                                }
                                                isAppFound = true;
                                                break;
                                            }
                                        }
                                        if (!isAppFound) {
                                            let temp: any = {};
                                            temp.name = app.name;
                                            temp.version = app.version;
                                            temp.nodeId = nodeId;
                                            temp.appnodesCount = 1;
                                            temp.application_name = app.application_name;
                                            temp.state = this.setStatus(app.state);
                                            tempArray.push(temp);
                                        }
                                    }

                                }
                            });
                        }
                    }
                    for (let obj in tempArray) {
                        this.applicationsDataMap.set(obj, tempArray[obj]);
                    }
                    this.filterDataLength = this.applicationsDataMap.size;
                }
            });
        });
    }
    public setStatus(state: string): any {
        if (state === 'Running') {
            return 'Running';
        } else if (state === 'Impaired') {
            return 'Degraded';
        } else if (state === 'AppError') {
            return 'App error';
        } else if (state === 'StartFailed') {
            return 'Start failed';
        } else if (state === 'Stopped') {
            return 'Stopped';
        }
    }
}