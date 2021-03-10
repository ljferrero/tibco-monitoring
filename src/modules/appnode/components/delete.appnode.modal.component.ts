/**
 * Created by atin  on 2/6/2017.
 */
export class DeleteAppNodeModalComponent implements ng.IComponentOptions {
    public controller: any = DeleteAppNodeModalController;
    public template: any = require('../partials/delete-appnode-modal.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            resolve: '<',
            close: '&',
            dismiss: '&'
        };
    }
}
export class DeleteAppNodeModalController {
    public static $inject: any = ['MonitorServices' , '$q'];
    public searchArray: any = [];
    public resolve: any;
    public close: any;
    public dismiss: any;
    public appNodeArray: any = [];
    constructor(public monitorServices: any , private $q: any) {
        this.searchArray = this.resolve.items[0];
    }
    public ok(): any {
        let appNodeMap: any = this.resolve.items[1];
        var promises: any = [];
        appNodeMap.forEach((value, key) => {
                if (this.searchArray.indexOf(key) !== -1) {
                appNodeMap.delete(key);
                var promise: any = this.monitorServices.deleteAppNode(key);
                promises.push(promise);
                }
            });
            this.$q.all(promises).then((values) => {
            this.close({$value: values});
            });
    };
    public cancel(): any {
        this.dismiss({$value: 'cancel'});
    };
}



