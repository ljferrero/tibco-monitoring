/**
 * Created by Srikanta Dutta on 1/31/2017.
 */
import * as angular from 'angular';
import {AddAppNodeModalComponent} from './components/add.appnode.modal.component';
import {AppNodeGridLevel1Component} from './components/appnode.grid.level1.component';
import {AppNodeGraphLevel1Component} from './components/appnode.graph.level1.component';
import {DeleteAppNodeModalComponent} from './components/delete.appnode.modal.component';
import {AppNodeGridLevel2Component} from './components/appnode.grid.level2.component';
import {AppNodeApplicationGridLevel2Component} from './components/appnode.application.grid.level2.component';

angular.module('monitor.appnode', [])
    .component('appnodeGridLevel1', new AppNodeGridLevel1Component())
    .component('appnodeGraphLevel1', new AppNodeGraphLevel1Component())
    .component('addAppNodeModal', new AddAppNodeModalComponent())
    .component('deleteAppNodeModal', new DeleteAppNodeModalComponent()) .component('appnodeGridLevel2', new AppNodeGridLevel2Component())
    .component('appnodeApplicationGridLevel2', new AppNodeApplicationGridLevel2Component());
