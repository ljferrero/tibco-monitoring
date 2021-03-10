/**
 * Created by Srikanta Dutta on 05/18/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';

export class ProcessDiagramComponent implements ng.IComponentOptions {
    public controller: any = ProcessDiagramController;
    public template: any = require('../../process-diagram/partials/process-diagram.html');
}

export class ProcessDiagramController {
    public static $inject: any =
        ['$scope', '$rootScope', '$state', 'MonitorServices', 'globalVariables', 'monLabels', 'initSvgObject', 'configurationService', '$filter', '$timeout'];
    public isShow: boolean = true;
    public selectedTab: string = 'generalTab';
    public dragFlag: boolean = false;
    public tabShowFlag: boolean = true;
    public activityInstInfoOfGraphView: any;
    public diagramObject: any;
    public svgData: any;
    public currentSvgData: any;
    public emptyColumnValue: string = '-';
    public selectedNodeAndAppObj: any;
    public nodes: any = [];
    public appVersion: string;
    public selectedAppnode: string;
    public processInfoList: Array<any>;
    public processPkgs: any = [];
    public selectedProcess: string;
    public selectedPackage: string;
    public activityInstInfoData: any;
    public isHighlightProcessSelection: boolean = true;


    // public isShowActivityTab: boolean = false;

    public mousePos: any = {};
    constructor(
        private $scope: ng.IScope,
        private $rootScope: any,
        private $state: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private monLabels: any,
        private initSvgObject: any,
        private configurationService: any,
        private $filter: any,
        private $timeout: any) {
        this.initSvgObject.init();
        this.monitorServices.getPlatformDetails().then((res: any) => {
            this.globalVariables.env = res.data.env;
            this.globalVariables.LoadUAA = res.data.LoadUAA;
            if (this.globalVariables.env === 'pcf' && res.data.LoadUAA) {
                if (!localStorage.getItem('token')) {
                    $state.go('login');
                } else {
                    this.details(localStorage.getItem('token'));
                }
            } else {
                this.details(null);
            }
        });

        $scope.$on('handleProcessSelection', (event: any, data: any) => {
            let trimResult: any = data.processName.split('.');
            let pkg: string = '';
            for (var j: number = 0; j < trimResult.length - 1; j++) {
                pkg = pkg + '.' + trimResult[j];
            }
            this.selectProcess(pkg.substring(1, pkg.length), trimResult[j], data);
        });


        this.globalVariables.viewType = $state.params.viewType;
        this.globalVariables.isShowActivityTab = false;
        this.globalVariables.selectedTabProcessDiagram = 'generalTab';

        this.activityInstInfoOfGraphView = configurationService.getProcessInstStatsGridHeaderOfGraph().getActivityInstGroup();
        this.$scope.$on('setActivityInfo', (event: any, callback: any): any => {
            if ($state.current.name !== 'applications.application.defaultDetails.instanceInfo') {
                this.setSlider();
                if (this.globalVariables.env === 'pcf') {
                    this.monitorServices.getActivityInfo(
                        this.selectedNodeAndAppObj.nodeId,
                        this.selectedNodeAndAppObj.appName,
                        this.selectedNodeAndAppObj.appVersion,
                        this.selectedNodeAndAppObj.processName, localStorage.getItem('token'))
                        .then((response: any) => {
                            callback(response.data.activityInfoList);
                        });
                } else {
                    this.monitorServices.getActivityInfo(
                        this.selectedNodeAndAppObj.nodeId,
                        this.selectedNodeAndAppObj.appName,
                        this.selectedNodeAndAppObj.appVersion,
                        this.selectedNodeAndAppObj.processName, null)
                        .then((response: any) => {
                            callback(response.data.activityInfoList);
                        });
                }
            }
        });
        // if (this.globalVariables.processTabViewType === 'instanceInfo') {
        //     this.selectedNodeAndAppObj.isAllProcessData = true;
        //     this.isHighlightProcessSelection = false;
        // } else {
        //     this.selectedNodeAndAppObj.isAllProcessData = false;
        //     this.isHighlightProcessSelection = true;
        // }
    }

    public details(token: any): any {
        let count: number = 0;
        this.monitorServices.getApplications(token).then((response: any) => {
            if (response.data.status) {
                localStorage.setItem('token', '');
                this.$state.go('login');
            } else {
                let values: any = Object.values(response.data);
                let sortedValues: any = this.$filter('orderBy')(values, 'appnodeName');
                sortedValues.forEach((value: any) => {
                    value.states.forEach((app: any) => {
                        if (app.application_name === this.$state.params.applicationName && this.$state.params.version === app.version) {
                            this.nodes.push({ nodeId: value.nodeId, name: value.appnodeName, host: value.host, port: value.port });
                            this.appVersion = app.version;
                            if (count === 0 && this.$state.params.containerName === 'defaultContainer') {
                                this.selectedAppnode = value.appnodeName;
                                this.selectedNodeAndAppObj = { nodeId: value.nodeId, appName: app.name, appVersion: app.version };
                                count++;
                                this.monitorServices.getProcessDiagram(value.nodeId, app.name, app.version,
                                    localStorage.getItem('token')).then((res: any) => {
                                        this.diagramObject = res.data;
                                        this.prepareInfoData();
                                        if (this.globalVariables.processTabViewType === 'activityInfo'
                                            || this.globalVariables.processTabViewType === 'instanceInfo') {
                                            this.$rootScope.$broadcast('selectedProcess', this.selectedNodeAndAppObj);
                                        }
                                    });
                            } else if (count === 0 && this.$state.params.containerName === value.appnodeName) {
                                this.selectedAppnode = this.$state.params.containerName;
                                this.selectedNodeAndAppObj = { nodeId: value.nodeId, appName: app.name, appVersion: app.version };
                                count++;
                                this.monitorServices.getProcessDiagram(value.nodeId, app.name, app.version,
                                    localStorage.getItem('token')).then((res: any) => {
                                        this.diagramObject = res.data;
                                        this.prepareInfoData();
                                        if (this.globalVariables.processTabViewType === 'activityInfo' ||
                                            this.globalVariables.processTabViewType === 'instanceInfo') {
                                            this.$rootScope.$broadcast('selectedProcess', this.selectedNodeAndAppObj);
                                        }
                                    });
                            }

                        }
                    });
                });
            }
        });
    }
    public selectInfoTab(selectedInfoTab: string): void {

        this.globalVariables.processTabViewType = selectedInfoTab;
        let stateName: string = 'applications.application.defaultDetails.' + selectedInfoTab;
        this.$state.go(stateName,
{ 'currentAppTab': 'processes', 'containerName': this.$state.params.containerName, 'processName': this.$state.params.processName }, { notify: true });
        if (this.selectedPackage === '(default.package)') {
            this.selectedNodeAndAppObj.processName = this.selectedProcess;
        } else {
            this.selectedNodeAndAppObj.processName = this.selectedPackage + '.' + this.selectedProcess;
        }
        if (selectedInfoTab === 'instanceInfo') {
            this.selectedNodeAndAppObj.isAllProcessData = true;
            this.isHighlightProcessSelection = false;
        } else {
            this.selectedNodeAndAppObj.isAllProcessData = false;
            this.isHighlightProcessSelection = true;
        }
        this.selectedNodeAndAppObj.doNotReload = false;

        // if(this.$state.current.name === 'applications.application.defaultDetails.instanceInfo'){
        //     this.selectedProcess = null;
        //     this.selectedPackage = null;
        // }
        this.$rootScope.$broadcast('selectedProcess', this.selectedNodeAndAppObj);
    }

    public createProcessPakages(processPkg: string, processName: string, processId: number): void {

        if (this.processPkgs.length === 0) {
            this.processPkgs.push({ 'package': processPkg, 'processNames': [{ processName: processName, id: processId }] });
        } else {
            let flag: boolean = false;
            this.processPkgs.forEach((pkg: any) => {
                if (pkg.package === processPkg) {
                    flag = true;
                    pkg.processNames.push({ processName: processName, id: processId });
                }
            });
            if (!flag) {
                this.processPkgs.push({ 'package': processPkg, 'processNames': [{ processName: processName, id: processId }] });
            }
        }
    }

    public selectAppnode(containerName: string): void {
        this.$state.go('applications.application.defaultDetails.processDiagram',
            { 'currentAppTab': 'processes', 'containerName': containerName, 'processName': this.$state.params.processName }, { notify: true });

    }
    public collapseToggleAll(value: boolean): void {
        this.processPkgs.forEach((pkg: any) => {
            pkg.active = !value;
        });
    }
    public selectProcess(processPackage: string, processName: string, data: any): void {
        this.initSvgObject.init();
        this.selectedProcess = processName;
        this.selectedPackage = processPackage;
        if (this.globalVariables.selectedTabProcessDiagram === 'activityTab') {
            this.globalVariables.selectedTabProcessDiagram = 'generalTab';
        }
        this.setSlider();
        var notify: boolean = true;
        if (this.$state.current.name === 'applications.application.defaultDetails.processInfo') {
            notify = true;
        } else {
            notify = false;
        }
        this.diagramObject.forEach((process: any) => {
            let pName: string  = '';
            if (this.selectedPackage === '(default.package)') {
                pName = this.selectedProcess;
            } else {
                pName = this.selectedPackage + '.' + this.selectedProcess;
            }
            let stateName: string = 'applications.application.defaultDetails.' + this.globalVariables.processTabViewType;
            if (pName === process.name) {
                this.$state.go(stateName,
{ 'currentAppTab': 'processes', 'containerName': this.$state.params.containerName, 'processName': this.selectedProcess }, { notify: notify });
                this.$timeout((): any => {
                this.globalVariables.isShowActivityTab = false;
                this.svgData = process.diagramConfigString;
                this.currentSvgData = process.diagramConfigString;
                this.$rootScope.$broadcast('processSelected', this.svgData);
                if (this.selectedPackage === '(default.package)') {
                    this.selectedNodeAndAppObj.processName = this.selectedProcess;
                } else {
                    this.selectedNodeAndAppObj.processName = this.selectedPackage + '.' + this.selectedProcess;
                }
                this.selectedNodeAndAppObj.isAllProcessData = data && data.isAllProcessData || false;
                this.isHighlightProcessSelection = !(data && data.isAllProcessData || false);
                this.selectedNodeAndAppObj.doNotReload = data && data.doNotReload || false;
                this.$rootScope.$broadcast('selectedProcess', this.selectedNodeAndAppObj);
                }, 0);
            }
        });
    }


    public prepareInfoData(): void {
        var a: any = 0;
        a = 10;
        var processId: number = 0;
        this.initSvgObject.init();
        this.diagramObject.forEach((data: any): any => {
            let trimResult: any = data.name.split('.');
            let pkg: string = '';
            for (var j: number = 0; j < trimResult.length - 1; j++) {
                pkg = pkg + '.' + trimResult[j];
            }
            if (pkg === '') {
                data.pkg = '(default.package)';
            } else {
                data.pkg = pkg.substring(1, pkg.length);
            }
            data.trimmedProcessName = trimResult[j];
            this.createProcessPakages(data.pkg, data.trimmedProcessName, processId++);
        });
        if (this.$state.params.processName === 'defaultProcess') {
            this.svgData = this.diagramObject[0].diagramConfigString;
            this.currentSvgData = this.diagramObject[0].diagramConfigString;
            this.selectedProcess = this.processPkgs[0].processNames[0].processName;
            this.selectedPackage = this.processPkgs[0].package;
            this.processPkgs[0].active = true;
        } else {
            var validProcessName: boolean = false;
            this.processPkgs.forEach((pkg: any) => {
                pkg.processNames.forEach((obj: any) => {
                    if (obj.processName === this.$state.params.processName) {
                        this.selectedProcess = this.$state.params.processName;
                        this.selectedPackage = pkg.package;
                        pkg.active = true;
                        validProcessName = true;
                    }
                });
            });
            if (validProcessName) {
                this.diagramObject.forEach((process: any) => {
                    let pName: string  = '';
                    if (this.selectedPackage === '(default.package)') {
                        pName = this.selectedProcess;
                    } else {
                        pName = this.selectedPackage + '.' + this.selectedProcess;
                    }
                    if (pName === process.name) {
                        this.svgData = process.diagramConfigString;
                        this.currentSvgData = process.diagramConfigString;
                    }
                });
            } else {
                this.svgData = this.diagramObject[0].diagramConfigString;
                this.currentSvgData = this.diagramObject[0].diagramConfigString;
                this.selectedProcess = this.processPkgs[0].processNames[0].processName;
                this.selectedPackage = this.processPkgs[0].package;
                this.processPkgs[0].active = true;
            }

        }
        if (this.$state.current.name === 'applications.application.defaultDetails.instanceInfo') {
            this.isHighlightProcessSelection = false;
        }
        if (this.selectedPackage === '(default.package)') {
            this.selectedNodeAndAppObj.processName = this.selectedProcess;
        } else {
            this.selectedNodeAndAppObj.processName = this.selectedPackage + '.' + this.selectedProcess;
        }
    }
    public switchTab(selectedTab: string): any {
        this.globalVariables.selectedTabProcessDiagram = selectedTab;
        this.setSlider();
        if (selectedTab === 'processTab' || selectedTab === 'activityTab' || selectedTab === 'instanceTab') {
            if (this.selectedPackage === '(default.package)') {
                this.selectedNodeAndAppObj.processName = this.selectedProcess;
            } else {
                this.selectedNodeAndAppObj.processName = this.selectedPackage + '.' + this.selectedProcess;
            }
            this.$rootScope.$broadcast('selectedProcess', this.selectedNodeAndAppObj);
        }
    }
    public setSlider(): any {
        if (this.globalVariables.selectedTabProcessDiagram === 'processTab') {
            jQuery('.bw_lv2_process-tabListDragBar').css({ bottom: 289 + 'px' });
            jQuery('.bw_lv2_process-tabContent').css({ height: 259 + 'px' });
        } else if (this.globalVariables.selectedTabProcessDiagram === 'generalTab') {
            jQuery('.bw_lv2_process-tabListDragBar').css({ bottom: 102 + 'px' });
            jQuery('.bw_lv2_process-tabContent').css({ height: 72 + 'px' });
        } else {
            jQuery('.bw_lv2_process-tabListDragBar').css({ bottom: 225 + 'px' });
            jQuery('.bw_lv2_process-tabContent').css({ height: 195 + 'px' });
        }
    }
    public tabListDragStart(event: any): any {
        this.dragFlag = true;
        this.mousePos.minHeight = 50;
        this.mousePos.maxHeight = 550;
        this.mousePos.oldY = event.pageY;
        var bottomPos: any = jQuery('.bw_lv2_process-tabListDragBar').css('bottom');
        this.mousePos.oldBottom = bottomPos.substr(0, bottomPos.length - 2);
    }
    public tabListDragOver(): any {
        this.dragFlag = false;
    }
    public tabListDragMove(event: any): any {
        if (this.dragFlag) {
            this.mousePos.newY = event.pageY;
            this.mousePos.offset = this.mousePos.oldY - this.mousePos.newY;
            this.mousePos.finalY = parseInt(this.mousePos.oldBottom, 10) + parseInt(this.mousePos.offset, 10);
            this.mousePos.finalY = (this.mousePos.finalY < this.mousePos.minHeight) ? this.mousePos.minHeight : this.mousePos.finalY;
            this.mousePos.finalY = (this.mousePos.finalY > this.mousePos.maxHeight) ? this.mousePos.maxHeight : this.mousePos.finalY;
            jQuery('.bw_lv2_process-tabListDragBar').css({ bottom: this.mousePos.finalY + 'px' });
            jQuery('.bw_lv2_process-tabContent').css({ height: this.mousePos.finalY - 30 + 'px' });
        }
    }
}

