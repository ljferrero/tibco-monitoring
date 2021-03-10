/**
 * Created by Srikanta Dutta on 3/23/2017.
 */

import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';

export class ProcessGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ProcessGridLevel2Controller;
    public template: any = `<div ui-view></div>`;
}

export class ProcessGridLevel2Controller {
    public static $inject: any = ['$state', '$timeout', 'MonitorServices', 'globalVariables', 'gridConfig', 'monLabels'];
    public selectedProcess: string;
    public gridData: any;
    constructor(private $state: any,
        private $timeout: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any, private monLabels: any) {
        this.globalVariables.viewType = $state.params.viewType;
        if ($state.current.name === 'applications.application.defaultDetails.activityInfo') {
            this.globalVariables.processTabViewType = 'activityInfo';
        } else if ($state.current.name === 'applications.application.defaultDetails.processInfo') {
            this.globalVariables.processTabViewType = 'processInfo';
        } else if ($state.current.name === 'applications.application.defaultDetails.instanceInfo') {
            this.globalVariables.processTabViewType = 'instanceInfo';
        }
        this.globalVariables.appLevel2CurrentTab = $state.params.currentAppTab;
    }
}