/**
 * Created by Srikanta Dutta on 2/16/2017.
 */
export class RefreshComponent implements ng.IComponentOptions {
    public controller: any = RefreshController;
    public template: string = require('../partials/monitor-refresh.html');
}
export class RefreshController {
    public static $inject: any = ['$state'];
    public lastUpdateTime: any;

    public reload(): void {
        this.lastUpdateTime = Date.now();
        this.$state.reload();
    }

    constructor(private $state: ng.ui.IStateService) {
        this.lastUpdateTime = Date.now();
    }
}
