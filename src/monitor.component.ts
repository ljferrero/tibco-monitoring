/**
 * Created by Srikanta Dutta on 2/13/2017.
 * This is the main Component
 */
import { IGlobalVariables } from './interfaces/IGlobalVariables';
export class MonitorComponent implements ng.IComponentOptions {
    public controller: any = MonitorController;
    public template: any = require('./monitor.html');
}

export class MonitorController {
    public static $inject: any = ['$state', 'globalVariables', 'monLabels'];
    constructor(private $state: any, private globalVariables: IGlobalVariables, private monLabels: any) {
    }
}