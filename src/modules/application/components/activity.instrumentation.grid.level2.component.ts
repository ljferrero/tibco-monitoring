/**
 * Created by Srikanta Dutta on 3/23/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ActivityInstrumentationGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ActivityInstrumentationGridLevel2Controller;
    public template: any = require('../partials/activity-instrumentation-grid-level2.html');
}

export class ActivityInstrumentationGridLevel2Controller {
    public static $inject: any = ['$state', '$timeout', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels', '$filter', '$scope', '$rootScope'];
    public toogleProcess: boolean = true;
    public processInfo: any = [];
    public activityListHeader: any;
    public activityInfoList: Array<any>;
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
                    this.refresh(localStorage.getItem('token'));
                }
            } else {
                this.refresh(localStorage.getItem(null));
            }
        });



    }

    public refresh(token: string): any {
        this.monitorServices.getActivityInfo(this.selectedNodeAndAppObj.nodeId,
            this.selectedNodeAndAppObj.appName,
            this.selectedNodeAndAppObj.appVersion,
            this.selectedNodeAndAppObj.processName, token).then((response: any) => {
                this.activityInfoList = response.data.activityInfoList;
                this.lastUpdateTime = Date.now();
            });
    }
    public details(obj: any, token: string): any {
        this.monitorServices.getActivityInfo(obj.nodeId, obj.appName, obj.appVersion, obj.processName, token).then((response: any) => {
            this.activityInfoList = response.data.activityInfoList;
            this.lastUpdateTime = Date.now();
            if (this.globalVariables.selectedTabProcessDiagram === 'activityTab') {
                this.$rootScope.$broadcast('showActivityInfo', this.activityInfoList);
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
        private $scope: ng.IScope,
        private $rootScope: ng.IRootScopeService) {
        this.globalVariables.viewType = $state.params.viewType;
        // this.globalVariables.processTabViewType = 'activityInfo';
        this.activityListHeader = this.gridConfig.grid.activityInstrumentation.columns;
        this.$scope.$on('selectedProcess', (event: any, obj: any): any => {
            if (this.globalVariables.processTabViewType === 'activityInfo' || this.globalVariables.selectedTabProcessDiagram === 'activityTab') {
                this.selectedNodeAndAppObj = obj;

                this.monitorServices.getPlatformDetails().then((res: any) => {
                    this.globalVariables.env = res.data.env;
                    this.globalVariables.LoadUAA = res.data.LoadUAA;
                    if (res.data.env === 'pcf' && res.data.LoadUAA) {
                        if (!localStorage.getItem('token')) {
                            this.$state.go('login');
                        } else {
                            this.details(obj, localStorage.getItem('token'));
                        }
                    } else {
                        this.details(obj, localStorage.getItem(null));
                    }
                });
            }
        });
    }
}