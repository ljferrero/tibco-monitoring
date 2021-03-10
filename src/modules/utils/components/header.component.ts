import { MonitorServices } from '../../../services/monitor.services';

/**
 * Created by bmane on 2/1/2017.
 */
export class HeaderComponent implements ng.IComponentOptions {
    public controller: any = HeaderController;
    public template: string = require('../partials/monitor-header.html');
}
export class HeaderController {
    public static $inject: any = ['monLabels', 'globalVariables', 'MonitorServices', '$state', '$rootScope'];
    public user_name: string;
    public version: any;
    constructor(private monLabels: any, private globalVariables: any, public monitorServices: MonitorServices, public $state: any, $rootScope: any) {
       if (localStorage.getItem('token')) {
        this.monitorServices.getUserName(localStorage.getItem('token')).then(data => {
            this.user_name = data.data.name;
        });
    }
    // written here so that executed only once. We might need to create another service if there are multiple requirements of such kind
    // body click events
    // while body click, broadcast to all scopes
    jQuery('body').on('click.bodyclick', function (e: any, d: any): void {
        $rootScope.$broadcast('domBodyClicked', e);
    });
        this.monitorServices.getPlatformDetails(null).then(data => {
            this.globalVariables.env = data.data.env;
            this.globalVariables.version = data.data.version;
            this.globalVariables.LoadUAA = data.data.LoadUAA;
        });
    }

    public logout(): any {
        localStorage.setItem('token', '');
        this.monitorServices.getPlatformDetails(null).then((res: any) => {
            this.globalVariables.env = res.data.env;
            if (res.data.env !== 'pcf') {
                this.$state.go('applications', { viewType: 'default' });
            } else {
                if (!localStorage.getItem('token')) {
                    this.monitorServices.getConfigData().then(response => {
                        window.location.href = `${response.data.url}/logout.do?client_id=${response.data.client_id}`;

                    });
                };
            }
        });


    }
    public resetGV(): void {
        this.globalVariables.viewType = 'default';
        this.globalVariables.processTabViewType = 'processInfo';
        this.globalVariables.configDefaultContainer = 'defaultContainer';
        this.globalVariables.appLevel2CurrentTab = 'appInstances';
        this.globalVariables.hideConfigLeftPanel = false;
        this.globalVariables.configView = 'treeView';
    }
}