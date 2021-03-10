/**
 * Created by atin  on 2/6/2017.
 */
export class UploadFileModalComponent implements ng.IComponentOptions {
    public controller: any = UploadFileModalController;
    public template: any = require('../partials/upload-file-modal.html');
    public bindings: any;
    constructor() {
        this.bindings = {
            resolve: '<',
            close: '&',
            dismiss: '&'
        };
    }
}
export class UploadFileModalController {
    public static $inject: any = ['MonitorServices', '$timeout', '$element', '$scope'];
    public host: string;
    public port: any;
    public detaill: any;
    public close: any;
    public uploadFiles: any = [];
    public uploadItems: any = [];
    public dismiss: any;
    public endpoints: any = {
        appNodes: '/api/v1/appnodes',
        applications: '/api/v1/applications',
        platformDetails: '/api/v1/appnodes/platformDetails',
        uploadFile: 'api/v1/appnodes/uploadlogBack'
    };
    public holder: any = {};
    public cancelUploadingFlag: any;
    public obj: any = {};
    public appNodeDetails: any = {};
    public details: any;
    public step: any;
    public hideCancel: any;
    public logbackFileFlag: boolean;

    public nodeIdArray: any;
    constructor(public monitorServices: any, private timeout: any, private element: any,
        private scope: any) {
        var $ctrl: any = this;
        this.nodeIdArray = $ctrl.resolve.items;
        this.init(element);
        var self: any = {};
        self = this;
        this.scope.$on('fileChanged', function (event: any, args: any): any {
            self.fileSelected(args, self);
        });
        element[0].ondragover = function (event: any): any {
            event.preventDefault();
            self.dragOver(event);
        };
        element[0].ondragleave = function (event: any): any {
            self.dragLeave(event);
            event.preventDefault();
        };
        element[0].ondrop = function (event: any): any {
            event.preventDefault();
            self.fileDropped(event.dataTransfer.files);
        };
    }
    public showTheErrorMessage(form: any, property: any): void {
        form[property].showMessage = true;
    }
    public hideTheErrorMessage(form: any, property: any): void {
        form[property].showMessage = false;
    }
    public cancel(): void {
        this.dismiss({ $value: 'cancel' });
    };
    public getFileSize(file: any): any {
        if (file.size > 1024 * 1024) {
            return (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        } else {
            return (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
        }
    };
    public dragOver(files: any): void {
        this.holder.dragOver = true;
        this.scope.$apply();
    };

    public dragLeave(files: any): void {
        this.holder.dragOver = false;
        this.scope.$apply();
    };
    public showChooseFilesPage(): void {
        this.step = 1;
        var fileInputSelector: any = '.appnodes_upload_input';
        this.element.find(fileInputSelector).val('');
    }
    public showFilesInfoPage(): void {
        this.step = 2;
    }
    public showUploadingPage(): void {
        this.step = 3;
    }
    public showUploadedPage(): void {
        this.step = 4;
    };
    public cancelUpload(): void {
        this.cancelUploadingFlag = true;
        this.dismiss({ $value: 'cancel' });
    };
    public removeFile(index: any): any {
        this.uploadItems.splice(0);
        this.uploadFiles.splice(0);
        this.logbackFileFlag = false;
        if (this.uploadFiles.length === 0) {
            this.showChooseFilesPage();
        }
    };
    public chooseEarFile(): void {
        this.logbackFileFlag = true;
    }
    public uploadProgress(e: any): void {
        if (e.lengthComputable) {
        }
    }
    public uploadComplete(e: any): void {
        var fd: any = new FormData();
        var files: any = this.uploadFiles;
        var i: number;
        for (i = 0; i < files.length; i++) {
            fd.append('file', files[i]);
        }
        var fr: any = new FileReader();
        // this.deployOne(fd);
         fr.readAsBinaryString(this.uploadFiles[0]);
        var self: any = this;
        fr.onload = function (evt: any): any {
            var a: any = evt.target;



            self.deployOne(a.result);
        };
    };
    public uploadDeploy(fd: any): void {
        this.deployOne(fd);
    };
    public deployOne(fd: any): any {
        /*
              var xhr = new XMLHttpRequest();
              xhr.addEventListener("load", (data: any)=>{
                  this.uploadItems[0].success = true;
                  this.hideCancel = true;
                  this.showUploadedPage();
              }, false);
              xhr.addEventListener("error", (error: any)=>{
                  this.uploadItems[0].error = true;
                  this.uploadItems[0].errorMsg = error.details || error.message;
              }, false);
              
              xhr.open("PUT", `api/v1/appnodes/${this.nodeIdArray}/logBackUpload`);
      
              xhr.send(fd);
      
      
              */


        this.monitorServices.uploadFile(fd, this.nodeIdArray).then((data: any) => {
            this.uploadItems[0].success = true;
            this.hideCancel = true;
            this.showUploadedPage();
            //  this.close({});
            //    callback(data);
        }, (error): any => {
            this.uploadItems[0].error = true;
            this.uploadItems[0].errorMsg = error.details || error.message;

            //  callback(error);
            // this.dismiss({ $value: 'cancel' });
            //  globalHandlers.popupErrorMessage(error,scope);
        });
    };
    public uploadError(e: any): void {
        this.uploadItems.forEach(function (item: any): any {
            this.uploadItems[0].error = true;
            //  item.errorMsg = $filter('i18n')('label_appnodes_upload_error');
        });
        this.showUploadedPage();
    }
    public fileDropped(files: any): void {
        if (files.length <= 1) {
            this.holder.dragOver = false;
            this.uploadFiles.splice(0);
            this.uploadItems.splice(0);
            var i: number = 0;
            for (i = 0; i < files.length; i++) {
                if (files.length > 1) {
                } else {
                    this.uploadFiles.push(files[i]);
                    this.uploadItems.push({ name: files[i].name, size: this.getFileSize(files[i]) });
                }
            }
            this.showFilesInfoPage();
            this.scope.$apply();
        }
    };
    public fileSelected(fileInput: any, self: any): void {
        var files: any = fileInput.formData;
        if (files.length === 0) { return; }
        this.uploadFiles.splice(0);
        this.uploadItems.splice(0);
        var i: number = 0;
        for (i = 0; i < files.length; i++) {
            var file: any = files[i];
            this.uploadFiles.push(file);
            this.uploadItems.push({ name: file.name, size: this.getFileSize(file) });
        }
        this.showFilesInfoPage();
        this.scope.$apply();
    };
    public done(): void {
        this.close({});
    };

    public deleteFile(index: any): void {
        var checkEmpty: any = function (): any {
            if (this.uploadItems.length === 0) {
                this.showChooseFilesPage();
            }
        };

        if (this.uploadItems[index].error) {
            this.uploadItems.splice(index, 1);
            checkEmpty();
            return;
        }
        this.uploadItems[index].deleting = true;
        this.uploadItems[index].success = false;
        this.monitorServices.deleteFile().then(() => {
            this.uploadItems.splice(index, 1);
            checkEmpty();
        }, function (data: any): any {
            console.error(data);
        });

    };

    public setSlash(element: any): void {
        element.addClass('input-slash');
    };
    public init($dom: any): void {
        this.holder = {
            path: {},
            dragOver: false,
            needReplace: false
        };
        this.uploadFiles = [];
        this.uploadItems = [];
        this.showChooseFilesPage();
    };
}
