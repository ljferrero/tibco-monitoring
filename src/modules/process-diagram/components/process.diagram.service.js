/**
 * Created by Srikanta Dutta on 6/1/2017.
 */


'use strict';
var d3 = require('d3');
var jQuery = require('jquery');

angular.module('monitor.process.diagram')
  .factory('initSvgObject', ['$rootScope', function ($rootScope) {
    var init = function () {
      $rootScope.processSvg = {};
      $rootScope.processSvg.activityContainText_final = "";
      $rootScope.processSvg.exampleNodes = [];
      $rootScope.processSvg.exampleLinks = [];
      $rootScope.processSvg.parenerLeftLinks = [];
      $rootScope.processSvg.parenerRightLinks = [];
      $rootScope.processSvg.nodeMap = {};
      $rootScope.processSvg.partnerLinksMap = {};
      $rootScope.processSvg.currentNode = null;
      $rootScope.processSvg.activityContainText = null;
      $rootScope.processSvg.partnerLinksMap = [];
      $rootScope.processSvg.unknowActivityMap = {};
      $rootScope.uniqueActivity4002ReplyForService = [];
    }
    return {
      init: init
    }
  }])

  .factory('processDiagramInfoServer', [function () {
    var processData = {};
    var getProcessData = function () {
      return processData;
    }
    var getProcessDataByKey = function (key) {
      return processData[key] || null;
    }
    var setProcessData = function (key, value) {
      processData[key] = value;
    }
    var getProcessViewType = function () {
      if (processData.processViewType) {
        return processData.processViewType
      } else {
        return "picture"
      }
    }
    var setProcessViewType = function (view) {
      processData.processViewType = view;
    }
    var cleanProcessData = function () {
      processData = {};
    }
    var cleanProcessDataNotViewType = function () {
      var viewType = processData.processViewType;
      processData = {};
      processData.processViewType = viewType;
    }
    return {
      getProcessData: getProcessData,
      getProcessDataByKey: getProcessDataByKey,
      setProcessData: setProcessData,
      getProcessViewType: getProcessViewType,
      setProcessViewType: setProcessViewType,
      cleanProcessData: cleanProcessData,
      cleanProcessDataNotViewType: cleanProcessDataNotViewType
    }
  }])



  .factory('configurationService', [function () {

    var getProcessInstStatsGridHeaderOfGraph = function () {
      var processInstHeader = [
        { header: 'maxElapsedTime', columnStyle: 'default' },
        { header: 'minElapsedTime', columnStyle: 'default' },
        { header: 'processName', columnStyle: 'default' },
        { header: 'totalElapsedTime', columnStyle: 'default' },
        { header: 'totalExecutionTime', columnStyle: 'default' },
        { header: 'completed', columnStyle: 'default' },
        { header: 'created', columnStyle: 'default' },
        { header: 'faulted', columnStyle: 'default' },
        { header: 'suspended', columnStyle: 'default' }
      ];
      var processInstRatioGraphHeader = [
        { header: 'totalElapsedTime/totalExecutionTime', columnStyle: 'default' },
        { header: 'minElapsedTime/maxElapsedTime', columnStyle: 'default' }
      ]
      var activityInstGraphHeader = [
        { header: 'activityName', property: 'activityName', colSpan: '1', rowSpan: '2', columnStyle: 'default' },
        { header: 'executed', property: 'executed', rowSpan: '2', colSpan: '1', columnStyle: 'default' },
        { header: 'faulted', property: 'faulted', rowSpan: '2', colSpan: '1', columnStyle: 'default' },
        { header: 'recentStatus', property: 'recentStatus', colSpan: '1', rowSpan: '2', columnStyle: 'default' },
        {
          header: 'ElapsedTime',
          property: '',
          rowSpan: "1",
          colSpan: '3',
          columnStyle: 'default',
          childGroup: [
            { header: 'max', property: 'maxElapsedTime', columnStyle: 'default' },
            { header: 'min', property: 'minElapsedTime', columnStyle: 'default' },
            { header: 'total', property: 'totalElapsedTime', columnStyle: 'default' }
          ]
        },
        {
          header: 'ExecutionTime',
          property: '',
          rowSpan: "1",
          colSpan: '3',
          columnStyle: 'default',
          childGroup: [
            { header: 'max', property: 'maxExecutionTime', columnStyle: 'default' },
            { header: 'min', property: 'minExecutionTime', columnStyle: 'default' },
            { header: 'total', property: 'totalExecutionTime', columnStyle: 'default' }
          ]
        }
      ];
      var getProcessInstGroup = function () {
        var processInstGroup = {};
        processInstGroup.column = 'three';
        processInstGroup.info_first_column = {
          groupTitle: "Process Instances:",
          groupType: "jobs",
          group: [
            { header: 'created', property: 'created', columnStyle: 'normal' },
            { header: 'completed', property: 'completed', columnStyle: 'normal' },
            { header: 'faulted', property: 'faulted', columnStyle: 'normal' },
            { header: 'suspended', property: 'suspended', columnStyle: 'normal' }
          ]
        };
        processInstGroup.info_second_column = {
          groupTitle: "Elapsed Time:",
          groupType: "elapsedTime",
          group: [
            { header: 'average', property: 'averageElapsedTime', columnStyle: 'normal' },
            { header: 'max', property: 'maxElapsedTime', columnStyle: 'normal' },
            { header: 'min', property: 'minElapsedTime', columnStyle: 'normal' },
            { header: 'recent', property: 'recentElapsedTime', columnStyle: 'normal' },
            { header: 'total', property: 'totalElapsedTime', columnStyle: 'linkConfig' }
          ]
        };
        processInstGroup.info_third_column = {
          groupTitle: "Execution Time:",
          groupType: "executionTime",
          group: [
            { header: 'average', property: 'averageExecutionTime', columnStyle: 'normal' },
            { header: 'max', property: 'maxExecutionTime', columnStyle: 'normal' },
            { header: 'min', property: 'minExecutionTime', columnStyle: 'normal' },
            { header: 'recent', property: 'recentExecutionTime', columnStyle: 'normal' },
            { header: 'total', property: 'totalExecutionTime', columnStyle: 'linkConfig' }
          ]
        };
        return processInstGroup;
      }
      var getActivityInstGroup = function () {
        var activityInstGroup = {};
        activityInstGroup.column = 'three';
        activityInstGroup.info_first_column = {
          groupTitle: "Activity Instances:",
          groupType: "jobs",
          group: [
            { header: 'faulted', property: 'faulted', columnStyle: 'normal' },
            { header: 'executed', property: 'executed', columnStyle: 'normal' }
          ]
        };
        activityInstGroup.info_second_column = {
          groupTitle: "Elapsed Time:",
          groupType: "elapsedTime",
          group: [
            { header: 'max', property: 'maxElapsedTime', columnStyle: 'normal' },
            { header: 'min', property: 'minElapsedTime', columnStyle: 'normal' },
            { header: 'recent', property: 'recentElapsedTime', columnStyle: 'normal' },
            { header: 'total', property: 'totalElapsedTime', columnStyle: 'linkConfig' }
          ]
        };
        activityInstGroup.info_third_column = {
          groupTitle: "Execution Time:",
          groupType: "executionTime",
          group: [
            { header: 'max', property: 'maxExecutionTime', columnStyle: 'normal' },
            { header: 'min', property: 'minExecutionTime', columnStyle: 'normal' },
            { header: 'recent', property: 'recentExecutionTime', columnStyle: 'normal' },
            { header: 'total', property: 'totalExecutionTime', columnStyle: 'linkConfig' }
          ]
        };
        return activityInstGroup;
      };
      var processInstanceHistoryGridHeader = [
        { header: 'Process Instance Id', property: 'processInstanceId', columnStyle: 'normal', dataStyle: 'name' },
        { header: 'Appnode', property: 'appnodeName', columnStyle: 'normal', dataStyle: 'default' },
        { header: 'State', property: 'processInstanceState', columnStyle: 'normal', dataStyle: 'state' },
        //{header: 'timestamp', property:'timestamp',columnStyle: 'normal',dataStyle:'moment'},
        { header: 'StartTime', property: 'processInstanceStartTime', columnStyle: 'normal', dataStyle: 'moment' },
        //{header: 'endTime', property:'processInstanceEndTime',columnStyle: 'normal',dataStyle:'moment'},
        { header: 'DurationTime (ms)', property: 'processInstanceDurationTime', columnStyle: 'normal', dataStyle: 'default' },
        { header: 'EvalTime (ms)', property: 'processInstanceEvalTime', columnStyle: 'normal', dataStyle: 'default' }
      ];
      var activityInstanceHistoryGridHeader = [
        { header: 'ActivityName', property: 'activityName', columnStyle: 'normal', dataStyle: 'name' },
        { header: 'State', property: 'activityState', columnStyle: 'normal', dataStyle: 'state' },
        { header: 'Timestamp', property: 'timestamp', columnStyle: 'normal', dataStyle: 'moment' },
        { header: 'StartTime', property: 'activityStartTime', columnStyle: 'normal', dataStyle: 'moment' },
        { header: 'DurationTime (ms)', property: 'activityDurationTime', columnStyle: 'normal', dataStyle: 'default' },
        { header: 'EvalTime (ms)', property: 'activityEvalTime', columnStyle: 'normal', dataStyle: 'default' }
      ]
      return {
        processInstHeader: processInstHeader,
        processInstRatioGraphHeader: processInstRatioGraphHeader,
        activityInstGraphHeader: activityInstGraphHeader,
        getProcessInstGroup: getProcessInstGroup,
        getActivityInstGroup: getActivityInstGroup,
        processInstanceHistoryGridHeader: processInstanceHistoryGridHeader,
        activityInstanceHistoryGridHeader: activityInstanceHistoryGridHeader
      };
    }
    return { getProcessInstStatsGridHeaderOfGraph: getProcessInstStatsGridHeaderOfGraph };
  }])



  .factory('prepareDataForProcessInfoService', ['$window', function ($window) {

    var parseXmlString = function (xmlString) {

      var doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      var tagName = "ProcessInfo";
      if ($window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
        tagName = "tibex:ProcessInfo";
      }
      var attrs = doc.getElementsByTagName(tagName)[0].attributes;
      var processInfo = [];
      for (var i = 0; i < attrs.length; i++) {
        var item = attrs[i];
        processInfo.push({ label: item.name, value: item.value });
      }

      return processInfo;
    };

    return { parseXmlString: parseXmlString };
  }])
  .factory('makeSvgDiagramAlwaysCenter', ['$state', '$timeout', '$rootScope', function ($state, $timeout, $rootScope) {

    var init = function (scope) {
      var id;
      if ($state.current.name=== 'applications.application.defaultDetails.processInfo') {
        id = '#svgDataDiagram';
      } else {
        id = '#svgDataDiagramTransition';
      }
      var selector = id + ' svg';
      // if (!$rootScope.urlSearch.opp) return;
      var element = scope.svgData ? jQuery(selector)[0] : jQuery(".empty-diagram")[0];
      var svgDiagramWidth = element.getBoundingClientRect().width.toFixed(0);
      var svgDiagramHeight = element.getBoundingClientRect().height.toFixed(0);
      if (!jQuery(selector).length) {
        svgDiagramHeight = parseInt(svgDiagramHeight) + 250;
      }
      var treeWidth = 220;
      var bodyWidth = jQuery("body")[0].clientWidth;
      var width = scope.delayFlag ? (bodyWidth - treeWidth) : bodyWidth;
      width = scope.processDelayFlag ? (width - treeWidth) : width;
      var leftWidth = (width - svgDiagramWidth) / 2;
      var svgContainerElement = jQuery(".diagram-svg-container");

      if (scope.delayFlag && !scope.processDelayFlag) {
        if (leftWidth <= 0) {
          svgContainerElement.css('left', treeWidth);
          svgContainerElement.css('right', 0);
        } else {
          svgContainerElement.css('left', (treeWidth + leftWidth));
          svgContainerElement.css('right', 0);
        }
      } else if (!scope.delayFlag && scope.processDelayFlag) {

        if (leftWidth <= 0) {
          svgContainerElement.css('right', treeWidth);
          svgContainerElement.css('left', 0);
        } else {
          svgContainerElement.css('right', (treeWidth + leftWidth));
          svgContainerElement.css('left', leftWidth);
        }
      } else if (scope.delayFlag && scope.processDelayFlag) {
        if (leftWidth <= 0) {
          svgContainerElement.css('right', treeWidth);
          svgContainerElement.css('left', treeWidth);
        } else {
          svgContainerElement.css('left', (treeWidth + leftWidth));
          svgContainerElement.css('right', 0);
        }
      }
      else {
        svgContainerElement.css('left', leftWidth);
        svgContainerElement.css('right', 0);
      }
      $timeout(function () {
        jQuery(id).css('width', svgDiagramWidth);
        jQuery(id).css('height', svgDiagramHeight)
      }, 300)
    }
    return {
      init: init
    }
  }])
  .factory('svgProcessConfig', ["$rootScope", "$location", function ($rootScope, $location) {
    var baseImageStr = {
      baseTopImageStr: function () {
        return baseImageStr.baseGroupStr + baseImageStr.baseGroupUncollapseStr + baseImageStr.baseCollapseStr +
          baseImageStr.baseUnpinStr + baseImageStr.baseMenuStr + baseImageStr.baseUnCollapseStr;
      },
      onMessageIconStr: function () {
        return baseImageStr.baseCollapseStr + baseImageStr.baseUnpinStr + baseImageStr.baseMenuStr + baseImageStr.baseUnCollapseStr;
      },
      pickIconStr: function () {
        return baseImageStr.onMessageIconStr();
      },
      catchAllIconStr: function () {
        return baseImageStr.onMessageIconStr();
      },
      onEventIconStr: function () {
        return baseImageStr.onMessageIconStr();
      },
      catchIconStr: function () {
        return baseImageStr.onMessageIconStr();
      },
      compensationHandlerIconStr: function () {
        return baseImageStr.onMessageIconStr();
      },
      baseRectStr: function (rectObj) {
        var str = '<rect rx="' + rectObj.rx + '" ry="' + rectObj.ry + '" ';
        if (typeof rectObj.width == "number") {
          str += 'width="' + rectObj.width + '" ';
        } else {
          str += 'ng-attr-width={{' + rectObj.width + '}} ';
        }

        if (typeof rectObj.height == "number") {
          str += 'height="' + rectObj.height + '" ';
        } else {
          str += 'ng-attr-height={{' + rectObj.height + '}} ';
        }
        str += 'fill="' + rectObj.fill + '" stroke="' + rectObj.stroke + '" stroke-width="' + rectObj.strokeWidth + '" ></rect>';
        return str;
      },

      baseGroupStr: '<image ng-show="showScope" xlink:href={{group_path}} ng-attr-x={{group_x}} ng-attr-y={{group_y}} ' +
        'ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>',
      baseGroupUncollapseStr: '<image ng-show="!showScope" xlink:href={{group_path}} ng-attr-x={{group_x_uncollapse}} ' +
        'ng-attr-y={{group_y_uncollapse}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>',
      baseCollapseStr: '<image ng-show="showScope" xlink:href={{collapse_path}} ng-attr-x={{collapse_x}} ' +
        'ng-attr-y={{collapse_y}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>',
      baseUnpinStr: '<image ng-show="showScope" xlink:href={{unpin_path}} ng-attr-x={{unpin_x}} ' +
        'ng-attr-y={{unpin_y}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>',
      baseMenuStr: '<image ng-show="showScope" xlink:href={{menu_path}} ng-attr-x={{menu_x}} ' +
        'ng-attr-y={{menu_y}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>',
      baseUnCollapseStr: '<image ng-show="!showScope" xlink:href={{uncollapse_path}} ' +
        'ng-attr-x={{uncollapse_x}} ng-attr-y={{uncollapse_y}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_width}}></image>',
      baseParenerLinkStr: '<image xlink:href="" ng-href={{partnerLink.url}} ' +
        'ng-attr-x={{partnerLink.imageIconX}} ng-attr-y={{partnerLink.imageIconY}} ng-attr-width={{partnerLink.imageIcon_width}} ng-attr-height={{partnerLink.imageIcon_height}}></image>',

      /*baseTemplateStr : function(){
       return '<g ng-attr-transform="translate({{x}},{{y}})" >' +
       '<rect rx="5" ry="5" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
       '<g id="processTitle" >' +
       '<rect rx="5" ry="5" ng-attr-width={{width}} height="20" fill="rgb(255,233,130)" stroke="black" stroke-width="1" ></rect>' +
       '<g ng-attr-transform="translate({{title_x}},10)">' +
       '<text font-size="14">{{name}}</text>' +
       '</g>' +
       '</g>' +
       baseImageStr.basePartnerLinkStr()+
       '</g>';
       },*/
      baseTemplateStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})" >' +
          //left panel
          '<g ng-attr-transform="translate({{svgLeftPanel_x}},{{svgLeftPanel_y}})" >' +
          '<rect rx="5" ry="5" width="115" height="22" fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<image xlink:href="{{serversImgPath}}" x="5" y="2" width="16" height="16"></image>' +
          '<image xlink:href="{{interfaceImgPath}}" x="30" y="3" width="16" height="16"></image>' +
          '<image xlink:href="{{restServerImgPath}}" x="60" y="3" width="16" height="16"></image>' +
          '</g>' +
          //right panel
          '<g ng-attr-transform="translate({{svgRightPanel_x}},{{svgRightPanel_y}})" >' +
          '<rect rx="5" ry="5" width="115" height="22" fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<image xlink:href="{{interfaceImgPath}}" x="60" y="3" width="16" height="16"></image>' +
          '<image xlink:href="{{referenceImgPath}}" x="90" y="2" width="16" height="16"></image>' +
          '</g>' +
          //center scope
          '<rect rx="5" ry="5" ng-attr-width={{width}} ng-attr-height={{height}} fill="rgb(255,233,130)" stroke="black" stroke-width="1" ></rect>' +
          //'<g ng-attr-transform="translate({{title_x}},10)">' +
          '<text ng-attr-x={{title_x}} ng-attr-y={{title_y}}  font-size="12">{{name}}</text>' +
          //'</g>' +
          '<g ng-attr-transform="translate({{container_x}},{{container_y}})">' +
          '<rect rx="5" ry="5" ng-attr-width={{container_width}} ng-attr-height={{container_height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '</g>' +
          baseImageStr.basePartnerLinkStr() +
          '</g>';
      },
      basePartnerLinkStr: function () {
        return '<g ng-show="partnerlinkFlag" ng-repeat="partnerLink in partnerLinksNew" ' +
          'ng-attr-transform="translate({{partnerLink.x}},{{partnerLink.y}})">' +
          '<rect rx="5" ry="5" ng-attr-width={{partnerLink.width}} ng-attr-height={{partnerLink.height}} ' +
          'fill="none" stroke="black" stroke-width="0" ></rect>' +
          '<g>{{partnerLink.RestImageStr}}</g>' +
          '<text font-size="12"  stroke="{{sub.color}}" ng-attr-x="{{partnerLink.name_x}}" ng-attr-y="{{partnerLink.name_y}}">{{partnerLink.id}}</text>'+

          baseImageStr.baseParenerLinkStr +

          '<image ng-show={{partnerLink.showrestImage}} xlink:href="" ng-href={{partnerLink.RestImageStr}} ' +
          'ng-attr-x={{partnerLink.RestImage_x}} ng-attr-y={{partnerLink.RestImage_y}} width="16" height="16"></image>' +

          '<image xlink:href="" ng-href={{partnerLink.menuStr}} ng-attr-x={{partnerLink.menu_x}} ng-attr-y={{partnerLink.menu_y}} width="16" height="16"></image>' +

          '<g ng-attr-transform="translate(0,{{partnerLink.imageIcon_height}})" >' +

          '<rect rx="5" ry="5" ng-attr-width={{partnerLink.subTabWidth}} ng-attr-height={{partnerLink.subTabHeight}} ' +
          'fill="white" stroke="black" stroke-width="1" ></rect>' +

          '<g ng-repeat="sub in partnerLink.subTab" ng-attr-transform="translate(0, {{20*$index}})" >' +

          '<image xlink:href="" ng-href={{partnerLink.parenerSubLeft_LeftImgStr}} x="2" y="2" width="16" height="16"></image>' +

          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="12" stroke="{{sub.color}}">{{sub.operation}}</text>'+

          '<image ng-show={{partnerLink.left}} xlink:href="" ng-href={{partnerLink.parenerSubLeft_RightImgStr}} ' +
          'ng-attr-x="{{partnerLink.subTabWidth-17}}" y="3" width="12" height="12"></image>' +
          '</g>' +
          '</g>' +
          '</g>'
      },
      baseLinkStr : function(){
        var path = window.location.href;
        return '<path id="{{id}}" stroke="{{color}}" line-through stroke-width="{{strokeWidth}}" fill="none" ng-attr-d={{linkAttr_d}}  style="marker-end: url({{basePath}}#markerArrow{{color}});" ></path>'
      },

      baseActivityStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect id="{{activityRectId}}" rx="5" ry="5" ng-attr-width={{width}} ng-attr-height={{height}} fill="{{bgcolor}}" stroke="black" stroke-width="{{strokeWidth}}" ></rect>' +
          '<image ng-href="{{activityPath}}" xlink:href="" ng-attr-width={{width}} ng-attr-height={{height}}></image>' +
          '<text ng-show="showText" font-size="12" fill="rgb(0,0,127)" ng-attr-x={{activityText_x}} ng-attr-y={{activityText_y}}>{{activityName}}</text>' +
          '</g>';
      },

      baseScopeStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect id="{{activityRectId}}" ng-show="showScope" rx="15" ry="15" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<rect id="{{activityRectId}}" ng-show="!showScope" rx="5" ry="5" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          baseImageStr.baseTopImageStr() +
          '</g>';
      },

      baseCompensationHandlerStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect rx="10" ry="10" ng-attr-width={{width}} ng-attr-height={{height}} fill="none" stroke="black" stroke-dasharray="7" stroke-width="1" ></rect>' +
          '<g transform="translate(8,8)">' +
          '<rect rx="5" ry="5" ng-attr-width={{info_width}} ng-attr-height={{info_height}} fill="none" stroke="black" stroke-width="1"></rect>' +
          '<image xlink:href="{{compensationHandler_info_path}}" x="2" y="2" width="16" height="16"></image>' +
          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="13" >{{compensationText}}</text>' +
          '</g>' +
          baseImageStr.compensationHandlerIconStr() +
          '</g>';
      },

      baseCatchStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect rx="10" ry="10" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="{{color}}" stroke-width="{{strokeWidth}}"></rect>' +
          '<image xlink:href={{catchLeftImg_path}} ng-attr-x={{catch_x}} ng-attr-y={{catch_y}} ng-attr-width={{catch_width}} ng-attr-height={{catch_height}}></image>' +
          '<g transform="translate(8,8)">' +
          '<rect rx="5" ry="5" ng-attr-width={{info_width}} ng-attr-height={{info_height}} fill="none" stroke="black" stroke-width="1"></rect>' +
          '<image xlink:href="{{catch_info_path}}" x="2" y="2" width="16" height="16"></image>' +
          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="13" >{{catchText}}</text>' +
          '</g>' +
          baseImageStr.catchIconStr() +
          '</g>';
      },

      baseOnEventStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +

          '<rect rx="10" ry="10" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<image xlink:href={{eventHandlersLeftImg_path}} ng-attr-x={{event_x}} ng-attr-y={{event_y}} ng-attr-width={{event_width}} ng-attr-height={{event_height}}></image>' +
          '<g transform="translate(8,8)">' +
          '<rect rx="5" ry="5" ng-attr-width={{info_width}} ng-attr-height={{info_height}} fill="none" stroke="black" stroke-width="1"></rect>' +
          '<image xlink:href="{{event_info_path}}" x="2" y="2" width="16" height="16"></image>' +
          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="13" >{{eventText}}</text>' +
          '</g>' +
          baseImageStr.onEventIconStr() +
          '</g>';
      },

      baseCatchAllStr : function(){
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +

          '<rect rx="10" ry="10" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="{{color}}" stroke-width="{{strokeWidth}}" ></rect>' +
          '<image xlink:href={{catchAllLeftImg_path}} ng-attr-x={{catchAll_x}} ng-attr-y={{catchAll_y}} ng-attr-width={{catchAll_width}} ng-attr-height={{catchAll_height}}></image>' +
          '<g transform="translate(8,8)">' +
          '<rect rx="5" ry="5" ng-attr-width={{info_width}} ng-attr-height={{info_height}} fill="none" stroke="black" stroke-width="1"></rect>' +
          '<image xlink:href="{{catchAll_info_path}}" x="2" y="2" width="16" height="16"></image>' +
          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="13" >{{eventText}}</text>' +
          '</g>' +
          baseImageStr.catchAllIconStr()+
          '</g>'
      },

      basePickStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect ng-show="showScope" rx="15" ry="15" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<rect ng-show="!showScope" rx="5" ry="5" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<image ng-show="showScope" xlink:href={{pick_path}} ng-attr-x={{pick_x}} ng-attr-y={{pick_y}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>' +

          '<image ng-show="!showScope" xlink:href={{pick_path}} ng-attr-x={{pick_x_uncollapse}} ng-attr-y={{pick_y_uncollapse}} ng-attr-width={{collapse_width}} ng-attr-height={{collapse_height}}></image>' +
          baseImageStr.pickIconStr() +
          '</g>';
      },

      baseOnMessageStr: function () {
        return '<g ng-attr-transform="translate({{x}},{{y}})">' +
          '<rect rx="10" ry="10" ng-attr-width={{width}} ng-attr-height={{height}} fill="white" stroke="black" stroke-width="1" ></rect>' +
          '<g ng-show="showScope" transform="translate(8,8)">' +
          '<rect rx="5" ry="5" ng-attr-width={{info_width}} ng-attr-height={{info_height}} fill="none" stroke="black" stroke-width="1"></rect>' +
          '<image xlink:href="{{event_info_path}}" x="2" y="2" width="16" height="16"></image>' +
          '<text font-size="12" fill="rgb(0,0,127)" x="20" y="13" >{{eventText}}</text>' +
          '</g>' +
          baseImageStr.onMessageIconStr() +
          '</g>'
      }
    }
    return baseImageStr;
  }
  ])
  .factory('svgRoute', ['$rootScope', '$location', 'svgActivityImgRoute', '$sce', function ($rootScope, $location, svgActivityImgRoute, $sce) {
    var exports = {
      getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      },
      setNodePosition: function (nodes) {

        nodes.forEach(function (node) {
          node.center_dot = {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2
          }
          node.leftAndTop_dot = {
            x: node.x,
            y: node.y
          }
          node.left_dot = {
            x: node.x,
            y: node.y + node.height / 2
          }
          node.leftAndBottom_dot = {
            x: node.x,
            y: node.y + node.height
          }

          node.rightAndTop_dot = {
            x: node.x + node.width,
            y: node.y
          }
          node.right_dot = {
            x: node.x + node.width,
            y: node.y + node.height / 2
          }
          node.rightAndBottom_dot = {
            x: node.x + node.width,
            y: node.y + node.height
          }

          node.top_dot = {
            x: node.x + node.width / 2,
            y: node.y
          }
          node.bottom_dot = {
            x: node.x + node.width / 2,
            y: node.y + node.height
          }

        });
      },
      setElementPosition: function (node) {
        var nodes = [node];
        exports.setNodePosition(nodes);
      },
      setNodeProperty: function (nodes) {

      },
      setLinkProperty: function (links) {
        links.forEach(function (link) {
          var sourceNode, targetNode;
          sourceNode = $rootScope.processSvg.nodeMap[link.source] || link.source;
          targetNode = $rootScope.processSvg.nodeMap[link.target] || link.target;

          if (sourceNode.x < targetNode.x) {
            sourceNode.rightLinks.push(link);
            targetNode.leftLinks.push(link);
            link.direction = 1;
          } else {
            sourceNode.leftLinks.push(link);
            targetNode.rightLinks.push(link);
            link.direction = -1;
          }

          link.id = link.source + '-' + link.target;
          link.source = sourceNode;
          link.target = targetNode;
          sourceNode.sourceLinks.push(link);
          targetNode.targetLinks.push(link);

          if (link.animatedPathSegList) {
            link.pathSegMoveToAbs = {
              x: link.animatedPathSegList.length > 0 ? link.animatedPathSegList[0].x : sourceNode.x,
              y: link.animatedPathSegList.length > 0 ? link.animatedPathSegList[0].y : sourceNode.y
            }
            link.pathSegLineToAbs = {
              x: link.animatedPathSegList.length > 0 ? link.animatedPathSegList[link.animatedPathSegList.length - 1].x : targetNode.x,
              y: link.animatedPathSegList.length > 0 ? link.animatedPathSegList[link.animatedPathSegList.length - 1].y : targetNode.y
            }
          } else {
            link.pathSegMoveToAbs = {
              x: sourceNode.x,
              y: sourceNode.y
            }
            link.pathSegLineToAbs = {
              x: targetNode.x,
              y: targetNode.y
            }
          }
        });
      },
      drawLink: function (ele, moveX, moveY) {
        if (ele.rightLinks.length > 0 && ele.leftLinks.length > 0) {
          // There are lines on both sides
          ele.rightLinks.forEach(function (link) {
            // Calculates the pixels at which the current node moves
            var _M_X = moveX + (link.pathSegMoveToAbs.x - ele.x);
            var _M_Y = moveY + (link.pathSegMoveToAbs.y - ele.y);
            // Set the current element to add the property, when the mouse mouseup set the beginning of the line the end of the table and the end of the coordinates
            ele._M_X_moveTo = _M_X;
            ele._M_Y_moveTo = _M_Y;

            var str = exports.setLinkRightOptions(_M_X, _M_Y, link.pathSegLineToAbs.x, link.pathSegLineToAbs.y);

            var linkEle = d3.select(link);
            if (str != "") {
              linkEle.attr("d", str);
            }
          })
          ele.leftLinks.forEach(function (link) {
            // Calculates the pixels at which the current node moves
            var _M_X = moveX - ele.x + link.pathSegLineToAbs.x;
            var _M_Y = moveY - ele.y + link.pathSegLineToAbs.y;
            // Set the current element to add the property, when the mouse mouseup set the beginning of the line the end of the table and the end of the coordinates
            ele._M_X_lineTo = _M_X;
            ele._M_Y_lineTo = _M_Y;

            var str = exports.setLinkLeftOptions(_M_X, _M_Y, link.pathSegMoveToAbs.x, link.pathSegMoveToAbs.y);
            var linkEle = d3.select(link);
            if (str != "") {
              linkEle.attr("d", str);
            }
          })
        } else if (ele.rightLinks.length > 0 && ele.leftLinks.length <= 0) {
          // There is a line on the right
          ele.rightLinks.forEach(function (link) {
            var str = "";
            // Calculates the pixels at which the current node moves
            var _M_X = moveX + (link.pathSegMoveToAbs.x - ele.x);
            var _M_Y = moveY + (link.pathSegMoveToAbs.y - ele.y);
            // Set the current element to add the property, when the mouse mouseup set the beginning of the line the end of the table and the end of the coordinates
            ele._M_X_moveTo = _M_X;
            ele._M_Y_moveTo = _M_Y;

            exports.computeSourcePosition(link.source, link.target);
            str = exports.setLinkOptions(link.source.lineStartPosition, link.source.lineEdtPosition, link.source);
            var linkEle = d3.select(link);
            if (str != "") {
              linkEle.attr("d", str);
            }
          })
        } else if (ele.rightLinks.length <= 0 && ele.leftLinks.length > 0) {
          // There are lines on the left
          ele.leftLinks.forEach(function (link) {
            var str = "";
            // Calculates the pixels at which the current node moves
            var _M_X = moveX - ele.x + link.pathSegLineToAbs.x;
            var _M_Y = moveY - ele.y + link.pathSegLineToAbs.y;
            // Set the current element to add the property, when the mouse mouseup set the beginning of the line the end of the table and the end of the coordinates
            ele._M_X_lineTo = _M_X;
            ele._M_Y_lineTo = _M_Y;

            exports.computeSourcePosition(link.source, link.target);
            str = exports.setLinkOptions(link.source.lineStartPosition, link.source.lineEdtPosition, link.source);
            var linkEle = d3.select(link);
            if (str != "") {
              linkEle.attr("d", str);
            }
          })
        } else {
          // There are no lines on both sides

        }
      },
      computeSourcePosition: function (source, target) {
        if (source.center_dot.x < target.left_dot.x
          && (source.center_dot.y > target.leftAndTop_dot.y
            && source.center_dot.y < target.leftAndBottom_dot.y)) {
          // The middle point of the source is on the left side of the target, and between the upper and lower points on the left side of the target
          source.lineStartPosition = source.right_dot;
          source.lineEdtPosition = target.left_dot;
          source.route = "r-l"
        } else if (source.center_dot.x > target.right_dot.x
          && (source.center_dot.y > target.rightAndTop_dot.y
            && source.center_dot.y < target.rightAndBottom_dot.y)) {
          // The middle point of the source is on the right side of the target and between the upper and lower points on the left side of the target
          source.lineStartPosition = source.left_dot;
          source.lineEdtPosition = target.right_dot;
          source.route = "l-r"
        } else if (source.center_dot.x < target.leftAndTop_dot.x
          && source.center_dot.y < target.leftAndTop_dot.y) {
          // Upper left corner
          if (source.center_dot.x + 12 >= target.leftAndTop_dot.x) {
            // The upper left corner is above
            source.lineStartPosition = source.left_dot;
            source.lineEdtPosition = target.left_dot;
            source.route = "l-l"
          } else {
            source.lineStartPosition = source.bottom_dot;
            source.lineEdtPosition = target.left_dot;
            source.route = "b-l"
          }
        } else if (source.center_dot.x > target.rightAndTop_dot.x
          && source.center_dot.y < target.rightAndTop_dot.y) {
          // Upper right corner
          if (source.center_dot.x + 12 >= target.rightAndTop_dot.x
            && source.center_dot.x < target.rightAndTop_dot.x + 12) {
            // The upper right corner is above
            source.lineStartPosition = source.right_dot;
            source.lineEdtPosition = target.right_dot;
            source.route = "r-r"
          } else {
            source.lineStartPosition = source.bottom_dot;
            source.lineEdtPosition = target.right_dot;
            source.route = "b-r"
          }
        } else if (source.center_dot.x < target.leftAndBottom_dot.x
          && source.center_dot.y > target.leftAndBottom_dot.y) {
          // Bottom left corner
          if (source.center_dot.x + 12 >= target.leftAndBottom_dot.x) {
            // The lower left corner is below
            source.lineStartPosition = source.left_dot;
            source.lineEdtPosition = target.left_dot;
            source.route = "l-l"
          } else {
            source.lineStartPosition = source.top_dot;
            source.lineEdtPosition = target.left_dot;
            source.route = "t-l"
          }
        } else if (source.center_dot.x > target.rightAndBottom_dot.x
          && source.center_dot.y > target.rightAndBottom_dot.y) {
          // Bottom right corner
          if (source.center_dot.x + 12 >= target.rightAndBottom_dot.x
            && source.center_dot.x < target.rightAndBottom_dot.x + 12) {
            // The lower right corner is below
            source.lineStartPosition = source.right_dot;
            source.lineEdtPosition = target.right_dot;
            source.route = "r-r"
          } else {
            source.lineStartPosition = source.top_dot;
            source.lineEdtPosition = target.right_dot;
            source.route = "t-r"
          }
        } else if (source.center_dot.y < target.top_dot.y
          && (source.center_dot.x > target.leftAndTop_dot.x
            && source.center_dot.x < target.rightAndTop_dot.x)) {
          // The middle point of the source is always above the upper point of the target above the middle point
          source.lineStartPosition = source.bottom_dot;
          source.lineEdtPosition = target.top_dot;
          source.route = "b-t"
        } else if (source.center_dot.y > target.top_dot.y
          && (source.center_dot.x > target.leftAndBottom_dot.x
            && source.center_dot.x < target.rightAndBottom_dot.x)) {
          // The middle point of the source is always in the upper area of ​​the middle point below the target
          source.lineStartPosition = source.top_dot;
          source.lineEdtPosition = target.bottom_dot;
          source.route = "t-b"
        }
      },

      foldOne: ['t-l', 't-r', 'b-l', 'b-r'],
      foldTwo: ['l-r', 'r-l', 't-b', 'b-t', 'l-l', 'r-r'],
      foldTwo_1: ['l-r', 'r-l'],
      foldTwo_2: ['t-b', 'b-t'],
      foldTwo_3: ['l-l', 'r-r'],


      setLinkOptions: function (lineStart, lineEnd, lineSource) {
        var str = "M" + lineStart.x + "," + lineStart.y;
        if (exports.foldOne.indexOf(lineSource.route) > -1) {
          str += "L" + lineStart.x + "," + lineEnd.y;
          str += "L" + lineEnd.x + "," + lineEnd.y;
        } else if (exports.foldTwo.indexOf(lineSource.route) > -1) {

          if (exports.foldTwo_1.indexOf(lineSource.route) > -1) {
            if (lineStart.x > lineEnd.x) {

              str += "L" + ((lineStart.x - lineEnd.x) / 2 + lineEnd.x) + "," + lineStart.y;
              str += "L" + ((lineStart.x - lineEnd.x) / 2 + lineEnd.x) + "," + lineEnd.y;
              str += "L" + lineEnd.x + "," + lineEnd.y;

            } else if (lineStart.x < lineEnd.x) {

              str += "L" + ((lineEnd.x - lineStart.x) / 2 + lineStart.x) + "," + lineStart.y;
              str += "L" + ((lineEnd.x - lineStart.x) / 2 + lineStart.x) + "," + lineEnd.y;
              str += "L" + lineEnd.x + "," + lineEnd.y;
            }

          } else if (exports.foldTwo_2.indexOf(lineSource.route) > -1) {

            if (lineStart.x > lineEnd.x) {
              str += "L" + lineStart.x + "," + ((lineEnd.y - lineStart.y) / 2 + lineStart.y);
              str += "L" + lineEnd.x + "," + ((lineEnd.y - lineStart.y) / 2 + lineStart.y);
              str += "L" + lineEnd.x + "," + lineEnd.y;

            } else if (lineStart.x < lineEnd.x) {
              str += "L" + lineStart.x + "," + ((lineEnd.y - lineStart.y) / 2 + lineStart.y);
              str += "L" + lineEnd.x + "," + ((lineEnd.y - lineStart.y) / 2 + lineStart.y);
              str += "L" + lineEnd.x + "," + lineEnd.y;
            }

          } else if (exports.foldTwo_3.indexOf(lineSource.route) > -1) {

            if (lineStart.x > lineEnd.x) {
              // under
              str += "L" + (lineStart.x + 12) + "," + lineStart.y;
              str += "L" + (lineStart.x + 12) + "," + lineEnd.y;
              str += "L" + lineEnd.x + "," + lineEnd.y;

            } else if (lineStart.x < lineEnd.x) {
              // on
              str += "L" + (lineStart.x - 12) + "," + lineStart.y;
              str += "L" + (lineStart.x - 12) + "," + lineEnd.y;
              str += "L" + lineEnd.x + "," + lineEnd.y;
            }

          }
        } else {

        }

        return str;
      },
      setLinkRightOptions: function (x1, y1, x2, y2) {
        var lineWidth = x2 - x1;
        var str = "M" + x1 + "," + y1;

        if (y1 < y2) {
          // Four nodes below the target point
          var circular = exports.setcircular(y2, y1);

          str += "L" + (x1 - circular + lineWidth / 2) + "," + (y1); //当前

          str += "Q" + (x1 + lineWidth / 2) + "," + y1; //控制节点
          str += " " + (x1 + lineWidth / 2) + "," + (y1 + circular); //结束节点

          str += "L" + (x1 + lineWidth / 2) + "," + (y2 - circular);

          str += "Q" + (x1 + lineWidth / 2) + "," + y2;
          str += " " + (x1 + circular + lineWidth / 2) + "," + (y2);

          str += "L" + x2 + "," + y2;
        } else if (y1 > y2) {
          // Four nodes above the target point
          var circular = exports.setcircular(y1, y2);

          str += "L" + (x1 - circular + lineWidth / 2) + "," + y1; // current

          str += "Q" + (x1 + lineWidth / 2) + "," + y1; // Control node
          str += " " + (x1 + lineWidth / 2) + "," + (y1 - circular); // End node

          str += "L" + (x1 + lineWidth / 2) + "," + (y2 + circular);

          str += "Q" + (x1 + lineWidth / 2) + "," + y2;
          str += " " + (x1 + circular + lineWidth / 2) + "," + (y2);

          str += "L" + x2 + "," + y2;
        } else if (y1 == y2) {
          // The target points are on two nodes in the same line
          str += "L" + x2 + "," + y2;
        } else {

        }
        return str;
      },
      setLinkLeftOptions: function (x1, y1, x2, y2) {
        var lineWidth = x1 - x2;
        var str = "M" + x2 + "," + y2;
        if (y1 < y2) {
          var circular = exports.setcircular(y2, y1);
          // Four nodes at the top of the starting point
          str += "L" + (x2 - circular + lineWidth / 2) + "," + y2;

          str += "Q" + (x2 + lineWidth / 2) + "," + y2;
          str += " " + (x2 + lineWidth / 2) + "," + (y2 - circular);

          str += "L" + (x2 + lineWidth / 2) + "," + (y1 + circular);

          str += "Q" + (x2 + lineWidth / 2) + "," + y1;
          str += " " + (x2 + circular + lineWidth / 2) + "," + y1;

          str += "L" + x1 + "," + y1;
        } else if (y1 > y2) {
          var circular = exports.setcircular(y1, y2);
          // Four nodes below the starting point
          str += "L" + (x2 - circular + lineWidth / 2) + "," + y2;

          str += "Q" + (x2 + lineWidth / 2) + "," + y2;
          str += " " + (x2 + lineWidth / 2) + "," + (y2 + circular);

          str += "L" + (x2 + lineWidth / 2) + "," + (y1 - circular);

          str += "Q" + (x2 + lineWidth / 2) + "," + y1;
          str += " " + (x2 + circular + lineWidth / 2) + "," + y1;

          str += "L" + x1 + "," + y1;
        } else if (y1 == y2) {
          // And the target point on the same line two nodes
          str += "L" + x1 + "," + y1;
        } else {

        }
        return str;
      },
      setcircular: function (num1, num2) {
        var num;
        if (num1 - num2 > 5) {
          num = 5;
        } else if (num1 - num2 <= 5) {
          num = num1 - num2;
        }
        return 1;
      },
      setPoints: function (array) {
        var str = "";
        array.forEach(function (item) {
          var x = item[0];
          var y = item[1];
          if (str == "") {
            str = "M" + x + "," + y;
          } else {
            str = str + "L" + x + "," + y;
          }
        })
        return str;
      },
      getActivityPath: function (path) {
        if (svgActivityImgRoute.imageMap.getPath(path) == "") {
          return "/images/svg/resource/images/emptyActivity_48x48.png"
        }
        return svgActivityImgRoute.imageMap.getPath(path);
      },
      setDirectiveIconInfo: function (scope) {
        scope.collapse_path = exports.getActivityPath("collapse");
        scope.unpin_path = exports.getActivityPath("unpin");
        scope.menu_path = exports.getActivityPath("menu");
        scope.uncollapse_path = exports.getActivityPath("uncollapse");
        scope.group_path = exports.getActivityPath("group");
        scope.collapse_width = 16;
        scope.collapse_height = 16;
        return scope;
      },
      setDirectiveIconPosition: function (scope) {
        scope = exports.setDirectiveIconInfo(scope);
        scope.collapse_x = scope.width * 0.8;
        scope.collapse_y = scope.collapse_height / 2;

        scope.unpin_x = scope.width * 0.8 - 20;
        scope.unpin_y = scope.collapse_y;

        scope.menu_x = scope.width * 0.8 + 18;
        scope.menu_y = scope.collapse_y;

        scope.uncollapse_x = scope.width * 0.8;
        scope.uncollapse_y = scope.collapse_height - 12;

        scope.group_x_uncollapse = scope.width * 0.1;
        scope.group_y_uncollapse = scope.collapse_height - 10;

        return scope;
      },
      setGroupIconPosition: function (scope) {
        scope.group_x = scope.width * 0.1;
        scope.group_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.group_x_uncollapse = scope.width * 0.1;
        scope.group_y_uncollapse = scope.collapse_height - 10;
        return scope;
      },
      setPickIconPosition: function (scope) {
        scope.pick_x = scope.width * 0.1;
        scope.pick_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.pick_x_uncollapse = scope.width * 0.1;
        scope.pick_y_uncollapse = scope.collapse_height - 10;
        return scope;
      },
      setDirectiveIconPosition_compensationHandlerOrScope: function (scope) {
        scope = exports.setDirectiveIconInfo(scope);
        scope.collapse_width = 16;
        scope.collapse_height = 16;
        scope.collapse_x = scope.width * 0.8;
        scope.collapse_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.unpin_x = scope.width * 0.8 - 20;
        scope.unpin_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.menu_x = scope.width * 0.8 + 18;
        scope.menu_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.uncollapse_x = scope.width * 0.8;
        scope.uncollapse_y = scope.collapse_height - 10;
        scope = exports.setGroupIconPosition(scope);

        return scope;
      },
      setDirectiveIconPosition_pick: function (scope) {
        scope = exports.setDirectiveIconInfo(scope);
        scope.collapse_width = 16;
        scope.collapse_height = 16;
        scope.collapse_x = scope.width * 0.8;
        scope.collapse_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.unpin_x = scope.width * 0.8 - 20;
        scope.unpin_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.menu_x = scope.width * 0.8 + 18;
        scope.menu_y = scope.collapse_height / 2 - scope.collapse_height;
        scope.uncollapse_x = scope.width * 0.8;
        scope.uncollapse_y = scope.collapse_height - 10;
        scope = exports.setPickIconPosition(scope);
        return scope;
      },
      setParenerLink: function ($scope) {
        $rootScope.process_x = $scope.x;
        $rootScope.process_y = $scope.y;
        $rootScope.process_w = $scope.width;
        var x = $rootScope.process_x,
          y = $rootScope.process_y,
          w = $rootScope.process_w;
        if ($rootScope.processSvg.parenerLeftLinks.length > 0 || $rootScope.processSvg.parenerRightLinks.length > 0) {
          $scope.partnerlinkFlag = true;
        }
        for (var i = 0; i < $rootScope.processSvg.parenerLeftLinks.length; i++) {
          var parenerLink = $rootScope.processSvg.parenerLeftLinks[i];
          parenerLink.menuStr = exports.getActivityPath("menu");

          parenerLink.width = 150;
          parenerLink.height = (parenerLink.subTab ? parenerLink.subTab.length : 0) * 20;
          parenerLink.x = -parenerLink.width * (2 / 3);
          parenerLink.imageIcon_width = 45;
          parenerLink.imageIcon_height = 32;
          parenerLink.imageIconX = parenerLink.width * (2 / 3) - parenerLink.imageIcon_width / 2;
          parenerLink.imageIconY = 0;
          parenerLink.menuImageIconX = parenerLink.width - 10;
          parenerLink.menuImageIconY = 0;
          parenerLink.name_x = 6;
          parenerLink.name_y = parenerLink.imageIcon_height / 2;
          parenerLink.name_width = parenerLink.width / 2;
          parenerLink.subTabWidth = 150;
          parenerLink.subTabHeight = (parenerLink.subTab ? parenerLink.subTab.length : 0) * 20;

          parenerLink.menu_x = parenerLink.width - 21;
          parenerLink.menu_y = 0;

          parenerLink.url = exports.getActivityPath("parenerLeft");
          parenerLink.menuStr = exports.getActivityPath("menu");
          parenerLink.parenerSubLeft_LeftImgStr = exports.getActivityPath("onEvent");
          parenerLink.parenerSubLeft_RightImgStr = exports.getActivityPath("constructorOperation");

          parenerLink.left = true;

          if (parenerLink.partnertype) {
            parenerLink.RestImageStr = exports.getActivityPath(parenerLink.partnertype);
            parenerLink.RestImage_x = parenerLink.imageIconX + parenerLink.imageIcon_width / 2 - 8;
            parenerLink.RestImage_y = parenerLink.imageIconY + parenerLink.imageIcon_height / 2 - 8;
            parenerLink.showrestImage = true;
          } else {
            parenerLink.showrestImage = false;
          }

          if (i == 0) {
            parenerLink.y = 50;
          } else {
            parenerLink.y = $rootScope.processSvg.parenerLeftLinks[i - 1].y + $rootScope.processSvg.parenerLeftLinks[i - 1].height + 50;
          }
        }

        for (var i = 0; i < $rootScope.processSvg.parenerRightLinks.length; i++) {
          var parenerLink = $rootScope.processSvg.parenerRightLinks[i];
          parenerLink.menuStr = exports.getActivityPath("menu");
          parenerLink.width = 150;
          parenerLink.height = (parenerLink.subTab ? parenerLink.subTab.length : 0) * 20;

          parenerLink.x = w - parenerLink.width * (1 / 3);
          parenerLink.imageIcon_width = 45;
          parenerLink.imageIcon_height = 32;
          parenerLink.imageIconX = parenerLink.width * (1 / 3) - parenerLink.imageIcon_width / 2;
          parenerLink.imageIconY = 0;
          parenerLink.menuImageIconX = 10;
          parenerLink.menuImageIconY = 0;
          parenerLink.name_x = parenerLink.imageIconX + parenerLink.imageIcon_width + 20;
          parenerLink.name_y = parenerLink.imageIcon_height / 2;
          parenerLink.name_width = parenerLink.width / 2;
          parenerLink.subTabWidth = 150;
          parenerLink.subTabHeight = (parenerLink.subTab ? parenerLink.subTab.length : 0) * 20;
          parenerLink.menu_x = 2;
          parenerLink.menu_y = 0;
          parenerLink.url = exports.getActivityPath("parenerRight");
          parenerLink.menuStr = exports.getActivityPath("menu");
          parenerLink.parenerSubLeft_LeftImgStr = exports.getActivityPath("onEvent");
          parenerLink.parenerSubLeft_RightImgStr = exports.getActivityPath("constructorOperation");
          parenerLink.left = false;
          if (i == 0 || $rootScope.processSvg.parenerLeftLinks.length === 0) {
            parenerLink.y = 50;
          } else {
            parenerLink.y = $rootScope.processSvg.parenerLeftLinks[i - 1].y + $rootScope.processSvg.parenerRightLinks[i - 1].height + 50;
          }
        }
        $scope.partnerLinksNew = $rootScope.processSvg.parenerLeftLinks.concat($rootScope.processSvg.parenerRightLinks);
        return $scope;
      },
      getTextWidth: function (str, fontsize) {
        var span = document.getElementById("__getwidth");
        if (span == null) {
          span = document.createElement("span");
          span.id = "__getwidth";
          document.body.appendChild(span);
          span.style.visibility = "hidden";
          span.style.whiteSpace = "nowrap";
        }
        span.innerHTML = str;
        span.style.fontSize = fontsize + "px";

        return span.offsetWidth;
      },
      getByScopeId: function (id) {
        var filterfn = function (i, el) {
          var sc = angular.element(el).scope();

          return sc && sc.$id == id;
        };
        // low hanging fruit -- actual scope containers
        var result = $('.ng-scope').filter(filterfn);
        if (result && result.length) return result;

        // try again on everything...ugh
        return $(':not(.ng-scope)').filter(filterfn);
      },
      setUnknowActivityImg: function (unknowActivityMap, nodeMap) {
        for (var unknowactivity in unknowActivityMap) {
          var unknowactivityImageStr = unknowActivityMap[unknowactivity];
          nodeMap.forEach(function (item, i) {
            if (item.type == unknowactivity) {
              var unknowactivityScope = exports.getByScopeId(item.scopeId).scope();
              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
              try{
                unknowactivityScope.activityPath = "data:image/png;base64," + unknowactivityImageStr;
              } catch (exception) {
                console.warn("Not able to get activity data");
              }
            }
          })
        }
      }
    };
    return exports;
  }])
  .factory('applicationProcessDiagramTabs', ['$rootScope', function ($rootScope) {
    var processTabsHeader = [];
    var objType = $rootScope.objType;
    var objView = $rootScope.objView;
    processTabsHeader = {
      "graph": [
        { label: "Process Instrumentation", property: "processinfo", focused: true, showFlag: true },
        { label: "Activity Instrumentation", property: "activityinfo", focused: false, showFlag: false }
      ],
      "default":
        [{ label: "general", property: "general", focused: true, showFlag: true }
          /*{label: "input data", property:"inputdata", focused: false},
           {label: "output data", property:"outputdata", focused: false},
           {label: "mapping", property:"mapping", focused: false},
           {label: "configuration", property:"configuration", focused: false}*/
        ]
    }
    var toReturn = {
      processTabsHeader: processTabsHeader
    }
    return toReturn;
  }])
  .factory('apparchiveProcessDiagramTabs', [function () {
    var processTabsHeader = [
      { label: "general", property: "general", focused: true },
      /*{label: "mapping", property:"mapping", focused: false},
      {label: "configuration", property:"configuration", focused: false}*/
    ]

    var toReturn = {
      processTabsHeader: processTabsHeader
    }

    return toReturn;
  }])
  .factory('xmlToJson', [function () {
    var fromXmlStr = function (xml, rstr) {
      if (window.DOMParser) {
        var getxml = new DOMParser();
        var xmlDoc = getxml.parseFromString(xml, "text/xml");
      }
      else {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
      }

      // get JSON string
      var json_str = jsontoStr(setJsonObj(xmlDoc));

      return (typeof (rstr) == 'undefined') ? JSON.parse(json_str) : json_str;
    }

    var setJsonObj = function (xml) {
      var js_obj = {};
      if (xml.nodeType == 1) {
        if (xml.attributes.length > 0) {
          js_obj["@attributes"] = {};
          for (var j = 0; j < xml.attributes.length; j++) {
            var attribute = xml.attributes.item(j);
            js_obj["@attributes"][attribute.nodeName] = attribute.value;
          }
        }
      } else if (xml.nodeType == 3) {
        js_obj = xml.nodeValue;
      }
      if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof (js_obj[nodeName]) == "undefined") {
            js_obj[nodeName] = setJsonObj(item);
          } else {
            if (typeof (js_obj[nodeName].push) == "undefined") {
              var old = js_obj[nodeName];
              js_obj[nodeName] = [];
              js_obj[nodeName].push(old);
            }
            js_obj[nodeName].push(setJsonObj(item));
          }
        }
      }
      return js_obj;
    }

    var jsontoStr = function (js_obj) {
      var rejsn = JSON.stringify(js_obj, undefined, 2).replace(/(\\t|\\r|\\n)/g, '').replace(/"",[\n\t\r\s]+""[,]*/g, '').replace(/(\n[\t\s\r]*\n)/g, '').replace(/[\s\t]{2,}""[,]{0,1}/g, '').replace(/"[\s\t]{1,}"[,]{0,1}/g, '').replace(/\[[\t\s]*\]/g, '""');
      return (rejsn.indexOf('"parsererror": {') == -1) ? rejsn : 'Invalid XML format';
    }

    return {
      fromXmlStr: fromXmlStr
    }

  }]).factory('inputOutputFormatter', [function () {
    var processData = {};
    var copyToClipboard = function (data, type) {
      var dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.setAttribute("id", "dummy_id");
      var copytext = '';
      if (data && 'input' === type) {
        copytext = data[0].input;
      } else if (data && 'output' === type) {
        copytext = data[0].output;
      } else {
        copytext = data;
      }
      document.getElementById("dummy_id").value = copytext;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    };

    var downloadInputOutput = function (data, type, activityName) {
      var contentType = 'application/xml';
      var a = document.createElement('a');
      var filename = 'default.xml';
      var downloadData = data;
      if (data && 'input' === type) {
        if (activityName) {
          filename = activityName + '_input.xml';
        } else {
          filename = 'input.xml';
        }
        downloadData = data[0].input;
      } else if (data && 'output' === type) {
        if (activityName) {
          filename = activityName + '_output.xml';
        } else {
          filename = 'output.xml';
        }
        downloadData = data[0].output;
      }
      var blob = new Blob([downloadData], { 'type': contentType });
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    };
    var xmlToJson = function (xml, tab) {
      var X = {
        toObj: function (xml) {
          var o = {};
          if (xml.nodeType == 1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
              for (var i = 0; i < xml.attributes.length; i++)
                o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
            if (xml.firstChild) { // element has child nodes ..
              var textChild = 0, cdataChild = 0, hasElementChild = false;
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                if (n.nodeType == 1) hasElementChild = true;
                else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                else if (n.nodeType == 4) cdataChild++; // cdata section node
              }
              if (hasElementChild) {
                if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                  X.removeWhite(xml);
                  for (var n = xml.firstChild; n; n = n.nextSibling) {
                    if (n.nodeName === 'inputBinding' || n.nodeName === 'partBinding') {
                      continue;
                    } else {
                      if (n.nodeType == 3)  // text node
                        o["#text"] = X.escape(n.nodeValue);
                      else if (n.nodeType == 4)  // cdata node
                        o["#cdata"] = X.escape(n.nodeValue);
                      else if (o[n.nodeName]) {  // multiple occurence of element ..
                        if (o[n.nodeName] instanceof Array)
                          o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                        else
                          o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                      }
                      else  // first occurence of element..
                        o[n.nodeName] = X.toObj(n);
                    }
                  }
                }
                else { // mixed content
                  if (!xml.attributes.length)
                    o = X.escape(X.innerXml(xml));
                  else
                    o["#text"] = X.escape(X.innerXml(xml));
                }
              }
              else if (textChild) { // pure text
                if (!xml.attributes.length)
                  o = X.escape(X.innerXml(xml));
                else
                  o["#text"] = X.escape(X.innerXml(xml));
              }
              else if (cdataChild) { // cdata
                if (cdataChild > 1)
                  o = X.escape(X.innerXml(xml));
                else
                  for (var n = xml.firstChild; n; n = n.nextSibling)
                    o["#cdata"] = X.escape(n.nodeValue);
              }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType == 9) { // document.node
            o = X.toObj(xml.documentElement);
          }
          else
            alert("unhandled node type: " + xml.nodeType);
          return o;
        },
        toJson: function (o, name, ind) {
          String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
          };
          var json = name ? ("\"" + name + "\"") : "";
          if (o instanceof Array) {
            for (var i = 0, n = o.length; i < n; i++)
              o[i] = X.toJson(o[i], "", ind + "\t");
            json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
          }
          else if (o == null)
            json += (name && ":") + "null";
          else if (typeof (o) == "object") {
            var arr = [];
            for (var m in o)
              arr[arr.length] = X.toJson(o[m], m, ind + "\t");
            json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
          }
          else if (typeof (o) == "string"){
           o = o.replaceAll("\n","").replaceAll("\r","").replaceAll("&quot;", "");
           json += (name && ":") + "\"" + o.toString().replace(/\"/g, "") + "\"";
          } else
            json += (name && ":") + o.toString().replace(/\"/g, "");
          return json;
        },
        innerXml: function (node) {
          var s = ""
          if ("innerHTML" in node)
            s = node.innerHTML;
          else {
            var asXml = function (n) {
              var s = "";
              if (n.nodeType == 1) {
                s += "<" + n.nodeName;
                for (var i = 0; i < n.attributes.length; i++)
                  s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                if (n.firstChild) {
                  s += ">";
                  for (var c = n.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
                  s += "</" + n.nodeName + ">";
                }
                else
                  s += "/>";
              }
              else if (n.nodeType == 3)
                s += n.nodeValue;
              else if (n.nodeType == 4)
                s += "<![CDATA[" + n.nodeValue + "]]>";
              return s;
            };
            for (var c = node.firstChild; c; c = c.nextSibling)
              s += asXml(c);
          }
          return s;
        },
        escape: function (txt) {
          return txt.replace(/[\\]/g, "\\\\")
            .replace(/[\"]/g, '\\"')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r');
        },
        removeWhite: function (e) {
          e.normalize();
          for (var n = e.firstChild; n;) {
            if (n.nodeType == 3) {  // text node
              if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                var nxt = n.nextSibling;
                e.removeChild(n);
                n = nxt;
              }
              else
                n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
              X.removeWhite(n);
              n = n.nextSibling;
            }
            else                      // any other node
              n = n.nextSibling;
          }
          return e;
        }
      };
      if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
      var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
      return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";

    }


    var parseXml = function (xml) {
      var dom = null;
      if (window.DOMParser) {
        try {
          dom = (new DOMParser()).parseFromString(xml, "text/xml");
        }
        catch (e) { dom = null; }
      }
      else if (window.ActiveXObject) {
        try {
          dom = new ActiveXObject('Microsoft.XMLDOM');
          dom.async = false;
          if (!dom.loadXML(xml)) // parse error ..

            window.alert(dom.parseError.reason + dom.parseError.srcText);
        }
        catch (e) { dom = null; }
      }
      else
        alert("cannot parse xml string!");
      return dom;
    }



    return {
      xmlToJson: xmlToJson,
      parseXml: parseXml,
      downloadInputOutput: downloadInputOutput,
      copyToClipboard: copyToClipboard

    }
  }])

