/**
 * Created by bmane on 2/28/2017.
 */
import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';

export class AppNodeApplicationGridLevel2Component implements ng.IComponentOptions {
    public controller: any = AppNodeApplicationGridLevel2Controller;
    public template: any = require('../partials/appnode-application-grid-level2.html');
}

export class AppNodeApplicationGridLevel2Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public applicationsGridHeader: any;
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public dataToBeRemoved: any ;

    public filterDataLength: number = 0;
    public processStatsStatus: boolean = false;
    public processInstanceStatsStatus: boolean = false;
    public activityStatsStatus: boolean = false;
    constructor(private $state: any,
                private monitorServices: any,
                private globalVariables: IGlobalVariables,
                private gridConfig: any, private monLabels: any) {
        this.globalVariables.viewType = $state.params.viewType;
        this.applicationsGridHeader = this.gridConfig.grid.applications.columns;
        this.monitorServices.getApplications().then((response: any) => {
        });
    }
}