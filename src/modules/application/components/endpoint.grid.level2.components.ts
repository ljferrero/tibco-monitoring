/**
 * Created by Srikanta Dutta on 3/16/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class EndPointGridLevel2Component implements ng.IComponentOptions {
    public controller: any = EndPointGridLevel1Controller;
    public template: any = require('../partials/end-point-grid-level2.html');
}

export class EndPointGridLevel1Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public routeStateObject: any = {};
    public endPointGridHeader: any;
    public containers: Array<any> = [];
    public selectedContainer: any = {};
    public restEndPoints: Map<string, any> = new Map<string, any>();
    public httpEndPoints: Map<string, any> = new Map<string, any>();
    public soapHttpEndPoints: Map<string, any> = new Map<string, any>();
    public soapJmsEndPoints: Map<string, any> = new Map<string, any>();
    public selectedEndPointType: string;
    public endPointsType: Array<string> = [];
    public responseData: any;
    public mapId: any = 0;
    public endPointDataMap: Map<string, any> = new Map<string, any>();
    constructor(private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any) {
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
    public details(token: any): void {
        this.globalVariables.viewType = this.$state.params.viewType;
        this.globalVariables.appLevel2CurrentTab = this.$state.params.currentAppTab;
        this.endPointGridHeader = this.gridConfig.grid.endPoints.rest.columns;
        this.monitorServices.getApplications(token).then((response: any) => {
            if (response.data.status) {
                localStorage.setItem('token', '');
                this.$state.go('login');
            } else {
                this.responseData = response.data;
                for (let nodeId in response.data) {
                    if (response.data[nodeId]) {
                        response.data[nodeId].states.forEach((app: any) => {
                            // compare application_name in case of app.name since state will always have application_name now
                            if (app.endpoints && this.$state.params.applicationName === app.application_name && this.$state.params.version === app.version) {
                                this.containers.push({
                                    nodeId: nodeId, name: response.data[nodeId].appnodeName,
                                    host: response.data[nodeId].host,
                                    port: response.data[nodeId].port
                                });
                                if (this.containers.length === 1) {
                                    this.selectedContainer = response.data[nodeId].appnodeName;
                                    app.endpoints.forEach((endpoint: any) => {
                                        this.prepareEndPoints(endpoint, response.data[nodeId].space);
                                    });
                                }
                                this.showEndPoints();
                            }
                        });
                    }
                }
            }
        });
    }
    public showEndPoints(): void {
        this.selectedEndPointType = this.selectedEndPointType || this.endPointGridHeader && this.endPointsType[0];
        if (this.selectedEndPointType === 'REST') {
            this.endPointGridHeader = this.gridConfig.grid.endPoints.rest.columns;
            this.endPointDataMap = this.restEndPoints;
        } else if (this.selectedEndPointType === 'HTTP') {
            this.endPointGridHeader = this.gridConfig.grid.endPoints.http.columns;
            this.endPointDataMap = this.httpEndPoints;
        } else if (this.selectedEndPointType === 'SOAP/HTTP') {
            this.endPointGridHeader = this.gridConfig.grid.endPoints.soap.http.columns;
            this.endPointDataMap = this.soapHttpEndPoints;
        } else if (this.selectedEndPointType === 'SOAP/JMS') {
            this.endPointGridHeader = this.gridConfig.grid.endPoints.soap.jms.columns;
            this.endPointDataMap = this.soapJmsEndPoints;
        }
    }
    public prepareEndPoints(endpoint: any, space: any): void {
        if (endpoint.type === 'REST') {
            if (this.endPointsType.indexOf('REST') === -1) {
                this.endPointsType.push('REST');
            }
            let temp: any = {};
            temp.url = endpoint.url;
            if (space) {
                temp.space = space;
            } else {
            }
            temp.HTTPMethods = endpoint.properties.HTTPMethods;
            temp.ClientFormat = endpoint.properties.ClientFormat;
            temp.component = endpoint.name && endpoint.name.split('/')[0];
            temp.service = endpoint.name && endpoint.name.split('/')[1];
            this.restEndPoints.set(this.mapId, temp);
            this.mapId++;
        }
        if (endpoint.type === 'HTTP') {
            if (this.endPointsType.indexOf('HTTP') === -1) {
                this.endPointsType.push('HTTP');
            }
            let temp: any = {};
            if (space) {
                temp.space = space;
            } else {
            }
            temp.url = endpoint.url;

            temp.component = endpoint.name && endpoint.name.split('/')[0];
            temp.service = endpoint.name && endpoint.name.split('/')[1];
            this.httpEndPoints.set(this.mapId, temp);
            this.mapId++;
        }
        if (endpoint.type === 'SOAP') {
            var prefix: string = endpoint.url.slice(0, endpoint.url.indexOf('://'));
            if (prefix === 'http') {
                if (this.endPointsType.indexOf('SOAP/HTTP') === -1) {
                    this.endPointsType.push('SOAP/HTTP');
                }
                let temp: any = {};
                if (space) {
                    temp.space = space;
                } else {
                }
                temp.url = endpoint.url;
                temp['SOAP Version'] = endpoint.properties['SOAP Version'];
                temp.Style = endpoint.properties.Style;
                temp.Encoding = endpoint.properties.Encoding;
                temp.component = endpoint.name && endpoint.name.split('/')[0];
                temp.service = endpoint.name && endpoint.name.split('/')[1];
                this.soapHttpEndPoints.set(this.mapId, temp);
                this.mapId++;
            } else {
                if (this.endPointsType.indexOf('SOAP/JMS') === -1) {
                    this.endPointsType.push('SOAP/JMS');
                }
                let temp: any = {};
                if (space) {
                    temp.space = space;
                } else {
                }
                temp.url = endpoint.url;
                temp['SOAP Version'] = endpoint.properties['SOAP Version'];
                temp.Style = endpoint.properties.Style;
                temp.MesasgeType = endpoint.properties.MesasgeType;
                temp.AckMode = endpoint.properties.AckMode;
                temp.Encoding = endpoint.properties.Encoding;
                temp.component = endpoint.name && endpoint.name.split('/')[0];
                temp.service = endpoint.name && endpoint.name.split('/')[1];
                this.soapJmsEndPoints.set(this.mapId, temp);
                this.mapId++;
            }
        }
    }

    public selectContainer(container: any): void {
        for (let nodeId in this.responseData) {
            this.responseData[nodeId].states.forEach((app: any) => {
                // compare application_name in case of app.name since state will always have application_name now
                if (this.responseData[nodeId].appnodeName === container && app.endpoints && this.$state.params.applicationName === app.application_name) {
                    this.mapId = 0;
                    app.endpoints.forEach((endpoint: any) => {
                        this.prepareEndPoints(endpoint, this.responseData[nodeId].space);
                    });
                }
            });
        }
    }
}