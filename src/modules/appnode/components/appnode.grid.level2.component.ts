/**
 * Created by Atin on 2/15/2017.
 */
import  'jquery';
import  * as Chart from 'chart.js';
export class AppNodeGridLevel2Component implements ng.IComponentOptions {
    public controller: any = AppNodeGridLevel2Controller;
    public template: any = require('../partials/appnode-grid-level2.html');
      constructor() {
    }
}
export class AppNodeGridLevel2Controller {
  public static $inject: any = ['MonitorServices' , 'globalVariables' , '$uibModal' , 'gridConfig', '$state' , '$filter'];
  public appNodesGridHeader: any;
  public appNodesApplicationDetailsDataMap: Map<string, any> = new Map<string, any>();
  public appNodesApplicationsDataMap: Map<string, any> = new Map<string, any>();
  public obj: any = {};
  public runningCount: any = 0;
  public state: any;
  public stoppedCount: number = 0;
  public routeStateObject: any = {};
  public propertyPanel: any;
  public appNodesGraphGridHeader: any;


  constructor(private monitorServices: any ,
      public globalVariables: any, public uibModal: any ,
      public gridConfig: any , private $state: any ,
      private $filter: any) {
        this.appNodesApplicationDetailsDataMap.set('id1' ,
        {running : 'Running' , Created : 1234 , Running: 1 ,
        Faulted : 0 , Cancelled: 0 , Scheduled: 0, Pagedout: 0 });
        this.routeStateObject.name =
        'appnodes.appnodeapp({nodeName: "an1" , applicationName: value})';
        this.appNodesGridHeader = this.gridConfig.grid.appNodes.columns;
        this.appNodesGraphGridHeader = this.gridConfig.grid.appNodes_graph.columns;
          this.monitorServices.getAppNodeRuntimeState(this.$state.nodeId).then((res: any) => {
          this.obj.host = res.data.host;
          this.state = res.data.state;
          this.obj.port = res.data.port;
          this.obj.uptime = res.data.uptime;
          this.propertyPanel = { detailGroup : { info_first_column :
             [{detail : 'uptime', detailStyle : 'upTime'} ,
              {detail : 'config_state' , detailStyle : 'status'} , {detail : 'Machine', detailStyle : 'Machine'}]} , data:
             {config_state : res.data.configState || 'out of Sync', Machine : res.data.host , uptime :
              res.data.uptime}
              , info_third_column:
             [{detail : 'processInstrumentation' , detailStyle : 'pInstrumentation'} ,
              {detail : 'process Instance', detailStyle : 'pInst'} ,
              {detail : 'Activity instance' , detailStyle : 'actInst'}]};
          this.monitorServices.getApplicationById(this.$state.nodeId).then((resp: any) => {
          resp.data.states.forEach((app: any) => {
          if (app.state === 'Running') {
          this.runningCount++;
          }else {
          this.stoppedCount++;
          }
          this.appNodesApplicationsDataMap.set(this.$state.nodeId,
           Object.assign({name: app.name , state : app.state ,
            configState: app.configState}, this.obj));
          this.createDonutChart();
          });
          });
          });
    }
    public deleteNode(size: string): any {
        var modalInstance: any = this.uibModal.open({
            component: 'deleteAppNodeModal',
            size: size,
            resolve: {
                items: (): any => {
                    return [];
                }
            }
        });
        modalInstance.result.then((): any => {
        }, (error: any) => {
        });
    };


    public createDonutChart(): any {
        var data: any = this.gridConfig.chart;
        data[0].value = this.runningCount;
        data[1].value = this.stoppedCount;
        var that: any = this;
        // get the context of the canvas element we want to select
       Chart.types.Doughnut.extend({
        name: 'DoughnutTextInside',
        draw: function(): any {
            Chart.types.Doughnut.prototype.draw.apply(this, arguments);
            var width: any = this.chart.width,
                height: any = this.chart.height;

            var fontSize: any = (height / 114).toFixed(2);
            this.chart.ctx.font = fontSize + 'em Verdana';
            this.chart.ctx.textBaseline = 'middle';

            var text: any = that.runningCount + that.stoppedCount,
                textX: any = Math.round((width - this.chart.ctx.measureText(text).width) / 2),
                textY: any = height / 2;

            this.chart.ctx.fillText(text, textX, textY);
        }
    });
    let ctx: any = $('#myChart').get(0);
    new Chart(ctx.getContext('2d')).DoughnutTextInside(data, {
        responsive: true
    });
    }


}


