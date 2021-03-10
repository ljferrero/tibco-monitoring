import './modules/dashboard';
import './modules/application';
import './modules/utils';
import './modules/process-diagram/index';

import * as angular from 'angular';
import { config as routesConfig } from './configs/monitor.route';
import { orderFilter } from './filters/order.filter';
import { orderMapFilter as orderMap } from './filters/order.map.filter';
import {timeFormatFilter} from './filters/time.format.filter';
import { GlobalVariables } from './configs/global.variables';
import { MonitorComponent } from './monitor.component';
import { gridConfig, monLabels } from './configs/constants';
import { MonitorServices } from './services/monitor.services';


import 'angular-ui-bootstrap';
import 'angular-ui-router';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import './styles/monitor.less';

angular.module('monitor',
['ui.bootstrap', 'ui.router', 'monitor.dashboard', 'monitor.application', 'monitor.utils', 'monitor.process.diagram'])
    .config(routesConfig)
    .component('bwMonitor', new MonitorComponent())
    .constant('gridConfig', gridConfig)
    .constant('monLabels', monLabels)
    .service('MonitorServices', MonitorServices)
    .value('globalVariables', new GlobalVariables)
    .filter('orderFilter', orderFilter)
    .filter('orderMapFilter', ['globalVariables', orderMap])
    .filter('timeFormatFilter', timeFormatFilter);

angular.bootstrap(document, ['monitor'], {
    strictDi: true
});
