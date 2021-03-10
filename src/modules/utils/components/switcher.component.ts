/**
 * Created by bmane on 2/6/2017.
 */
import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';
export class SwitcherComponent implements ng.IComponentOptions {
    public controller: any = SwitcherController;
    public template: string = require('../partials/monitor-switcher.html');
}
export class SwitcherController {
    public static $inject: any = ['$state', 'globalVariables', 'monLabels'];

    public switcherClick(viewType: string): void {
        this.globalVariables.viewType = viewType;
        if (this.$state.params.viewType === 'config') {
            this.globalVariables.appLevel2CurrentTab = 'appInstances';
        }
    }

    constructor(private $state: any,  private globalVariables: IGlobalVariables, private monLabels: any) {
    }
}
