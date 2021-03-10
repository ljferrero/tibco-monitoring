/**
 * Created by bmane on 9/23/2017.
 */

import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';
import * as angular from 'angular';

export class ProcessInstanceGridLevel2Component implements ng.IComponentOptions {
    public controller: any = ProcessInstanceGridLevel2Controller;
    public template: any = require('../partials/process-instance-grid-level2.html');
}

export class ProcessInstanceGridLevel2Controller {
    public static $inject: any = ['inputOutputFormatter',
        '$state', '$timeout', 'MonitorServices', 'globalVariables',
        'gridConfig', 'monLabels', '$filter', '$scope', '$rootScope', 'initSvgObject'];
    public applicationsDataMap: Map<string, any> = new Map<string, any>();
    public processInstanceList: Array<any>;
    public toogleProcess: boolean = true;
    public selectedProcess: string;
    public gridData: any;
    public nodes: any = [];
    public selectedAppnode: string;
    public appVersion: string;
    public processPkgs: any = [];
    public selectedPackage: string;
    public emptyColumnValue: string = '-';
    public processInstanceHeader: any;
    public selectStateBtnName: string;
    public processInstanceStatesButton: any = [];
    public selectedProcessInstanceId: string = '';
    public totalProcessInst: any = 0;
    public pageSize: number = 20;
    public offset: number = 0;
    public sortBy: string = null;
    public sortOrder: string = null;
    public processInstanceData: any = [];
    public selectProcessObj: any;
    public currentPage: number = 1;
    public pager: any = {};
    public numberOfItems: any = 0;
    public numberOfPages: number = 0;
    public status: string = 'null';
    public inputPagination: number = 1;
    public processData: any;
    public columnstoggle: boolean = false;
    public selectedColumnCount: number = 3;
    public moment: any = require('moment');
    public searchText: string = '';
    public isAllProcessData: boolean = true;
    public selectedUpperTab: string = 'diagram';
    public activityInstanceList: any;
    public activityInstanceHeader: any;
    public activityInstanceData: any = [];
    public activityDetailsGridHeader: any = this.gridConfig.jobDetailsHeader;
    public selectedLowerTab: string = 'details';
    public isShowInputOutputData: boolean = false;
    public selectedActivityConfData: any;
    public isActivityClicked: boolean = false;
    public jobDetails: any = null;
    public activityInput: any = [];
    public activityOutput: any = [];
    public svgObject: any = null;
    public toggleHide: boolean = false;
    public diagramView: any = 'col-lg-6';
    public isDiagram: boolean = false;
    public selectedActivityName: string = '';
    public startDtOptions: any = {};
    // date options and date model for filter by date. Same date object is NOT used porposely to avoid some existing issue with datepicker.
    public dateSearch: any = {
        today: new Date(),
        selectedDays: null,
        isDateFilter: false,
        startDtOptions: {
            dt : this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0),
            time: this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0),
            dtChange: function(): void{
                // callback for date change
            },
            timeChange: function(): void{
                // callback for time change
            }
        },
        endDtOptions: {
            dt : this.getDatePlusDays(0),
            time: this.getDatePlusDays(0),
            dtChange: function(): void{
                // callback for date change
            },
            timeChange: function(): void{
                // callback for time change
            }
        },
        getStartDateMills: (): Number => {
            if (this.dateSearch.isDateFilter) {
                return this.getMergedDates(this.dateSearch.startDtOptions.dt, this.dateSearch.startDtOptions.time).getTime();
            }
            return 0;
        },
        getEndDateMills: (): Number => {
            if (this.dateSearch.isDateFilter) {
                return this.getMergedDates(this.dateSearch.endDtOptions.dt, this.dateSearch.endDtOptions.time).getTime();
            }
            return 0;
        },
        getDataForSelectedDays: (day: string) => {
            this.dateSearch.selectedDays = day;
            this.dateSearch.endDtOptions.dt = this.getDatePlusDays(0);
            this.dateSearch.endDtOptions.time = this.getDatePlusDays(0);
            switch (day.toLowerCase()) {
                case 'today':
                    this.dateSearch.startDtOptions.dt = this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0);
                    this.dateSearch.startDtOptions.time = this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0);
                    break;
                case 'lastmonth':
                    this.dateSearch.startDtOptions.dt = this.getDateWithTime(this.getDatePlusDays(-30), 0, 0, 0, 0);
                    this.dateSearch.startDtOptions.time = this.getDateWithTime(this.getDatePlusDays(-30), 0, 0, 0, 0);
                    break;
                default :
                    break;
            }
            this.dateSearch.getProcessDataForDate();
        },
        search: () => {
            this.dateSearch.selectedDays = null;
            this.dateSearch.getProcessDataForDate();
        },
        clear: () => {
            this.dateSearch.resetDate();
            this.getProcessByState(this.status);
        },
        resetDate: () => {
            this.dateSearch.selectedDays = null;
            this.dateSearch.isDateFilter = false;
            this.dateSearch.startDtOptions.dt = this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0);
            this.dateSearch.startDtOptions.time = this.getDateWithTime(this.getDatePlusDays(0), 0, 0, 0, 0);
            this.dateSearch.endDtOptions.dt = this.getDatePlusDays(0);
            this.dateSearch.endDtOptions.time = this.getDatePlusDays(0);
        },
        getProcessDataForDate: () => {
            this.dateSearch.isDateFilter = true;
            this.getProcessByState(this.status);
        }
    };

    // search input/output data
    public generalSearch: any = {
        text : '',
        clearSearch: () => {
            this.generalSearch.text = '';
            this.getProcessByState(this.status);
        },
        keyup: (event) => {
            // enter to search
            if (event.keyCode === 13 || event.key.toLowerCase() === 'enter' || event.key.toLowerCase() === 'return') {
                this.getProcessByState(this.status);
            }
        }
    };
    public jobsDataCount: any = {
        completed : 0,
        cancelled : 0,
        faulted : 0
      };
    public columnObject: any = [
        {
            id: 'processinstanceid',
            columnName: 'Process Instance Id',
            isShow: true,
            isAscending: true,
            sortColumnName: 'processinstanceid',
            isUnSortable: false,
            isTimestamp: false
        },
        {
            id: 'processinstancestarttime',
            columnName: 'Start Time',
            isShow: false,
            isAscending: false,
            sortColumnName: 'processinstancestarttime',
            isUnSortable: true,
            isTimestamp: true
        },
        {
            id: 'processinstancedurationtime',
            columnName: 'Duration Time (ms)',
            isShow: true,
            isAscending: false,
            sortColumnName: 'processinstancedurationtime',
            isUnSortable: true,
            isTimestamp: false
        },
        {
            id: 'processinstanceevaltime',
            columnName: 'Eval Time (ms)',
            isShow: false,
            isAscending: false,
            sortColumnName: 'processinstanceevaltime',
            isUnSortable: true,
            isTimestamp: false
        },
        {
            id: 'processinstanceendtime',
            columnName: 'End Time',
            isShow: true,
            isAscending: false,
            sortColumnName: 'processinstanceendtime',
            isUnSortable: true,
            isTimestamp: true
        }
    ];
    constructor(private inputOutputFormatter: any,
        private $state: any,
        private $timeout: any,
        private monitorServices: any,
        private globalVariables: IGlobalVariables,
        private gridConfig: any,
        private monLabels: any,
        private $filter: any,
        private $scope: any,
        private $rootScope: any,
        private initSvgObject: any) {
        this.isAllProcessData = true;
        /*        this.monitorServices.getProcessData().then(res => {
        this.processData = res.data.data;
    });*/
        this.$scope.$on('activityInputOutput', (event, object) => {
            if (this.$state.current.name === 'applications.application.defaultDetails.instanceInfo') {
                this.selectActivityData(event, object);
            }
        });

        this.$scope.$on('processSelected', (event: any, svgObject: any): any => {
            this.svgObject = svgObject;
        });
        this.$scope.$on('domBodyClicked', (event: any, e: any) => {
            if (e.target.className && e.target.className.indexOf('column-toggle') > -1) {
                return;
            };
            this.columnstoggle  = false;
            this.$scope.$apply();
          });
        this.processInstanceHeader = this.gridConfig.grid.processInstance.columns;
        this.$scope.$on('selectedProcess', (event: any, obj: any): any => {
            this.toggleHide = false;
            this.isDiagram = false;
            this.isAllProcessData = typeof(obj.isAllProcessData) === 'undefined' ? true : obj.isAllProcessData;
            this.selectProcessObj = angular.copy(obj);
            this.selectedLowerTab = 'details';
            this.selectedUpperTab = 'diagram';
            this.isActivityClicked = false;
            this.isShowInputOutputData = false;
            this.activityInput = null;
            this.activityOutput = null;
            if (this.globalVariables.processTabViewType === 'instanceInfo' || this.globalVariables.selectedTabProcessDiagram === 'instanceTab') {
                if (!obj.doNotReload) {
                    // clear the filter values for job data
                    this.dateSearch.resetDate();
                    this.generalSearch.text = '';
                    this.status = null;
                    this.jobDetails = null;
                    this.selectedProcessInstanceId = '';
                    if (this.isAllProcessData || this.isAllProcessData === undefined) {
                        obj.processName = null;
                    }
                    this.monitorServices.processinstancecountByStatus(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
                        this.selectProcessObj.appVersion, obj.processName).then((response) => {
                        this.jobsDataCount.completed = this.formatNumber(response.data.COMPLETED, 1);
                        this.jobsDataCount.cancelled = this.formatNumber(response.data.CANCELLED, 1);
                        this.jobsDataCount.faulted = this.formatNumber(response.data.FAULTED, 1);
                    });
                    this.monitorServices.getProcessInstanceCount(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
                        this.selectProcessObj.appVersion, obj.processName, this.status,
                        this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
                        .then((response: any) => {
                            this.numberOfItems = +response.data.count;
                            this.numberOfPages = Math.ceil(this.numberOfItems / this.pageSize);
                            this.totalProcessInst = +response.data.count;
                            this.currentPage = 1;
                            this.offset = (this.currentPage - 1) * this.pageSize;
                            if (this.totalProcessInst > 0) {
                                this.monitorServices.getProcessInstance(obj.nodeId, obj.appName,
                                    obj.appVersion, obj.processName, this.offset, this.pageSize, this.status, this.sortBy, this.sortOrder,
                                    this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
                                    .then((response1: any) => {
                                        this.processInstanceList = response1.data;
                                        this.createProcessInstanceHeaderData();
                                        this.pager = this.GetPager();
                                    });
                            } else {
                                this.processInstanceList = [];
                            }
                        });

                }
                // });
            }
        });

        this.$scope.currentPage = 1;
        this.$scope.pageSize = 30;
        // this.$scope.totalProcessInst = 0;
        this.$scope.currentPage_activity = 1;
        this.$scope.pageSize_activity = 10;
        this.$scope.totalActivityInst = 0;

        this.$scope.$on('changeCurrentPageNumber', (event: any, data: any): any => {
            this.jobDetails = null;
            this.selectedLowerTab = 'details';
            this.selectedUpperTab = 'diagram';
            this.isActivityClicked = false;
            this.isShowInputOutputData = false;
            this.selectedProcessInstanceId = '';
            this.selectedActivityName = '';
            this.activityInput = null;
            this.activityOutput = null;
            if (data) {
                if (data.id === 'mealsPagination') {
                    // this.$scope.currentPage = data.value;
                    if (this.$scope.showDiagram) {
                        // this.$scope.getProcessInstHistoryCount();

                    } else {
                        // this.$scope.getProcessInstHistoryAll(null, null);
                    }
                    this.setPage(+data.value);
                } else if (data.id === 'mealsPagination_activity') {
                    this.$scope.currentPage_activity = data.value;
                    this.$scope.getActivityInstHistoryCount(this.$scope.selectProcessInstanceId_history, this.$scope.selectProcessInstance_history,
                        this.$scope.selectProcessInstanceUID);
                }
            }


        });
        this.$scope.pageChanged = false;
        // this.$scope.$on('changePageSize', (event: any, data: any): any => {
        //     // event.stopPropagation();
        //     if (data) {
        //         this.pageSize = data;
        //         this.pageSizeChange();
        //     }
        // });

        this.$rootScope.$on('callProcessActivity', (event: any, object: any): void => {
            if (this.jobDetails && this.activityInstanceList && this.activityInstanceList.activity) {
                this.activityInstanceList.activity.forEach((data: any): void => {
                    if (data.activityname === object.value) {
                        this.monitorServices.getSubProcesses(this.selectProcessObj.nodeId, this.jobDetails.applicationname,
                            this.jobDetails.applicationversion, this.jobDetails.processname, this.jobDetails.processinstanceid,
                            this.jobDetails.processinstancestarttime, this.jobDetails.processinstanceendtime).then((response: any) => {
                            this.jobDetails.subItem = response.data;
                            response.data.forEach((innerData: any): void => {
                                if (data.activityexecutionid === innerData.activityexecutionid) {
                                    this.jobDetails.isComponentCollapsed = true;
                                    this.selectRow(null, innerData);
                                    this.getActivityInstance(innerData);
                                }
                            });
                        });
                    }

                });
            }
        });
    }
    // d1 date ddmmyy and d2 hhmmss
    public getMergedDates(d1: Date, d2: Date): Date {
        let retDate: Date = new Date();
        if (d1 && d2) {
            retDate.setFullYear(d1.getFullYear());
            retDate.setMonth(d1.getMonth());
            retDate.setDate(d1.getDate());
            retDate.setHours(d2.getHours());
            retDate.setMinutes(d2.getMinutes());
            retDate.setSeconds(d2.getSeconds());
            return retDate;
        }
        return null;
    }
    public getDatePlusDays(days: number): Date {
        let dt: Date = new Date();
        dt.setDate(dt.getDate() + days);
        return dt;
    }

    // sets the time hh mm ss ms
    public getDateWithTime(d: Date, hh: number, mm: number, ss: number, ms: number): Date {
        d.setHours(hh, mm, ss, ms);
        return d;
    }

    public formatNumber(noToFormat: number, noOfDecimals: number): string {
        let converts: any = [
          { val: 1, suffix: '' },
          { val: 1E3, suffix: 'K' },
          { val: 1E6, suffix: 'M' },
          { val: 1E9, suffix: 'G' },
          { val: 1E12, suffix: 'T' },
          { val: 1E15, suffix: 'P' },
          { val: 1E18, suffix: 'E' }
        ];
        let rx: RegExp = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let i: number;
        for (i = converts.length - 1; i > 0; i--) {
          if (noToFormat >= converts[i].val) {
            break;
          }
        }
        return (noToFormat / converts[i].val).toFixed(noOfDecimals).replace(rx, '$1') + converts[i].suffix;
      }

    public selectActivityData(event: any, object: any): void {
        // reset config/input/output tabs
        this.activityInput = [];
        this.activityOutput = [];
        this.selectedActivityConfData = '';
        this.$rootScope.$broadcast('selectNode', object.selectedActivity);
        this.selectedActivityName = object.selectedActivity;
        if (this.selectedLowerTab === 'details') {
            this.selectedLowerTab = 'configuration';
        }
        this.isActivityClicked = true;
        this.isShowInputOutputData = true;
        let activityData: any = this.$filter('filter')(this.activityInstanceList.activity, { activityname: object.selectedActivity }, true);
        if (activityData && activityData.length > 0) {
            this.activityInput = JSON.parse(activityData[0].activityinput);
            this.activityOutput = JSON.parse(activityData[0].activityoutput);
        } else {
            this.activityInput = [];
            this.activityOutput = [];
        }
        try {
            this.updateConfigForActivity(object.selectedActivity);
        } catch (error) {
            console.log('There was an error while updating config for activity: ', error);
        }
    }
    public sliderClicked(): void {
        this.toggleHide = !this.toggleHide;
        if (this.toggleHide) {
            this.isDiagram = true;
            this.diagramView = 'col-lg-12 col-md-12 col-sm-12 col-xs-12';
        } else {
            this.diagramView = 'col-lg-6 col-md-6 col-sm-6 col-xs-6';
            this.isDiagram = false;

        }
    }


    public selectRow(event: any, item: any): void {
        if (event) {
            event.stopPropagation();
        }
        this.isAllProcessData = false;
        this.diagramView = 'col-lg-6';
        this.$scope.$emit('handleProcessSelection', { processName: item.processname, isAllProcessData: this.isAllProcessData, doNotReload: true });
        this.jobDetails = item;
        this.selectedLowerTab = 'details';
        this.isShowInputOutputData = false;
        this.isActivityClicked = false;
        this.selectedProcessInstanceId = item.processinstanceid;
        this.selectedActivityName = '';

        // this.selectedLowerTab = 'input';
        // this.isShowInputOutputData = true;
        // this.isActivityClicked = true;
        this.getActivityInstance(item);
    }
    public dateFormat12(date: any): any {
        var arr: any = date.split('T');
        var time: any = arr[1].split('.');
        var dates: any = arr[0].split('-');
        return `${dates[1]}/${dates[2]}/${dates[0]} ${time[0]}`;
    }
    public dateFormat(dateF: string): string {
        return this.moment(+dateF).format('MM/DD/YYYY HH:mm:ss');
    };
    public sortOnJobStatus(status: string): void {
        this.jobDetails = null;
        this.selectedLowerTab = 'details';
        this.selectedUpperTab = 'diagram';
        this.isActivityClicked = false;
        this.isShowInputOutputData = false;
        this.selectedProcessInstanceId = '';
        this.selectedActivityName = '';
        this.activityInput = null;
        this.activityOutput = null;
        if (this.status === status) {
            status = null;
        }
        this.getProcessByState(status);
        // this.processData.filter(process => process.processinstancestate === status);
    }

    public columnSelect(): void {
        var count: number = 0;
        this.columnObject.forEach(function (column: any): void {
            if (column.isShow) {
                count++;
            }
        });
        this.selectedColumnCount = count;
    };
    public createProcessInstanceHeaderData(): void {
        this.processInstanceData = [];
        for (var i: number = 0; i < this.processInstanceList.length; i++) {
            var obj: any = {};
            for (var j: number = 0; j < this.processInstanceHeader.length; j++) {
                obj[this.processInstanceHeader[j].property] = this.processInstanceList[i][this.processInstanceHeader[j].property];
            }
            this.processInstanceData.push(obj);
        }
    }

    public checkButtonExists(name: string): number {
        if (this.processInstanceStatesButton.length === 0) {
            return -1;
        } else {
            for (var i: number = 0; i < this.processInstanceStatesButton.length; i++) {
                if (this.processInstanceStatesButton[i].defaultName === name) {
                    return i;
                }
            }
            return -1;
        }
    }

    public formatTotalProcessNumber(data: any): void {
        this.processInstanceStatesButton = [];
        var totalNumber: number = 0;
        for (var i: number = 0; i < data.length; i++) {
            var index: number = this.checkButtonExists(data[i].processinstancestate);
            if (index === -1) {
                var obj: any = {
                    defaultName: data[i].processinstancestate,
                    name: data[i].processinstancestate.toLowerCase(),
                    val: 1,
                    cls: ''
                };
                if (data[i].processinstancestate === 'COMPLETED') {
                    obj.cls = 'success';
                } else if (data[i].processinstancestate === 'FAULTED') {
                    obj.cls = 'danger';
                } else if (data[i].processinstancestate === 'STARTED') {
                    obj.cls = 'primary';
                } else if (data[i].processinstancestate === 'CANCELLED') {
                    obj.cls = 'warning';
                } else {
                    obj.cls = 'default';
                }
                this.processInstanceStatesButton.push(obj);
            } else {
                this.processInstanceStatesButton[index].val++;
            }
            totalNumber++;
        }
        this.numberOfItems = totalNumber;
        this.numberOfPages = Math.ceil(this.numberOfItems / this.pageSize);
        var all: any = {
            defaultName: 'ALL',
            name: 'all',
            cls: 'default',
            val: totalNumber
        };
        if (this.checkButtonExists(all.defaultName) === -1) {
            this.processInstanceStatesButton.push(all);
        }
    }
    public sortColumnData(column: any): void {
        this.columnObject.forEach(function (data: any): void {
            data.isUnSortable = true;
        });
        let processName: string = null;
        if (!(this.isAllProcessData || this.isAllProcessData === undefined)) {
            processName = this.selectProcessObj.processName;
        }
        column.isUnSortable = false;
        column.isAscending = !column.isAscending;
        this.sortBy = column.sortColumnName;
        this.sortOrder = column.isAscending ? 'asc' : 'desc';
        column.sortVal = this.sortOrder;
        this.currentPage = 1;
        this.offset = (this.currentPage - 1) * this.pageSize;
        this.monitorServices.getProcessInstance(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
            this.selectProcessObj.appVersion, processName, this.offset, this.pageSize, this.status, this.sortBy, this.sortOrder,
            this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
            .then((response: any) => {
                this.processInstanceList = response.data;
                this.createProcessInstanceHeaderData();
            });
    }

    public isVisibleColumn(key: string): boolean {
        for (var i: number = 0; i < this.processInstanceHeader.length; i++) {
            if (this.processInstanceHeader[i].property === key) {
                return true;
            }
        }
        return false;
    }

    public pageSizeChange(): void {
        this.$rootScope.$broadcast('selectNode', null);
        if (this.pageSize !== undefined && this.pageSize !== null) {
            let processName: string = null;
            if (!(this.isAllProcessData || this.isAllProcessData === undefined)) {
                processName = this.selectProcessObj.processName;
            }
            this.currentPage = 1;
            this.offset = (this.currentPage - 1) * this.pageSize;
            this.monitorServices.getProcessInstance(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
                this.selectProcessObj.appVersion, processName,
                this.offset, this.pageSize, this.status, this.sortBy, this.sortOrder,
                this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
                .then((response: any) => {
                    this.processInstanceList = response.data;
                    this.currentPage = 1;
                    this.numberOfPages = Math.ceil(this.numberOfItems / this.pageSize);
                    this.pager = this.GetPager();
                    this.createProcessInstanceHeaderData();
                });
        }
    }

    public getProcessByState(status: string): void {
        this.$rootScope.$broadcast('selectNode', null);
        var index: number = this.checkButtonExists(status);
        if (index !== -1) {
            this.numberOfItems = this.processInstanceStatesButton[index].val;
            this.numberOfPages = Math.ceil(this.numberOfItems / this.pageSize);
            this.pager = this.GetPager();
        }
        if (status === 'ALL') {
            status = null;
        }
        this.status = status;

        let processName: string = null;
        if (!(this.isAllProcessData || this.isAllProcessData === undefined)) {
            processName = this.selectProcessObj.processName;
        }
        this.monitorServices.getProcessInstanceCount(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
            this.selectProcessObj.appVersion, processName, this.status,
            this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
            .then((response: any) => {
                this.numberOfItems = +response.data.count;
                this.numberOfPages = Math.ceil(this.numberOfItems / this.pageSize);
                this.totalProcessInst = +response.data.count;
                this.currentPage = 1;
                this.offset = (this.currentPage - 1) * this.pageSize;
                if (this.totalProcessInst > 0) {
                    this.monitorServices.getProcessInstance(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
                        this.selectProcessObj.appVersion, processName, this.offset, this.pageSize, status, this.sortBy, this.sortOrder,
                        this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text)
                        .then((resp: any) => {
                            this.processInstanceList = resp.data;
                            this.createProcessInstanceHeaderData();
                        });
                } else {
                    this.processInstanceList = [];
                }
            });
    }

    public search = (searchText: string): any => {
        return (value: string): boolean => {
            if (searchText === '') {
                return true;
            }
            searchText = searchText.toLowerCase();
            var retValue: boolean = false;
            this.columnObject.forEach((column) => {
                if (column.isShow &&
                    value[column.id] &&
                    (column.isTimestamp ?
                        this.dateFormat(value[column.id]).toString().toLowerCase().indexOf(searchText) !== -1 :
                        value[column.id].toString().toLowerCase().indexOf(searchText) !== -1)) {
                    retValue = true;
                    return;
                };
            });
            return retValue;
        };
    }

    public setPage(page: number): void {
        if (page < 1 || page > this.numberOfPages) {
            return;
        }
        let processName: string = null;
        if (!(this.isAllProcessData || this.isAllProcessData === undefined)) {
            processName = this.selectProcessObj.processName;
        }
        this.currentPage = page;
        // change the offset value
        this.offset = (this.currentPage - 1) * this.pageSize;
        this.pager = this.GetPager();
        this.monitorServices.getProcessInstance(this.selectProcessObj.nodeId, this.selectProcessObj.appName,
            this.selectProcessObj.appVersion, processName,
            this.offset, this.pageSize, this.status, this.sortBy, this.sortOrder,
            this.dateSearch.getStartDateMills(), this.dateSearch.getEndDateMills(), this.generalSearch.text).then((response: any) => {
                this.processInstanceList = response.data;
                this.createProcessInstanceHeaderData();
            });
    }
    public GetPager(): any {
        // default to first page
        this.currentPage = this.currentPage || 1;

        // default page size is 10
        this.pageSize = this.pageSize || 10;

        // calculate total pages
        var totalPages: number = Math.ceil(this.numberOfItems / this.pageSize);

        var startPage: number, endPage: number;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (this.currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (this.currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = this.currentPage - 5;
                endPage = this.currentPage + 4;
            }
        }

        // calculate start and end item indexes
        var startIndex: number = (this.currentPage - 1) * this.pageSize;
        var endIndex: number = Math.min(startIndex + this.pageSize - 1, this.numberOfItems - 1);

        // create an array of pages to ng-repeat in the pager control
        var pages: any = [];
        var j: number = 0;
        for (var i: number = startPage; i < endPage + 1; i++) {
            pages[j] = i;
            j++;
        }
        // var pages = _.range(startPage, endPage + 1);

        // return object with all pager properties required by the view
        return {
            totalItems: this.numberOfItems,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    public createActivityInstanceHeaderData(): void {
        this.activityInstanceData = [];
        for (var i: number = 0; i < this.activityInstanceList.activity.length; i++) {
            var obj: any = {};
            for (var j: number = 0; j < this.activityInstanceHeader.length; j++) {
                obj[this.activityInstanceHeader[j].property] = this.activityInstanceList.activity[i][this.activityInstanceHeader[j].property];
            }
            this.activityInstanceData.push(obj);
        }
    }
    public selectUpperTab(selectedTab: string): void {
        this.selectedUpperTab = selectedTab;
    };
    public selectLowerTab(selectedTab: string): void {
        this.selectedLowerTab = selectedTab;
    };
    public getActivityInstance(row: any): void {
        this.activityInstanceData = [];
        var modalData: any = {
            nodeId: this.selectProcessObj.nodeId,
            appName: this.selectProcessObj.appName,
            appVersion: this.selectProcessObj.appVersion,
            processName: row.processname,
            processinstanceId: row.processinstanceid,
            processstarttime: row.processinstancestarttime,
            processendtime: row.processinstanceendtime
        };
        this.activityInstanceHeader = this.gridConfig.grid.activityInstance.columns;
        if (modalData.processinstanceId) {
            this.monitorServices.getActivityInstance(modalData.nodeId, modalData.appName,
                modalData.appVersion, modalData.processName, modalData.processinstanceId,
                modalData.processstarttime, modalData.processendtime).then((response: any) => {
                    this.activityInstanceList = response.data;
                    this.createActivityInstanceHeaderData();
                });
        }
    };
    public getSubProcesses(parentProcessDetails: any): void {
        this.monitorServices.getSubProcesses(this.selectProcessObj.nodeId, parentProcessDetails.applicationname,
            parentProcessDetails.applicationversion, parentProcessDetails.processname, parentProcessDetails.processinstanceid,
            parentProcessDetails.processinstancestarttime, parentProcessDetails.processinstanceendtime).then((response: any) => {
            parentProcessDetails.subItem = response.data;
        });

    };
    public dataToggle(event: any, row: any): void {
        var tempStatus: boolean = row.isComponentCollapsed;
        event.stopPropagation();
        row.isComponentCollapsed = !tempStatus;
    }
    private updateConfigForActivity(activityName: string): void {
        var xmlDom: any = this.inputOutputFormatter.parseXml(this.svgObject);
        var activityDir: any = xmlDom.getElementsByTagName('activity-dir');
        var arr: any = Array.prototype.slice.call(activityDir);
        for (var index in arr) {
            var json: any = this.inputOutputFormatter.xmlToJson(arr[index], null);
            var res: any = json.replace('null', '');
            var obj: any = JSON.parse(res);
            var name: string = 'name';
            if (obj && obj['activity-dir'] && obj['activity-dir'][name] && obj['activity-dir'][name] === activityName) {
                this.selectedActivityConfData = obj['activity-dir'];
                // this.selectedLowerTab = 'configuration';
                // this.isActivityClicked = true;
                break;
            }
        }
    };
}