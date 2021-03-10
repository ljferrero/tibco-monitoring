/**
 * Created by Srikanta Dutta on 2/1/2017.
 */
import * as angular from 'angular';
import 'angular-ui-router';
import {MonitorDashboardComponent} from './components/dashboard.component';
angular.module('monitor.dashboard', [])
    .component('monitorDashboard', new MonitorDashboardComponent());