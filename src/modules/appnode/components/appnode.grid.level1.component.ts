/**
 * Created by bmane on 2/1/2017.
 */
import {IAppNodeDef} from '../../../interfaces/IAppNodeDef';

export class AppNodeGridLevel1Component implements ng.IComponentOptions {
    public controller: any = AppNodeGridLevel1Controller;
    public template: any = require('../partials/appnode-grid-level1.html');
}
export class AppNodeGridLevel1Controller {
    public static $inject: any = ['$state', 'MonitorServices', '$uibModal', 'gridConfig', 'monLabels' , 'globalVariables' , '$filter'];
    public appNodesGridHeader: any;
    public appNodesDataMap: Map<string, IAppNodeDef> = new Map<string, IAppNodeDef>();
    public dataToBeRemoved: any = [];
    public routeStateObject: any = {};
    public filterDataLength: number = 0;
    public appNodesGraphGridHeader: any;
    public addAppNode: any = function (size: string): any {
        var modalInstance: any = this.uibModal.open({
            component: 'addAppNodeModal',
            size: size,
            resolve: {
              items: (): any => {
                    return this.appNodesDataMap;
                }
            }
        });
        modalInstance.result.then((appNodeDetails): any => {
            if (appNodeDetails.state === 'Stopped') {
                    this.appNodesDataMap.set(appNodeDetails.id, {state : 'Stopped'  , uptime:
                        '0d 00:00:00' , configState : 'In sync' , name: appNodeDetails.name,
                        host: appNodeDetails.host, port: appNodeDetails.port, isChecked: false  });
            } else {
                let uptime: any = this.$filter('timeFormatFilter')(appNodeDetails.uptime);
                this.appNodesDataMap.set(appNodeDetails.id, {state : appNodeDetails.state  , uptime:
                uptime , configState : appNodeDetails.configState , name: appNodeDetails.name, host: appNodeDetails.host,
                    port: appNodeDetails.port, isChecked: false });
            }
            this.filterDataLength++;
        }
            , (error: any): any => {
        }, (error: any) => {
        });
    };
    public deleteNode(size: string): any {
        var modalInstance: any = this.uibModal.open({
            component: 'deleteAppNodeModal',
            size: size,
            resolve: {
                items: (): any => {
                    return [this.dataToBeRemoved, this.appNodesDataMap];
                }
            }
        });
        modalInstance.result.then((): any => {
            this.dataToBeRemoved = [];
            this.filterDataLength = this.appNodesDataMap.size;
        }, (error: any) => {
        });
    };
    constructor(private $state: ng.ui.IState, private monitorServices: any, private uibModal: any,
    private gridConfig: any, private monLabels: any, private globalVariables: any ,
    private $filter: any) {
        this.routeStateObject.name = 'appnodes.appnode({nodeName : value})';
        this.appNodesGridHeader = this.gridConfig.grid.appNodes.columns;
        this.appNodesGraphGridHeader = this.gridConfig.grid.appNodes_graph.columns;
        this.monitorServices.getAppnodes().then((response: any) => {
            for (let nodeId in response.data) {
                if (response.data.hasOwnProperty(nodeId)) {
                    if (response.data[nodeId].state === 'Stopped') {
                        this.appNodesDataMap.set(nodeId, {state: 'Stopped', uptime:
                            '0d 00:00:00', configState: 'In sync', name: response.data[nodeId].name,
                            host: response.data[nodeId].host, port: response.data[nodeId].port, isChecked: false , id: nodeId } );
                    } else {
                        this.appNodesDataMap.set(nodeId, Object.assign(response.data[nodeId] , { id: nodeId }));
                    }
                }
            }
            this.filterDataLength = this.appNodesDataMap.size;
        });
    }
}

