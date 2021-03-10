/**
 * Created by bmane on 2/28/2017.
 */
import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ApplicationConfigGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ApplicationConfigGridLevel2Controller;
    public template: any = require('../partials/application-config-grid-level2.html');
}

export class ApplicationConfigGridLevel2Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels', '$scope'];
    public newStateView: string = 'applications.application({applicationName : value})';
    public applicationsGridHeader: any;
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public dataToBeRemoved: any;
    public filterDataLength: number = 0;
    public processStatsStatus: boolean = false;
    public processInstanceStatsStatus: boolean;
    public activityStatsStatus: boolean;
    public monitorStatsStatus: boolean;
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
    constructor(private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any, private $scope: any) {
        this.globalVariables.viewType = $state.params.viewType;
        this.applicationsGridHeader = this.gridConfig.grid.applications.columns;
        this.$state = $state;

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
                            // changed app.name to apllication_name. Alias change pcf
                            if (app.application_name === this.$state.params.applicationName && this.$state.params.version === app.version) {
                                if (app.state === 'Running') {
                                    this.appInstances.running++;
                                    this.monitorServices.getApplicationJobStats(nodeId, app.name, app.version).then((response1: any) => {
                                        this.applicationJobStats.created += parseInt(response1.data.createdjobscount, 10);
                                        this.applicationJobStats.running += parseInt(response1.data.runningjobscount, 10);
                                        this.applicationJobStats.faulted += parseInt(response1.data.faultedjobscount, 10);
                                        this.applicationJobStats.scheduled += parseInt(response1.data.scheduledjobscount, 10);
                                        this.applicationJobStats.cancelled += parseInt(response1.data.cancelledjobscount, 10);
                                    });
                                    this.monitorServices.getApplicationStatsCollectionStatus(nodeId, app.name, app.version)
                                        .then((response1: any) => {
                                            this.processStatsStatus = this.processStatsStatus || (response1.data.process.toLowerCase() === 'true');
                                            this.processInstanceStatsStatus = (response1.data.processinstance.toLowerCase() === 'true');
                                            this.activityStatsStatus = (response1.data.activityinstance.toLowerCase() === 'true');
                                            this.monitorStatsStatus = this.processInstanceStatsStatus && this.activityStatsStatus;
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
    public updateApplicationStatsInit(statType: string, statValue: string): void {
        if (statType === 'processmonitor') {
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
                        this.updateAppStatus(statType, statValue , localStorage.getItem('token'));
                    } else {
                        this.$state.go('login');
                    }
                });

            }
        } else {
            this.updateAppStatus(statType, statValue, null);
        }
    }
    public updateAppStatus(statType: string, statValue: string , token: any): any {
        if (this.appInstances.running !== 0) {
            if (statType === 'process') {
                this.processStatsStatus = !this.processStatsStatus;
            } else if (statType === 'processinstance') {
                this.processInstanceStatsStatus = !this.processInstanceStatsStatus;
            } else if (statType === 'activityinstance') {
                this.activityStatsStatus = !this.activityStatsStatus;
            }
            this.monitorStatsStatus = this.processInstanceStatsStatus && this.activityStatsStatus;
            let changeStat: boolean = true;
            for (let nodeId in this.applicationsDataMap) {
                if (this.applicationsDataMap[nodeId]) {
                    this.applicationsDataMap[nodeId].states.forEach((app: any) => {
                        // compare application_name in case of app.name
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