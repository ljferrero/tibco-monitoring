/**
 * Created by bmane on 2/15/2017.
 */
import * as angular from 'angular';
export class GridComponent implements ng.IComponentOptions {
    public controller: any = GridController;
    public template: string = require('../partials/monitor-grid.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            gridHeader: '<',
            routeStateObject: '<',
            gridDataMap: '<',
            filterDataLength: '=',
            gridDataToBeRemoved: '=',
            treeView: '<'
        };
    }
}
export class GridController {
    public static $inject: any = ['$timeout', 'monLabels', '$state', '$window',  '$uibModal'];
    public gridHeader: any;
    public gridDataMap: any;
    public filterData: any;
    public routeStateObject: any;
    public filterDataLength: number;
    public sortColumn: string;
    public gridHeaderCheckBox: boolean = false;
    public searchText: string = '';
    public gridDataToBeRemoved: any;
    public columnOrder: Array<string> = [''];
    public filterFocus: boolean = false;
    public hasCheckBoxColumn: boolean = false;
    public treeView: boolean;
    public hideTableBody: boolean = false;
    public search: any = (function (value: any, index: any): any {
        if (this.searchText === '') {
            return true;
        }
        this.searchText = this.searchText.toLowerCase();
        let retValue: boolean = false;
        this.gridHeader.forEach((column: any): any => {
            if (column.isVisible && column.isSearchable && value[column.id]
                && value[column.id].toString().toLowerCase().indexOf(this.searchText) !== -1) {
                retValue = true;
                return;
            }
        });
        return retValue;
    }).bind(this);

    public openNewTab(url: string): void {
        this.$window.open(url);
    }


    public upload(key: any): any {
        var modalInstance: any = this.uibModal.open({
            component: 'uploadFileModal',
            size: 'md',
            resolve: {
                items: (): any => {
                    return key.nodeId;
                }
            }
        });
        modalInstance.result.then((details: any): any => {
        }
            , (error: any) => {
            });

    }
    public downloadFile(node_id: any): any {
        window.location.href = `http://localhost:8080/api/v1/appnodes/${node_id}/logBack`;
    }
    public setColumnOrder: any = function (): any {
        this.gridHeader.sort(function (a: any, b: any): any {
            return a.order - b.order;
        });
        this.columnOrder = [];
        this.gridHeader.forEach((data: any) => {
            if (data.isVisible && data.id !== 'checkBox') {
                this.columnOrder.push(data.id);
            }
        });
    };
    constructor(private $timeout: ng.ITimeoutService, private monLabels: any, private $state: any, private $window: ng.IWindowService,
        private uibModal: any) {
        angular.forEach(this.gridHeader, header => {
            if (header.isDefaultSortable) {
                this.sortColumn = header.id;
            }
        });
        this.setColumnOrder();
    }

    public setFilterDataLength(): void {
        this.$timeout((): void => {
            if (this.filterDataLength !== undefined) {
                this.filterDataLength = this.filterData.length;
            }
        }, 0);
    }

    public getSortClass(index: number): string {
        var sortClass: string = 'bw_icons_s-sort-none';
        if (this.gridHeader[index].isSortable && this.gridHeader[index].isDefaultSortable) {
            if (this.gridHeader[index].sort === undefined) {
                this.gridHeader[index].sort = 'asc';
                sortClass = 'bw_icons_s-sort-asc';
            } else {
                if (this.gridHeader[index].sort === 'asc') {
                    sortClass = 'bw_icons_s-sort-asc';
                } else {
                    sortClass = 'bw_icons_s-sort-desc';
                }
            }
        }
        return sortClass;
    }

    public columnOrderBy(index: number): void {
        if (this.gridHeader[index].isSortable) {
            if (this.gridHeader[index].sort === 'asc') {
                this.gridHeader[index].sort = 'desc';
                this.sortColumn = '-' + this.gridHeader[index].id;
            } else {
                this.gridHeader[index].sort = 'asc';
                this.sortColumn = this.gridHeader[index].id;
            }
            angular.forEach(this.gridHeader, header => {
                header.isDefaultSortable = false;
            });
            this.gridHeader[index].isDefaultSortable = true;
        }
    }

    public onGridHeaderCheckBoxClick(): void {
        this.gridDataToBeRemoved = [];
        this.gridDataMap.forEach((value, key) => {
            value.isChecked = this.gridHeaderCheckBox;
        });
        this.gridDataMap.forEach((value, key) => {
            if (value.isChecked) {
                this.gridDataToBeRemoved.push(key);
            }
        });
    }

    public onGridRowCheckBoxClick(): void {
        this.gridDataToBeRemoved = [];
        var count: number = 0;
        this.gridDataMap.forEach((value, key) => {
            if (value.isChecked) {
                this.gridDataToBeRemoved.push(key);
                count++;
            }
        });
        this.gridHeaderCheckBox = (count === this.gridDataMap.size);
    }
    public mouseOverColumn(index: number): void {
        this.gridHeader[index].hover = true;
    }

    public mouseLeaveColumn(index: number): void {
        this.gridHeader[index].hover = false;
    }

    public getAppNodeId(val: any): void {
        this.$state.nodeId = val.id;
    }

    public resetFilter(): void {
        this.searchText = '';
        this.setFilterDataLength();
    }
}