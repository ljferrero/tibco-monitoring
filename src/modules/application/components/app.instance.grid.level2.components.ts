/**
 * Created by Srikanta Dutta on 3/06/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class AppInstanceGridLevel2Component implements ng.IComponentOptions {
    public controller: any = AppInstanceGridLevel1Controller;
    public template: any = require('../partials/app-instance-grid-level2.html');
}

export class AppInstanceGridLevel1Controller {
    public static $inject: any = ['$scope', '$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels', '$rootScope', '$uibModal'];
    public routeStateObject: any = {};
    public appInstanceGridHeader: any;
    public instanceCount: any = { process: 0, processinstance: 0, activityinstance: 0, opentracing: 0 };
    public disableInstanceCount: any = 0;
    public appInstanceDataMap: Map<string, any> = new Map<string, any>();
    public nodeIdArray: Array<string> = [];
    constructor(
        private $scope: ng.IScope,
        private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any,
        private $rootScope: ng.IRootScopeService,

        private $uibModal: any) {
        this.globalVariables.viewType = $state.params.viewType;
        this.appInstanceGridHeader = this.gridConfig.grid.appInstance.columns;
        this.$scope.$on('fileUploadDownload', (event: any, callback: any) => {
            callback(this.nodeIdArray);
        });

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
        this.monitorServices.getApplications(token).then((response: any) => {
            if (response.data.status) {
                            localStorage.setItem('token', '');
                this.$state.go('login');
            } else {
                this.instanceCount.process = 0;
                this.instanceCount.activityinstance = 0;
                this.instanceCount.processinstance = 0;
                this.instanceCount.opentracing = 0;
                this.routeStateObject.name =
'applications.application.defaultDetails.processInfo({"currentAppTab" : "processes", "containerName" : data.appnodeName, "processName": "defaultProcess"})';
                this.routeStateObject.appNode = 'appnodes.appnode({"viewType": "default", nodeName : value})';
                for (let nodeId in response.data) {
                    if (response.data[nodeId]) {
                        response.data[nodeId].states.forEach((app: any) => {
                            // make this generic. compare application_name in case of app.name
                            if (app.application_name === this.$state.params.applicationName && this.$state.params.version === app.version) {
                                let temp: any = {};
                                temp.name = app.name;
                                temp.application_name = app.application_name;
                                temp.nodeId = nodeId;
                                if (this.globalVariables.env === 'pcf' && this.globalVariables.space === response.data[nodeId].space) {
                                    this.nodeIdArray.push(nodeId);
                                } else {
                                    this.nodeIdArray.push(nodeId);
                                }
                                if (response.data[nodeId].space) {
                                    temp.space = response.data[nodeId].space;
                                } else {
                                }
                                temp.version = app.version;
                                temp.configState = app.configState;
                                temp.appnodeName = response.data[nodeId].appnodeName;
                                temp.nodeId = response.data[nodeId].nodeId;
                                temp.instanceStatsCollection = {};
                                temp.logbackFile = {};
                                temp.productVersion = response.data[nodeId].product_version;
                                this.monitorServices.getApplicationStatsCollectionStatus(nodeId, app.name, app.version, localStorage.getItem('token'))
                                    .then((response1: any) => {
                                        temp.instanceStatsCollection.process = response1.data.process.toLowerCase() === 'true' ? 'ON' : 'OFF';
                                        temp.instanceStatsCollection.processinstance = response1.data.processinstance.toLowerCase() === 'true' ? 'ON' : 'OFF';
                                        temp.instanceStatsCollection.activityinstance = response1.data.activityinstance.toLowerCase() === 'true' ? 'ON' : 'OFF';
                                        temp.instanceStatsCollection.opentracing = response1.data.opentracing.toLowerCase() === 'true' ? 'ON' : 'OFF';
                                        temp.instanceStatsCollection.processmonitor =  response1.data.processinstance.toLowerCase() === 'true' &&
                                            response1.data.activityinstance.toLowerCase() === 'true' ? 'ON' : 'OFF';
                                        if (temp.instanceStatsCollection.process === 'ON') {
                                            this.instanceCount.process++;
                                        }
                                        if (temp.instanceStatsCollection.processinstance === 'ON') {
                                            this.instanceCount.processinstance++;
                                        }
                                        if (temp.instanceStatsCollection.activityinstance === 'ON') {
                                            this.instanceCount.activityinstance++;
                                        }
                                        if (temp.instanceStatsCollection.opentracing === 'ON') {
                                            this.instanceCount.opentracing++;
                                        }
                                        this.instanceCount.processmonitor = this.instanceCount.processinstance;
                                        temp.instanceStatsCollection.toggleStatus = (function (statType: string, row: any, data: any): any {
                                            if (row.instanceStatsCollection[statType] === 'OFF') {
this.monitorServices.enableApplicationStats(row.nodeId, row.name, row.version, statType, localStorage.getItem('token') , true)
                                                    .then((response2: any) => {
                                                        if (response2.data.status) {
                                                            localStorage.setItem('token', '');
                                                            this.$state.go('login');
                                                        } else {
                                                            row.instanceStatsCollection[statType] = 'ON';
                                                            let processmonitor: string = 'processmonitor';
                                                            if (statType === 'processinstance') {
                                                                row.instanceStatsCollection[processmonitor] = 'ON';
                                                            }
                                                            this.instanceCount[statType]++;
                                                            if (this.instanceCount[statType] === this.appInstanceDataMap.size) {
this.$rootScope.$broadcast('statsCollectionStatus',
{ statType: statType, state: true, name: temp.name, version: temp.version, application_name: app.application_name });
                                                            }
                                                        }
                                                    });
                                            } else {
this.monitorServices.disableApplicationStats(row.nodeId, row.name, row.version, statType, localStorage.getItem('token'), true)
                                                    .then((response2: any) => {
                                                        if (response2.data.status) {
                                                            localStorage.setItem('token', '');
                                                            this.$state.go('login');
                                                        } else {
                                                            row.instanceStatsCollection[statType] = 'OFF';
                                                            // this.appInstanceDataMap.forEach((value, key, dataMap) => {
                                                            //     if (value.instanceStatsCollection[statType] === 'OFF') {
                                                            //         this.instanceCount[statType]--;
                                                            //     }
                                                            // });
                                                            let processmonitor: string = 'processmonitor';
                                                            if (statType === 'processinstance') {
                                                                row.instanceStatsCollection[processmonitor] = 'OFF';
                                                            }
                                                            this.instanceCount[statType]--;
                                                            let status: boolean = false;
                                                            data.forEach((tuple: any) => {
                                                                status = status || tuple.instanceStatsCollection[statType] === 'ON' ? true : false;
                                                            });
                                                        if (this.instanceCount[statType] === 0) {
this.$rootScope.$broadcast('statsCollectionStatus',
{ statType: statType, state: status, version: temp.version, name: temp.name, application_name: app.application_name });
                                                            }
                                                        }
                                                    });
                                            }
                                        }).bind(this);
                                        temp.logbackFile.upload = {
                                            title: 'Upload',
                                            uploadFile: ((nodeId: string) => {
                                                var nodeIdArray: Array<string> = [];
                                                nodeIdArray[0] = nodeId;
                                                var modalInstance: any = this.$uibModal.open({
                                                    component: 'uploadFileModal',
                                                    size: 'md',
                                                    resolve: {
                                                        items: (): any => {
                                                            return nodeIdArray;
                                                        }
                                                    }
                                                });
                                                modalInstance.result.then((details): any => {
                                                }, (error: any) => {
                                                });
                                            })
                                        };
                                        temp.logbackFile.download = {
                                            title: 'Download',
                                            downloadFile: ((nodeId: string) => {
                                                this.monitorServices.downloadFile(nodeId);
                                            })
                                        };
                                    });
                                if (app.state === 'Running') {
                                    temp.state = 'Running';
                                } else if (app.state === 'Impaired') {
                                    temp.state = 'Impaired';
                                } else if (app.state === 'AppError') {
                                    temp.state = 'App error';
                                } else if (app.state === 'StartFailed') {
                                    temp.state = 'Start failed';
                                } else if (app.state === 'Stopped') {
                                    temp.state = 'Stopped';
                                }
                                this.appInstanceDataMap.set(nodeId, temp);
                            }
                        });
                    }
                }
            }
        });
    }
}