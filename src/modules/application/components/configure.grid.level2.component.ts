/**
 * Created by bmane on 5/19/2017.
 */
import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ConfigureGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ConfigureGridLevel2Controller;
    public template: any = require('../partials/configure-grid-level2.html');
}

export class ConfigureGridLevel2Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public routeStateObject: any = {};
    public appInstanceGridHeader: any;
    public appInstanceDataMap: Map<string, any> = new Map<string, any>();
    public nodes: any = [];
    public selectedAppnode: string;
    public appVersion: string;
    public hideLeftPanel: boolean;
    constructor(private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any) {

 this.appInstanceGridHeader = this.gridConfig.grid.applicationProperties.columns;
        if (this.$state.params.configView === 'treeView') {
            this.appInstanceGridHeader[2].isVisible = false;
            this.appInstanceGridHeader[2].isSearchable = false;
            this.appInstanceGridHeader[2].isSortable = false;

        } else if (this.$state.params.configView === 'listView') {
            this.appInstanceGridHeader[2].isVisible = true;
            this.appInstanceGridHeader[2].isSearchable = true;
            this.appInstanceGridHeader[2].isSortable = true;
        }
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
        this.hideLeftPanel = this.globalVariables.hideConfigLeftPanel;
        this.globalVariables.configView = this.$state.params.configView;
        let count: number = 0;
        this.monitorServices.getApplications(token).then((response: any) => {
            if (response.data.status) {
                localStorage.setItem('token', '');
                this.$state.go('login');
            } else {
                for (let nodeId in response.data) {
                    if (response.data[nodeId]) {
                        response.data[nodeId].states.forEach((app: any) => {
                            // compare application_name in case of app.name since state will always have application_name now
                            if (this.$state.params.applicationName === app.application_name && this.$state.params.version === app.version) {
                                this.nodes.push({
                                    nodeId: nodeId, name: response.data[nodeId].appnodeName, host: response.data[nodeId].host,
                                    port: response.data[nodeId].port
                                });
                                this.appVersion = app.version;
                                if (count === 0 && this.$state.params.containerName === 'defaultContainer') {
                                    count++;
                                    this.selectedAppnode = this.nodes[0].name;
                                    this.monitorServices.getConfigInfo(nodeId, app.name, app.version).then((response1: any) => {
                                        this.createGV(response1.data, response.data[nodeId].space);
                                    });
                                } else if (count === 0 && this.$state.params.containerName === response.data[nodeId].appnodeName) {
                                    this.selectedAppnode = this.$state.params.containerName;
                                    this.globalVariables.configDefaultContainer = this.$state.params.containerName;
                                    count++;
                                    this.monitorServices.getConfigInfo(nodeId, app.name, app.version).then((response1: any) => {
                                        this.createGV(response1.data, response.data[nodeId].space);
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    }
    public selectAppnode(containerName: string): void {
        this.globalVariables.configDefaultContainer = containerName;
        this.selectedAppnode = containerName;
        this.$state.go('applications.application.configDetails',
            { 'currentAppTab': 'appInstances', 'containerName': containerName }, { reload: true });
    }

    public createGV(data: any, space: any): void {
        for (var i in data) {
            if (!i.includes('//BW.')) {
                let tokens: any = i.split('//');
                let temp: any = {};
                temp.key = tokens[tokens.length - 1];
                temp.value = data[i];
                if (space) {
                    temp.space = space;
                } else {
                }
                temp.path = tokens.join('/');
                this.appInstanceDataMap.set(i, temp);
            }

        }
    }

    public LeftPanelToggle(): void {
        this.hideLeftPanel = !this.hideLeftPanel;
        this.globalVariables.hideConfigLeftPanel = this.hideLeftPanel;
    }

    public switchConfigView(view: string): void {
        this.globalVariables.configView = view;
    }
}