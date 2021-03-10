/**
 * Created by Srikanta Dutta on 2/15/2017.
 */

import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';

export class ApplicationGraphLevel1Component implements ng.IComponentOptions {
    public controller: any = ApplicationGraphLevel1Controller;
    public template: any = require('../partials/application-graph-level1.html');
}
export class ApplicationGraphLevel1Controller {
    public static $inject: any = ['$state', 'globalVariables'];

    constructor(private $state: any, private globalVariables: IGlobalVariables) {
        this.globalVariables.viewType = $state.params.viewType;
    }
}