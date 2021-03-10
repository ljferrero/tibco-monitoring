
var DEFAULT_ID: string = '__default';

interface IPaginationDirectiveScope extends ng.IScope {
    changeTab: any; // replace any with actual type
    paginationId: any;
    maxSize: any;
    directionLinks: any;
    boundaryLinks: any;
    isShortPagination: any;
    pages: any;
    pagination: any;
    range: any;
    inputPagination: any;
    setCurrent: any;
    onPageChange: any;
  }
angular.module('monitor.application').directive('dirPaginate', ['$compile', '$parse', '$timeout', 'paginationService',
function ($compile: any, $parse: any, $timeout: any, paginationService: any): any {
    return {
      terminal: true,
      multiElement: true,
      priority: 5000, // this setting is used in conjunction with the later call to $compile() to prevent infinite recursion of compilation
      compile: function dirPaginationCompileFn(tElement: any, tAttrs: any): any {
        var expression: any = tAttrs.dirPaginate;
        // regex taken directly from https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js#L211
        var match: any = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

        var filterPattern: any = /\|\s*itemsPerPage\s*:[^|]*/;
        if (match[2].match(filterPattern) === null) {
          throw 'pagination directive: the \'itemsPerPage\' filter must be set.';
        }
        var itemsPerPageFilterRemoved: any = match[2].replace(filterPattern, '');
        var collectionGetter: any = $parse(itemsPerPageFilterRemoved);

        // if any value is specified for paginationId, we register the un-evaluated expression at this stage for the benefit of any
        // dir-pagination-controls directives that may be looking for this ID.
        var rawId: any = tAttrs.paginationId || DEFAULT_ID;

        paginationService.registerInstance(rawId);

        return function dirPaginationLinkFn(scope: any, element: any, attrs: any): any {

          // now that we have access to the `scope` we can interpolate any expression given in the paginationId attribute and
          // potentially register a new ID if it evaluates to a different value than the rawId.
          var paginationId: any = $parse(attrs.paginationId)(scope) || attrs.paginationId || DEFAULT_ID;
          paginationService.registerInstance(paginationId);
          var repeatExpression: any;
          var idDefinedInFilter: any = !!expression.match(/(\|\s*itemsPerPage\s*:[^|]*:[^|]*)/);
          if (paginationId !== DEFAULT_ID && !idDefinedInFilter) {
            repeatExpression = expression.replace(/(\|\s*itemsPerPage\s*:[^|]*)/, '$1 : \'' + paginationId + '\'');
          } else {
            repeatExpression = expression;
          }

          // add ng-repeat to the dom element
          if (element[0].hasAttribute('dir-paginate-start') || element[0].hasAttribute('data-dir-paginate-start')) {
            // using multiElement mode (dir-paginate-start, dir-paginate-end)
            attrs.$set('ngRepeatStart', repeatExpression);
            element.eq(element.length - 1).attr('ng-repeat-end', 'true');
          } else {
            attrs.$set('ngRepeat', repeatExpression);
          }

        // we manually compile the element again, as we have now added ng-repeat. Priority less than 5000 prevents infinite recursion of compiling dirPaginate
        var compiled: any = $compile(element, false, 5000);

          var currentPageGetter: any;
          if (attrs.currentPage) {
            currentPageGetter = $parse(attrs.currentPage);
          } else {
            // if the current-page attribute was not set, we'll make our own
            var defaultCurrentPage: any = paginationId + '__currentPage';
            scope[defaultCurrentPage] = 1;
            currentPageGetter = $parse(defaultCurrentPage);
          }
          scope.$on('changeProcessResetCurrentPage', function (event: any, data: any): void {
            paginationService.setCurrentPage(paginationId, data);
          });
          scope.$on('changeProcessResetCurrentPageOfActivity', function (event: any, data: any): void {
            paginationService.setCurrentPage('mealsPagination_activity', data);
          });
          paginationService.setCurrentPageParser(paginationId, currentPageGetter, scope);
          if (typeof attrs.totalItems !== 'undefined') {
            paginationService.setAsyncModeTrue(paginationId);
            scope.$watch(function (): any{
              return $parse(attrs.totalItems)(scope);
            }, function (result: number): any {
              if (0 <= result) {
                paginationService.setCollectionLength(paginationId, result);
              }
            });
          } else {
            scope.$watchCollection(function (): any {
              return collectionGetter(scope);
            }, function (collection: any): void {
              if (collection) {
                paginationService.setCollectionLength(paginationId, collection.length);
              }
            });
          }

          // delegate to the link function returned by the new compilation of the ng-repeat
          compiled(scope);
        };
      }
    };
  }])
  // .directive("bwDateFormat", ["$rootScope", 'moment', function ($rootScope: any, moment: any): any {
  //   return {
  //     restrict: "E",
  //     template: '<div title="{{dataFormat}}">{{dataFormat}}</div>',
  //     replace: true,
  //     scope: {
  //       data: "="
  //     },
  //     link: function (scope, element, attr): any {
  //      // $inject: any = ['$state', 'globalVariables', 'monLabels'];
  //       scope.dataFormat = moment(scope.data).format('MM/DD/YYYY HH:mm:ss');
  //     }
  //   }
  // }])
  .directive('datePicker', ['$rootScope', function ($rootScope: any): any {
    return {
      restrict: 'E',
      template: require('../partials/date.html'),
      replace: true,
      scope: {
        model: '=',
        callback: '='
      },
      link: function (scope: any, element: any, attr: any): any {
        var rootHolder: any = $rootScope.rootHolder || ($rootScope.rootHolder = {
          timestamp: 0
        });
        scope.shouldShow = function(): boolean{
          if (scope.timestamp !== rootHolder.timestamp) {
            scope.isShown = false;
            return false;
          }
          return scope.isShown;
        };
        scope.toggleDate = function(): void{
          scope.isShown = !scope.isShown;
          scope.timestamp = rootHolder.timestamp = +new Date();
        };

        scope.$on('domBodyClicked', function (event: any, e: any): any {
          if (jQuery(e.target).parents('.date-area').length > 0 ) {
            return;
          }
          if (jQuery(e.target).parents('.uib-years').length > 0 ) {
            return;
          }
          if (jQuery(e.target).parents('.uib-month').length > 0 ) {
            return;
          }
          if (jQuery(e.target).parents('.uib-monthpicker').length > 0 ) {
            return;
          }
          if (jQuery(e.target).parents('.uib-daypicker').length > 0 ) {
            return;
          }
          if (jQuery(e.target).parents('.uib-day').length > 0 ) {
            return;
          }
          scope.isShown  = false;
          scope.$apply();
        });
      }
    };
  }])
  .directive('timePicker', ['$rootScope', function ($rootScope: any): any {
    return {
      restrict: 'E',
      template: require('../partials/time.html'),
      replace: true,
      scope: {
        model: '=',
        callback: '='
      },
      link: function (scope: any, element: any, attr: any): any {
        var rootHolder: any = $rootScope.rootHolder || ($rootScope.rootHolder = {
          timestamp: 0
        });
        scope.isShown = false;
        scope.shouldShow = function(): boolean{
          if (scope.timestamp !== rootHolder.timestamp) {
            scope.isShown = false;
            return false;
          }
          return scope.isShown;
        };
        scope.toggleTime = function(): void{
          scope.isShown = !scope.isShown;
          scope.timestamp = rootHolder.timestamp = +new Date();
        };

        scope.$on('domBodyClicked', function (event: any, e: any): void {
          if (jQuery(e.target).parents('.time-area').length > 0 ) {
            return;
          };
          scope.isShown  = false;
          scope.$apply();
        });
      }
    };
  }])
  .directive('dirPaginationControls', ['$rootScope', 'paginationService', function ($rootScope: any, paginationService: any): any {

    var numberRegex: any = /^\d+$/;

    /**
     * Generate an array of page numbers (or the '...' string) which is used in an ng-repeat to generate the
     * links used in pagination
     *
     * @param currentPage
     * @param rowsPerPage
     * @param paginationRange
     * @param collectionLength
     * @returns {Array}
     */
    function generatePagesArray(currentPage: number, collectionLength: number, rowsPerPage: number, paginationRange: any): any {
      var pages: any[] = [];
      var totalPages: number = Math.ceil(collectionLength / rowsPerPage);
      var halfWay: number = Math.ceil(paginationRange / 2);
      var position: any;

      if (currentPage <= halfWay) {
        position = 'start';
      } else if (totalPages - halfWay < currentPage) {
        position = 'end';
      } else {
        position = 'middle';
      }

      var ellipsesNeeded: boolean = paginationRange < totalPages;
      var i: number = 1;
      while (i <= totalPages && i <= paginationRange) {
        var pageNumber: number = calculatePageNumber(i, currentPage, paginationRange, totalPages);

        var openingEllipsesNeeded: boolean = (i === 2 && (position === 'middle' || position === 'end'));
        var closingEllipsesNeeded: boolean = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
        if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
          pages.push('...');
        } else {
          pages.push(pageNumber);
        }
        i++;
      }
      return pages;
    }

    /**
     * Given the position in the sequence of pagination links [i], figure out what page number corresponds to that position.
     *
     * @param i
     * @param currentPage
     * @param paginationRange
     * @param totalPages
     * @returns {*}
     */
    function calculatePageNumber(i: number, currentPage: number, paginationRange: number, totalPages: number): number {
      var halfWay: number = Math.ceil(paginationRange / 2);
      if (i === paginationRange) {
        return totalPages;
      } else if (i === 1) {
        return i;
      } else if (paginationRange < totalPages) {
        if (totalPages - halfWay < currentPage) {
          return totalPages - paginationRange + i;
        } else if (halfWay < currentPage) {
          return currentPage - halfWay + i;
        } else {
          return i;
        }
      } else {
        return i;
      }
    }

    return {
      restrict: 'AE',
      template: require('../partials/pagination.html'),
      scope: {
        maxSize: '=?',
        onPageChange: '&?',
        paginationId: '=?'
      },
      link: function dirPaginationControlsLinkFn(scope: IPaginationDirectiveScope, element: any, attrs: any): any {
        // rawId is the un-interpolated value of the pagination-id attribute. This is only important when the corresponding dir-paginate directive has
        // not yet been linked (e.g. if it is inside an ng-if block), and in that case it prevents this controls directive from assuming that there is
        // no corresponding dir-paginate directive and wrongly throwing an exception.
        var rawId: string = attrs.paginationId || DEFAULT_ID;
        var paginationId: string = scope.paginationId || attrs.paginationId || DEFAULT_ID;

        if (!paginationService.isRegistered(paginationId) && !paginationService.isRegistered(rawId)) {
          var idMessage: string = (paginationId !== DEFAULT_ID) ? ' (id: ' + paginationId + ') ' : ' ';
          throw 'pagination directive: the pagination controls' + idMessage + 'cannot be used without the corresponding pagination directive.';
        }

        if (!scope.maxSize) { scope.maxSize = 9; }
        scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : true;
        scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : false;

        var paginationRange: number = Math.max(scope.maxSize, 5);
        var shortPagination: string = attrs.paginationType || 'long';
        if (shortPagination === 'short') {
          scope.isShortPagination = true;
        } else {
          scope.isShortPagination = false;
        }
        scope.pages = [];
        scope.pagination = {
          last: 1,
          current: 1
        };
        scope.range = {
          lower: 1,
          upper: 1,
          total: 1
        };
        scope.inputPagination = scope.pagination.current;
        scope.$watch(function (): any {
          return (paginationService.getCollectionLength(paginationId) + 1) * paginationService.getItemsPerPage(paginationId);
        }, function (length: number): void {
          if (0 < length) {
            generatePagination();
          }
        });

        scope.$watch(function (): any {
          return (paginationService.getItemsPerPage(paginationId));
        }, function (current: number, previous: number): void {
          if (current !== previous) {
            goToPage(scope.pagination.current);
            if (current <= 100) {
              if (paginationId === 'mealsPagination') {
                $rootScope.$broadcast('changePageSize', current);
              }
            }
          }
        });

        scope.$watch(function (): any {
          return paginationService.getCurrentPage(paginationId);
        }, function (currentPage: any, previousPage: any): void {
          if (currentPage !== previousPage) {
            goToPage(currentPage);
          }
        });

        // document.getElementById('pagination_input').addEventListener("keypress", function (evt) {
        //   if (evt.which >= 48 && evt.which <= 57) {
        //     // Do nothing
        //   } else {
        //     evt.preventDefault();

        //   }

        // });

        scope.setCurrent = function (num: number): void {
          $rootScope.$broadcast('selectNode', null);
          if (isValidPageNumber(num)) {
            paginationService.setCurrentPage(paginationId, num);
            var obj: any = {
              id: paginationId,
              value: num
            };
            scope.inputPagination = num;
            $rootScope.$broadcast('changeCurrentPageNumber', obj);
          }
        };

        function goToPage(num: number): void {
          if (isValidPageNumber(num)) {
            scope.pages = generatePagesArray(
              num, paginationService.getCollectionLength(paginationId),
              paginationService.getItemsPerPage(paginationId),
              paginationRange);
            scope.pagination.current = num;
            updateRangeValues();

            // if a callback has been set, then call it with the page number as an argument
            if (scope.onPageChange) {
              scope.onPageChange({ newPageNumber: num });
            }
          }
        }

        function generatePagination(): void {
          var page: number = parseInt(paginationService.getCurrentPage(paginationId), 10) || 1;

          scope.pages = generatePagesArray(
            page,
            paginationService.getCollectionLength(paginationId),
            paginationService.getItemsPerPage(paginationId),
            paginationRange);
          scope.pagination.current = page;
          scope.pagination.last = scope.pages[scope.pages.length - 1];
          if (scope.pagination.last < scope.pagination.current) {
            scope.setCurrent(scope.pagination.last);
          } else {
            updateRangeValues();
          }
        }

        /**
         * This function updates the values (lower, upper, total) of the `scope.range` object, which can be used in the pagination
         * template to display the current page range, e.g. "showing 21 - 40 of 144 results";
         */
        function updateRangeValues(): void {
          var currentPage: number = paginationService.getCurrentPage(paginationId),
            itemsPerPage: number = paginationService.getItemsPerPage(paginationId),
            totalItems: number = paginationService.getCollectionLength(paginationId);

          scope.range.lower = (currentPage - 1) * itemsPerPage + 1;
          scope.range.upper = Math.min(currentPage * itemsPerPage, totalItems);
          scope.range.total = totalItems;
        }

        function isValidPageNumber(num: number): boolean {
          return (numberRegex.test(num) && (0 < num && num <= scope.pagination.last));
        }
        /*scope.showPaginationTheErrorMessage = function(){
          scope.showPaginationError = true;
        }
        scope.hidePaginationTheErrorMessage = function(){
          scope.showPaginationError = false;
        }*/
      }
    };
  }])
  .service('paginationService', function (): any {

    var instances: any = {};
    var lastRegisteredInstance: any;
    var isCustomPagination: boolean = false;

    this.registerInstance = function (instanceId: any): any {
      if (typeof instances[instanceId] === 'undefined') {
        instances[instanceId] = {
          asyncMode: false
        };
        lastRegisteredInstance = instanceId;
      }
    };

    this.isRegistered = function (instanceId: any): boolean {
      return (typeof instances[instanceId] !== 'undefined');
    };

    this.setCustomPagination = function (isCustom: boolean): void {
      isCustomPagination = isCustom;
    };
    this.getCustomPagination = function (): boolean{
      return isCustomPagination;
    };
    this.getLastInstanceId = function (): any {
      return lastRegisteredInstance;
    };

    this.setCurrentPageParser = function (instanceId: any, val: any, scope: any): void {
      instances[instanceId].currentPageParser = val;
      instances[instanceId].context = scope;
    };
    this.setCurrentPage = function (instanceId: any, val: any): void {
      instances[instanceId].currentPageParser.assign(instances[instanceId].context, val);
    };
    this.getCurrentPage = function (instanceId: any): number {
      var parser: any = instances[instanceId].currentPageParser;
      return parser ? parser(instances[instanceId].context) : 1;
    };

    this.setItemsPerPage = function (instanceId: any, val: any): void {
      instances[instanceId].itemsPerPage = val;
    };
    this.getItemsPerPage = function (instanceId: any): any {
      return instances[instanceId].itemsPerPage;
    };

    this.setCollectionLength = function (instanceId: any, val: any): void {
      instances[instanceId].collectionLength = val;
    };
    this.getCollectionLength = function (instanceId: any): number {
      return instances[instanceId].collectionLength;
    };

    this.setAsyncModeTrue = function (instanceId: any): void {
      instances[instanceId].asyncMode = true;
    };

    this.isAsyncMode = function (instanceId: any): any {
      return instances[instanceId].asyncMode;
    };
  })
  .filter('itemsPerPage', ['$rootScope', 'paginationService', function ($rootScope: any, paginationService: any): any {

    return function (collection: any, itemsPerPage: any, paginationId: any): any {
      if (typeof (paginationId) === 'undefined') {
        paginationId = DEFAULT_ID;
      }
      if (!paginationService.isRegistered(paginationId)) {
        throw 'pagination directive: the itemsPerPage id argument (id: ' + paginationId + ') does not match a registered pagination-id.';
      }
      var end: number;
      var start: number;
      if (collection instanceof Array) {
        if (itemsPerPage) {
          if (parseInt(itemsPerPage, 10) > 100 || parseInt(itemsPerPage, 10) <= 0) {
            // $rootScope.pageSizeError = true;
            if (parseInt(itemsPerPage, 10) <= 0) {
              itemsPerPage = 30;
            } else if (parseInt(itemsPerPage, 10) > 100) {
              itemsPerPage = 100;
            }
          }
          // else {
          //   // $rootScope.pageSizeError = false;
          // }
        } else {
          if (parseInt(itemsPerPage, 10) === 0) {
            // $rootScope.pageSizeError = true;
            return;
          } else {
            itemsPerPage = 30;
          }
        }
        itemsPerPage = parseInt(itemsPerPage, 10);
        if (paginationService.isAsyncMode(paginationId)) {
          start = 0;
        } else {
          start = (paginationService.getCurrentPage(paginationId) - 1) * itemsPerPage;
        }
        end = start + itemsPerPage;
        paginationService.setItemsPerPage(paginationId, itemsPerPage);

        return collection.slice(start, end);
      } else {
        return collection;
      }
    };
  }])
  .filter('nameFilter', ['paginationService', function (paginationService: any): any {
    return function (collection: any, historySearch: any, paginationId: any): any {
      if (typeof (paginationId) === 'undefined') {
        paginationId = DEFAULT_ID;
      }
      if (!paginationService.isRegistered(paginationId)) {
        throw 'pagination directive: the itemsPerPage id argument (id: ' + paginationId + ') does not match a registered pagination-id.';
      }
      if (collection instanceof Array) {
        _.filter(collection, function (item: any): any {
          return item.processInstanceId.toLowerCase().indexOf(historySearch.toLowerCase()) >= 0;
        });
      } else {
        return collection;
      }
    };
  }]);