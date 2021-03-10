/**
 * Created by bmane on 2/28/2017.
 */
import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';
export class ApplicationGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ApplicationGridLevel2Controller;
    public template: any = require('../partials/application-grid-level2.html');
}

export class ApplicationGridLevel2Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels', '$scope', '$filter',
        '$uibModal', '$rootScope'];
    public newStateView: string = 'applications.application({applicationName : value})';
    public applicationsGridHeader: any;
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public dataToBeRemoved: any;
    public filterDataLength: number = 0;
    public processStatsStatus: any;
    public processInstanceStatsStatus: any;
    public activityStatsStatus: any;
    public monitorStatsStatus: any;
    public nodeId: string;
    public applicationJobStats: any = {
        created: 0,
        running: 0,
        cancelled: 0,
        faulted: 0,
        scheduled: 0
    };
    public appInstances: any = {
        total: 0,
        running: 0,
        impaired: 0,
        appError: 0,
        startFailed: 0
    };
    public applicationVersion: String = '';
    public applicationStatus: string = 'Stopped';
    public isSwagger: boolean = false;
    public swaggerUrl: string;
    public nodeIdArray: Array<string> = [];
    public openTracingStatus: any;
    constructor(private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any, private $scope: any, private $filter: any,
        private uibModal: any,
        private $rootScope: ng.IRootScopeService) {
        this.globalVariables.viewType = $state.params.viewType;
        this.applicationsGridHeader = this.gridConfig.grid.applications.columns;
        this.$scope.$on('statsCollectionStatus', (event: any, obj: any): any => {
            if (obj.statType === 'process') {
                this.processStatsStatus = obj.state;
            } else if (obj.statType === 'processinstance') {
                this.processInstanceStatsStatus = obj.state;
            } else if (obj.statType === 'activityinstance') {
                this.activityStatsStatus = obj.state;
            } else if (obj.statType === 'opentracing') {
                this.openTracingStatus = obj.state;
            }

                this.monitorStatsStatus = this.processInstanceStatsStatus && this.activityStatsStatus;

            if (this.globalVariables.env === 'pcf' && this.globalVariables.LoadUAA) {
                if (!localStorage.getItem('token')) {
                    this.$state.go('login');

                } else {
                    this.monitorServices.checkToken(localStorage.getItem('token')).then(data => {
                        if (!data.data.status) {
this.monitorServices.changeStats(this.globalVariables.space,
    obj.name,
    obj.application_name,
    obj.statType,
    obj.version,
    obj.state,
    localStorage.getItem('token')).then(res => {
                            });
                        } else {
                            this.$state.go('login');
                        }
                    });

                }
            } else {
                this.monitorServices.changeStats(this.globalVariables.space, obj.name, obj.application_name, obj.statType, obj.version, obj.state, null)
                .then(res => {
                });
            }
        });
        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.globalVariables.LoadUAA = res.data.LoadUAA;
            if (this.globalVariables.env === 'pcf' && res.data.LoadUAA) {
                if (!localStorage.getItem('token')) {
                    $state.go('login');
                } else {
                    this.details();
                }
            } else {
                this.details();
            }
        });
    }
    public details(): any {
        this.monitorServices.getApplications(localStorage.getItem('token')).then((response: any) => {
            if (response.data.status) {
                localStorage.setItem('token', '');
                this.$state.go('login');
            } else {
                this.applicationsDataMap = response.data;
                for (let nodeId in response.data) {
                    if (response.data[nodeId]) {
                        response.data[nodeId].states.forEach((app: any) => {
                            if ( app.application_name === this.$state.params.applicationName && this.$state.params.version === app.version) {
                                this.nodeIdArray.push(response.data[nodeId]);
                                if (app.state === 'Running') {
                                    this.nodeId = response.data[nodeId].nodeId;
                                    this.appInstances.running++;
                                    if (app.endpoints !== undefined) {
                                        let swaggerEndPoints: any = this.$filter('filter')(app.endpoints, { 'type': 'SwaggerUI' }, true);
                                        if (swaggerEndPoints.length > 0) {
                                            this.isSwagger = true;
                                            this.swaggerUrl = swaggerEndPoints[0].url;
                                        }
                                    }
this.monitorServices.getApplicationJobStats(nodeId, app.name, app.version, localStorage.getItem('token')).then((response1: any) => {
                                        this.applicationJobStats.created += parseInt(response1.data.createdjobscount, 10);
                                        this.applicationJobStats.running += parseInt(response1.data.runningjobscount, 10);
                                        this.applicationJobStats.faulted += parseInt(response1.data.faultedjobscount, 10);
                                        this.applicationJobStats.scheduled += parseInt(response1.data.scheduledjobscount, 10);
                                        this.applicationJobStats.cancelled += parseInt(response1.data.cancelledjobscount, 10);
                                    });
                                    this.monitorServices.getApplicationStatsCollectionStatus(nodeId, app.name, app.version, localStorage.getItem('token'))
                                        .then((response1: any) => {
this.monitorServices.getStats(app.name, app.version, this.globalVariables.space, localStorage.getItem('token')).then(data => {
                                                this.processStatsStatus = (data.data[0] === 'true' ? true : false);
                                                this.processInstanceStatsStatus = (data.data[1] === 'true' ? true : false);
                                                this.activityStatsStatus = (data.data[2] === 'true' ? true : false);
                                                this.monitorStatsStatus = this.processInstanceStatsStatus && this.activityStatsStatus;
                                            });
                                            let opentracing: string = 'opentracing';
                                            this.openTracingStatus = (response1.data[opentracing] === 'true' ? true : false);
                                        });
                                } else if (app.state === 'Impaired') {
                                    this.appInstances.impaired++;
                                } else if (app.state === 'StartFailed') {
                                    this.appInstances.startFailed++;
                                } else if (app.state === 'AppError') {
                                    this.appInstances.appError++;
                                }
                                this.appInstances.total++;
                                this.applicationVersion = app.version;
                            }
                        });
                    }
                }
                if (this.appInstances.running > 0) {
                    this.applicationStatus = 'Running';
                } else if (this.appInstances.impaired > 0) {
                    this.applicationStatus = 'Degraded';
                } else if (this.appInstances.appError > 0) {
                    this.applicationStatus = 'App error';
                } else if (this.appInstances.startFailed > 0) {
                    this.applicationStatus = 'Start failed';
                } else {
                    this.applicationStatus = 'Stopped';
                }
            }
        });
    }
    public downloadFile(): any {

        if (this.globalVariables.env === 'pcf' && this.globalVariables.LoadUAA) {
            if (!localStorage.getItem('token')) {
                this.$state.go('login');
            } else {
                this.download();
            }
        } else {
            this.download();
        }
    }
    public download: any = function (): any {
        let nodeIdArray: Array<string> = [];
        this.nodeIdArray.forEach((data: any): any => {
            if (this.globalVariables.env === 'pcf') {
                if (this.globalVariables.space === data.space) {
                    nodeIdArray.push(data.nodeId);
                }
            } else {
                nodeIdArray.push(data.nodeId);
            }
        });
        this.monitorServices.downloadFile(nodeIdArray[0]);

    };

    public upload(): any {

        let nodeIdArray: Array<string> = [];
        this.nodeIdArray.forEach((data: any): any => {
            if (this.globalVariables.env === 'pcf') {
                if (this.globalVariables.space === data.space) {
                    nodeIdArray.push(data.nodeId);
                }
            } else {
                nodeIdArray.push(data.nodeId);
            }
        });
        var modalInstance: any = this.uibModal.open({
            component: 'uploadFileModal',
            size: 'md',
            resolve: {
                items: (): any => {
                    return nodeIdArray;
                }
            }
        });
        modalInstance.result.then((details): any => {
        }
            , (error: any) => {
                console.log(error);
            });

    }
    public upladFile: any = function (): any {
        if (this.globalVariables.env === 'pcf' && this.globalVariables.LoadUAA) {
            if (!localStorage.getItem('token')) {
                this.$state.go('login');
            } else {
                this.upload();
            }
        } else {
            this.upload();
        }
    };

    public updateApplicationStatsInit(statType: string, statValue: string): void {
        if (statType === 'processmoitor') {
            this.updateApplicationStats('activityinstance', statValue);
            this.updateApplicationStats('transitioninstance', statValue);
            this.updateApplicationStats('processinstance', statValue);
        } else {
            this.updateApplicationStats(statType, statValue);
        }
    }
    public updateApplicationStats(statType: string, statValue: string): void {
        if (this.globalVariables.env === 'pcf' && this.globalVariables.LoadUAA) {
            if (!localStorage.getItem('token')) {
                this.$state.go('login');

            } else {
                this.monitorServices.checkToken(localStorage.getItem('token')).then(data => {
                    if (!data.data.status) {
                        this.updateAppStatus(statType, statValue, localStorage.getItem('token'));
                    } else {
                        this.$state.go('login');
                    }
                });

            }
        } else {
            this.updateAppStatus(statType, statValue, null);
        }
    }

    public updateAppStatus(statType: string, statValue: string, token: any): void {
        if (this.appInstances.running !== 0) {
            if (statType === 'process') {
                this.processStatsStatus = !this.processStatsStatus;
            } else if (statType === 'processinstance') {
                this.processInstanceStatsStatus = !this.processInstanceStatsStatus;
            } else if (statType === 'activityinstance') {
                this.activityStatsStatus = !this.activityStatsStatus;
            }  else if (statType === 'opentracing') {
                this.openTracingStatus = !this.openTracingStatus;
            }
            this.monitorStatsStatus = this.processInstanceStatsStatus + this.activityStatsStatus;
            let changeStat: boolean = true;

            for (let nodeId in this.applicationsDataMap) {
                if (this.applicationsDataMap[nodeId]) {
                    this.applicationsDataMap[nodeId].states.forEach((app: any) => {
                         // compare application_name in case of app.name since state will always have application_name now
                        if (app.application_name === this.$state.params.applicationName && this.$state.params.version === app.version) {
                            if (app.state === 'Running') {
                                if (statValue === 'start') {
                                    this.monitorServices.enableApplicationStats(nodeId, app.name, app.version, statType, token, false)
                                        .then((response: any) => {
                                            if (response.data.status) {
                                                localStorage.setItem('token', '');
                                                this.$state.go('login');
                                            } else {
                                                if (changeStat) {
this.monitorServices.changeStats(this.globalVariables.space, app.name, app.application_name, statType, app.version, true, token).then(res => {
                                                    });
                                                    changeStat = false;
                                                }
                                            }
                                        });
                                } else if (statValue === 'stop') {
                                    this.monitorServices.disableApplicationStats(nodeId, app.name, app.version, statType, token, false)
                                        .then((response: any) => {
                                            if (response.data.status) {
                                                localStorage.setItem('token', '');
                                                this.$state.go('login');
                                            } else {
                                                if (changeStat) {
this.monitorServices.changeStats(this.globalVariables.space, app.name, app.application_name, statType, app.version, false, token).then(res => {
                                                    });
                                                    changeStat = false;
                                                }
                                            }
                                        });
                                }
                            }
                        }
                    });
                }
            }
            this.$state.reload();
        }
    }
}