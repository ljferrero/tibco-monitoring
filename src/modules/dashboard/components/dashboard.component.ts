/**
 * Created by Srikanta Dutta on 2/1/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class MonitorDashboardComponent implements ng.IComponentOptions {
    public controller: any = DashBoardController;
    public template: string = require('../partials/monitor-dashboard.html');
}

export class DashBoardController {
    public static $inject: any = ['$state', 'globalVariables', 'MonitorServices', 'gridConfig', '$rootScope'];
    public stoppedCount: number = 0;
    public runningCount: number = 0;
    constructor($state: ng.ui.IStateService,
        private globalVariables: IGlobalVariables,
        private monitorServices: any
        , private gridConfig: any, private $rootScope: any) {
        // this.monitorServices.getAppnodes().then((response: any) => {
        //     for (let nodeId in response.data) {
        //         if (response.data.hasOwnProperty(nodeId)) {
        //             if (response.data[nodeId].state === 'Stopped') {
        //                 this.stoppedCount++;
        //             } else {
        //                 this.runningCount++;

        //             }
        //         }
        //     }
        //     this.$rootScope.$broadcast('dataReturn', [this.runningCount, this.stoppedCount]);
        // });


        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.globalVariables.LoadUAA = res.data.LoadUAA;
            if (res.data.env !== 'pcf') {
                $state.go('applications', { viewType: 'default' });
            } else {
                if (res.data.LoadUAA) {



                    if (!localStorage.getItem('token')) {
                        this.monitorServices.getConfigData().then(response => {
let url: any = `${response.data.url}/oauth/authorize?response_type=code&client_id=${response.data.client_id}&redirect_uri=${response.data.redirect_uri}`;
                            window.location.href = url;
                        });
                    };
                }else {
                    $state.go('applications', { viewType: 'default' });
                 }
            }
        });


    }
}