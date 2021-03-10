/**
 * Created by Srikanta Dutta on 3/23/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ProcessInstrumentationGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ProcessInstrumentationGridLevel2Controller;
    public template: any = require('../partials/process-instrumentation-grid-level2.html');
}

export class ProcessInstrumentationGridLevel2Controller {
    public static $inject: any = ['$state', '$timeout', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels', '$filter', '$scope'];
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public processInfoList: Array<any>;
    public toogleProcess: boolean = true;

    public selectedProcess: string;
    public gridData: any;
    public nodes: any = [];
    public selectedAppnode: string;
    public appVersion: string;
    public processPkgs: any = [];
    public selectedPackage: string;
    public emptyColumnValue: string = '-';
    public lastUpdateTime: any;
    public selectedNodeAndAppObj: any;
    public refreshGridData(): void {
        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.globalVariables.LoadUAA = res.data.LoadUAA;
            if (this.globalVariables.env === 'pcf' && res.data.LoadUAA) {
                if (!localStorage.getItem('token')) {
                    this.$state.go('login');
                } else {
                    this.details(localStorage.getItem('token'));
                }
            } else {
                this.details(null);
            }
        });


    }
    public details(token: string): any {
        this.monitorServices.getProcessInfo(this.selectedNodeAndAppObj.nodeId,
            this.selectedNodeAndAppObj.appName,
            this.selectedNodeAndAppObj.appVersion,
            this.selectedNodeAndAppObj.processName, token).then((response: any) => {
                if (response.data.status) {
                    localStorage.setItem('token', '');
                    this.$state.go('login');
                } else {
                    this.processInfoList = response.data.processInfoList;
                    this.lastUpdateTime = Date.now();
                }
            });
    }
    constructor(private $state: any,
        private $timeout: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any,
        private monLabels: any,
        private $filter: any,
        private $scope: any) {
        this.lastUpdateTime = Date.now();
        this.$scope.$on('selectedProcess', (event: any, obj: any): any => {
            if (this.globalVariables.processTabViewType === 'processInfo' && this.globalVariables.selectedTabProcessDiagram === 'processTab') {
                this.selectedNodeAndAppObj = obj;

                this.monitorServices.getPlatformDetails().then((res: any) => {
                    this.globalVariables.env = res.data.env;
                    this.globalVariables.LoadUAA = res.data.LoadUAA;
                    if (this.globalVariables.env === 'pcf' && res.data.LoadUAA) {
                        if (!localStorage.getItem('token')) {
                            this.$state.go('login');
                        } else {
                            this.details(localStorage.getItem('token'));
                        }
                    } else {
                        this.details(localStorage.getItem(null));
                    }
                });
            }
        });
    }
}