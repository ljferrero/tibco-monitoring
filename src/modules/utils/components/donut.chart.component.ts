/**
 * Created by Srikanta Dutta on 2/1/2017.
 */

import {IGlobalVariables} from '../../../interfaces/IGlobalVariables';
import  'jquery';
import  * as Chart from 'chart.js';
export class DonutChartComponent implements ng.IComponentOptions {
    public controller: any = DonutChartController;
    public template: string = require('../partials/donut-chart.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            runningCount: '<',
            stoppedCount: '<'
        };
    }
}

export class DonutChartController {
    public static $inject: any = ['$state', 'globalVariables' , '$rootScope' , 'gridConfig'];
    public stoppedCount: number;
    public runningCount: number;
    constructor($state: ng.ui.IStateService ,
    private globalVariables: IGlobalVariables,
     private $rootScope: any
    , private gridConfig: any) {
            this.$rootScope.$on('dataReturn' , (event , args) => {
            this.runningCount = args[0];
            this.stoppedCount = args[1];
            this.createDonutChart();
        });
    }

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
    var canvas: any = $('#myChart').get(0);
    new Chart(canvas.getContext('2d')).DoughnutTextInside(data, {
        responsive: true
    });
    }
}