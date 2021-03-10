/**
 * Created by Srikanta Dutta on 1/31/2017.
 */
import * as angular from 'angular';
import { ApplicationGridLevel1Component } from './components/application.grid.level1.component';
import { ApplicationGraphLevel1Component } from './components/application.graph.level1.component';
import { ApplicationGridLevel2Component } from './components/application.grid.level2.component';
import { AppInstanceGridLevel2Component } from './components/app.instance.grid.level2.components';
import { EndPointGridLevel2Component } from './components/endpoint.grid.level2.components';
import { ProcessGridLevel2Component } from './components/process.grid.level2.component';
import { ProcessInstrumentationGridLevel2Component } from './components/process.instrumentation.grid.level2.component';
import { ActivityInstrumentationGridLevel2Component } from './components/activity.instrumentation.grid.level2.component';
import { ProcessInstanceGridLevel2Component } from './components/process.instance.grid.level2.component';
import { ConfigureGridLevel2Component } from './components/configure.grid.level2.component';
import { ApplicationConfigGridLevel2Component } from './components/application.config.grid.level2.component';
import { ProcessDiagramComponent } from './components/process.diagram.components';
import { ActivityInstanceModalComponent } from './components/activity.instance.modal.component';
import { UploadFileModalComponent } from './components/upload.file.modal.component';

angular.module('monitor.application', [])
    .component('applicationGridLevel1', new ApplicationGridLevel1Component())
    .component('applicationGraphLevel1', new ApplicationGraphLevel1Component())
    .component('applicationGridLevel2', new ApplicationGridLevel2Component())
    .component('appInstanceGridLevel2', new AppInstanceGridLevel2Component())
    .component('endPointGridLevel2', new EndPointGridLevel2Component())
    .component('processGridLevel2', new ProcessGridLevel2Component())
    .component('processInstrumentationGridLevel2', new ProcessInstrumentationGridLevel2Component())
    .component('activityInstrumentationGridLevel2', new ActivityInstrumentationGridLevel2Component())
    .component('processInstanceGridLevel2', new ProcessInstanceGridLevel2Component())
    .component('configureGridLevel2', new ConfigureGridLevel2Component())
    .component('applicationConfigGridLevel2', new ApplicationConfigGridLevel2Component())
    .component('appProcessDiagram', new ProcessDiagramComponent())
    .component('activityInstanceModal', new ActivityInstanceModalComponent())
    .component('uploadFileModal', new UploadFileModalComponent());
    require('./components/file.upload.directive');
    require('./components/pagination.directive');
