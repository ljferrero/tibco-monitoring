/**
 * Created by Srikanta Dutta on 3/06/2017.
 */

import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';

export class AppComponentGridLevel2Component implements ng.IComponentOptions {
    public controller: any = AppComponentGridLevel2Controller;
    public template: any = require('../partials/app-component-grid-level2.html');
}

export class AppComponentGridLevel2Controller {
    public static $inject: any = ['$state', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public routeStateObject: any = {};
    public appComponentsGridHeader: any;
    public appComponentsDataMap: Map<string, any> = new Map<string, any>();
    constructor(private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any) {
        this.globalVariables.viewType = $state.params.viewType;
        this.appComponentsGridHeader = this.gridConfig.grid.components.columns;
        this.monitorServices.getApplications().then((response: any) => {
        });
    }
}