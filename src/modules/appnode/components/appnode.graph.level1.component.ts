/**
 * Created by Srikanta Dutta on 2/15/2017.
 */
import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';
export class AppNodeGraphLevel1Component implements ng.IComponentOptions {
    public controller: any = AppNodeGraphLevel1Controller;
    public template: any = require('../partials/appnode-graph-level1.html');
}
export class AppNodeGraphLevel1Controller {
    public static $inject: any = ['$state', 'globalVariables'];
    constructor(private $state: any, private globalVariables: IGlobalVariables) {
        this.globalVariables.viewType = $state.params.viewType || this.globalVariables.viewType;
    }
}