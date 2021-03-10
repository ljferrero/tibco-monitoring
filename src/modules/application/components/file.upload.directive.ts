
angular.module('monitor.application').directive('fileDirective', ['$rootScope', '$timeout', function ($rootScope: any,
    $timeout: any): any {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope: any, element: any, attr: any): any {
            element.bind('change', function (): any {
                var formData: any = element[0].files[0];
                var fileData: any = [];
                fileData.push(formData);
                $rootScope.$broadcast('fileChanged', { formData: fileData });
            });
        }
    };
}]);    