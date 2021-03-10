/**
 * Created by atin  on 2/6/2017.
 */
export class AddAppNodeModalComponent implements ng.IComponentOptions {
    public controller: any = AddAppNodeModalController;
    public template: any = require('../partials/add-appnode-modal.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            resolve: '<',
            close: '&',
            dismiss: '&'
        };
    }
}
export class AddAppNodeModalController {
    public static $inject: any = ['MonitorServices', '$timeout'];
    public host: string;
    public port: any;
    public detaill: any;
    public close: any;
    public dismiss: any;
    public obj: any = {};
    public appNodeDetails: any = {};
    public details: any;
    constructor(public monitorServices: any, private timeout: any) {
        // data to beused in HTML will be moved to config file 
        this.details = [{name : 'host',
         pattern : /^(([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})[.]([0-9]{1,3})|(localhost))$/i
         , errorMessage : 'Please enter valid host IP', placeHolder : 'Enter the host IP'},
        {name : 'port', pattern : /^([1-9]{1}[0-9]{0,4})$/ ,
        errorMessage : 'Please enter valid port number', placeHolder : 'Enter the port number'}];
    }
    public ok(): any {
        this.obj = {host: this.host , port: this.port };
        // calling addAppNode to add the node .
        this.monitorServices.addAppNode(this.obj).then((result: any): any => {
        this.appNodeDetails = Object.assign(this.obj , {id : result.data.id});
            this.close({$value: result.data});
        // calling the getAppNodeRunTime service to get the Appnode runtime info .
            /* this.timeout(() => {
                this.monitorServices.getAppNodeRuntimeState(result.data.id).then((res: any): any => {
                    this.close({$value: [res.data, this.appNodeDetails]});
                }, (error: any) => {
                });
            }, 2000); */
        }, (error: any) => {
            console.log(error);
        });
    };

    public showTheErrorMessage(form: any , property: any): any {
        form[property].showMessage = true;
    }


    public hideTheErrorMessage( form: any , property: any): any {
        form[property].showMessage = false;
    }


    public cancel(): any {
        this.dismiss({$value: 'cancel'});
    };
}
