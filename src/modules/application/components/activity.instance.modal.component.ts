/**
 * Created by bmane on 10/3/2017.
 */

export class ActivityInstanceModalComponent implements ng.IComponentOptions {
    public controller: any = ActivityInstanceModalController;
    public template: any = require('../partials/activity-instance-modal.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            resolve: '<',
            close: '&',
            dismiss: '&'
        };
    }
}
export class ActivityInstanceModalController {
    public static $inject: any = ['MonitorServices', 'gridConfig', 'monLabels'];
    public close: any;
    public dismiss: any;
    public activityInstanceList: any;
    public resolve: any;
    public activityInstanceHeader: any;
    public activityInstanceData: any = [];
    constructor(public monitorServices: any, private gridConfig: any, private monLabels: any) {
        this.activityInstanceHeader = this.gridConfig.grid.activityInstance.columns;
        if (this.resolve.modalData.processInstanceJobId) {
            this.monitorServices.getActivityInstance(this.resolve.modalData.nodeId, this.resolve.modalData.appName,
                this.resolve.modalData.appVersion, this.resolve.modalData.processName, this.resolve.modalData.processInstanceJobId).then((response: any) => {
                this.activityInstanceList = response.data;
                this.createActivityInstanceHeaderData();
            });
        }

    }

    public createActivityInstanceHeaderData(): void {
        this.activityInstanceData = [];
        for (var i: number = 0; i < this.activityInstanceList.length; i++ ) {
            var obj: any = {};
            for ( var j: number = 0 ; j < this.activityInstanceHeader.length ; j++) {
                obj[this.activityInstanceHeader[j].property] = this.activityInstanceList[i][this.activityInstanceHeader[j].property];
            }
            this.activityInstanceData.push(obj);
        }
    }
    public cancel(): any {
        this.dismiss({$value: 'cancel'});
    };
}

