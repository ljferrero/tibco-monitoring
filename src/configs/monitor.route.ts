/**
 * Created by Srikanta Dutta on 2/1/2017.
 */
import {IGlobalVariables} from '../interfaces/IGlobalVariables';
config.$inject =
    ['$provide',
    '$httpProvider',
    '$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider'];

export function config(
    $provide: any,
    $httpProvider: any,
    $stateProvider: ng.ui.IStateProvider,
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $locationProvider: ng.ILocationProvider,
    $urlMatcherFactoryProvider: ng.ui.IUrlMatcherFactory): void {
    $provide.factory('HttpInterceptorForSpinner',
        ['$injector', '$q', 'globalVariables',
        ($injector: any, $q: ng.IQService, globalVariables: IGlobalVariables): any => {
        return {
            request: (config: any): any => {
                globalVariables.showSpinner = true;
                globalVariables.isGetOperation = config.method === 'GET' ? true : false;
                return config || $q.when(config);
            },
            requestError: (rejection: any): any => {
                globalVariables.showSpinner = true;
                globalVariables.isGetOperation = rejection.method === 'GET' ? true : false;
                return $q.reject(rejection);
            },
            response: (response: any): any => {
                var $http: ng.IHttpService = $http || $injector.get('$http');
                if ($http.pendingRequests.length === 0) {
                    globalVariables.showSpinner = false;
                }
                return response || $q.when(response);
            },
            responseError: (rejection: any): any => {
                var $http: ng.IHttpService = $http || $injector.get('$http');
                if ($http.pendingRequests && $http.pendingRequests.length === 0) {
                    globalVariables.showSpinner = false;
                }
                return $q.reject(rejection);
            }
        };
    }]);
    $httpProvider.interceptors.push('HttpInterceptorForSpinner');
    $locationProvider.html5Mode(true);
    $urlMatcherFactoryProvider.caseInsensitive(true);
    var token: any = window.location.href.split('?')[1];
    if (token) {
        localStorage.setItem('token', token);
    }
    if (!localStorage.getItem('token')) {
        $urlRouterProvider.otherwise('/login');
    } else {
        $urlRouterProvider.otherwise('/applications/default');
    }
        $stateProvider
        .state('login', <ng.ui.IState> {
            url: '/login',
            template: '<monitor-dashboard></monitor-dashboard>'
        })
        .state('appnodes', <ng.ui.IState> {
            url: '/appnodes/:viewType',
            views: {
                default: {
                    template: `<appnode-grid-level1></appnode-grid-level1>`
                },
                graph: {
                    template: `<appnode-graph-level1></appnode-graph-level1>`
                }
            }
        })
        .state('appnodes.appnode', <ng.ui.IState> {
            url: '/:nodeName',
            views: {
                default: {
                    template: `<appnode-grid-level2></appnode-grid-level2>`
                },
                graph: {
                    template: `<appnode-grid-level2></appnode-grid-level2>`
                }
            }
        })
        .state('appnodes.appnodeapp', <ng.ui.IState> {
            url: '/:nodeName/:applicationName',
            views: {
                default: {
                    template: `<appnode-application-grid-level2></appnode-application-grid-level2>`
                },
                graph: {
                    template: `level1 graph`
                }
            }
        })
        .state('applications', <ng.ui.IState> {
            url: '/applications/:viewType?space',
            views: {
                default: {
                    template: `<application-grid-level1></application-grid-level1>`
                },
                graph: {
                    template: `<application-graph-level1></application-graph-level1>`
                },
                config: {
                    template: `<application-config-grid-level2></application-config-grid-level2>`
                }
            }
        })
        .state('applications.application', <ng.ui.IState> {
            url: '/:applicationName/:version',
            abstract: true,
            views: {
                default: {
                    template: `<application-grid-level2></application-grid-level2>`
                },
                graph: {
                    template: `<div> Level2 graph view for Applications</div>`
                },
                config: {
                    template: `<configure-grid-level2></configure-grid-level2>`
                }
            }
        })
        .state('applications.application.defaultDetails', <ng.ui.IState> {
            url: '/:currentAppTab',
            views: {
                appInstances: {
                    template: `<app-instance-grid-level2></app-instance-grid-level2>`
                },
                // appNodes: {
                //     template: `<div>AppNodes default view</div>`
                // },
                endPoints: {
                    template: `<end-point-grid-level2></end-point-grid-level2>`
                },
                // components: {
                //     template: `<app-component-grid-level2></app-component-grid-level2>`
                // },
                processes: {
                    template: `<process-grid-level2></process-grid-level2>`
                }
            }
        })
        .state('applications.application.defaultDetails.processInfo', <ng.ui.IState> {
            url: '/processInfo/:containerName/:processName',
            template: `<app-process-diagram></app-process-diagram>`
        })
        .state('applications.application.defaultDetails.activityInfo', <ng.ui.IState> {
            url: '/activityInfo/:containerName/:processName',
            template: `<app-process-diagram></app-process-diagram>`
        })
        .state('applications.application.defaultDetails.instanceInfo', <ng.ui.IState> {
            url: '/instanceInfo/:containerName/:processName',
            template: `<app-process-diagram></app-process-diagram>`
        })
        // .state('applications.application.defaultDetails.instanceInfo.general', <ng.ui.IState> {
        //     url: '/instanceInfo/:containerName/:processName/:currentView',
        //     template: `<app-process-diagram></app-process-diagram>`
        // })
        // .state('applications.application.defaultDetails.instanceInfo.report', <ng.ui.IState> {
        //     url: '/instanceInfo/:containerName/:processName/:currentView',
        //     template: `<div>Report View</div>`
        // })
        .state('applications.application.defaultDetails.processDiagram', <ng.ui.IState> {
            url: '/processDiagram/:containerName/:processName',
            template: `<app-process-diagram></app-process-diagram>`
        })



        .state('applications.application.graphDetails', <ng.ui.IState> {
            url: '/:currentAppTab',
            views: {
                appInstances: {
                    template: `<div>App Instance graph view</div>`
                },
                appNodes: {
                    template: `<div>AppNodes graph view</div>`
                },
                processes: {
                    template: `<div>processes graph view</div>`
                }
            }
        })
        .state('applications.application.configDetails', <ng.ui.IState> {
                url: '/appInstances/:containerName/:configView',
                views: {
                    appInstances: {
                        template: `<div>App Instance config view</div>`
                    }
                }
        });
    $locationProvider.html5Mode({enabled: true, requireBase: false});
}