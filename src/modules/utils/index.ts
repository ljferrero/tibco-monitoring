/**
 * Created by bmane on 2/21/2017.
 */
import * as angular from 'angular';
import 'angular-ui-router';
import {HeaderComponent} from '../utils/components/header.component';
import {LeftNavComponent} from '../utils/components/leftnav.component';
import {RefreshComponent} from '../utils/components/refresh.component';
import {SwitcherComponent} from '../utils/components/switcher.component';
import {GridComponent} from '../utils/components/grid.component';
import {DonutChartComponent} from '../utils/components/donut.chart.component';

angular.module('monitor.utils', [])
    .component('monHeader', new HeaderComponent())
    .component('leftNav', new LeftNavComponent())
    .component('refresh', new RefreshComponent())
    .component('switcher', new SwitcherComponent())
    .component('grid', new GridComponent())
    .component('donutChart', new DonutChartComponent());