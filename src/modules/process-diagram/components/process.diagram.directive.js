// 'use strict';
var d3 = require('d3');
var jQuery = require('jquery');
var selectedActivity = '';
angular.module('monitor.process.diagram')
  .directive('generalTabContent', ["$rootScope", 'prepareDataForProcessInfoService', function ($rootScope, prepareDataForProcessInfoService) {
    return {
      restrict: 'E',
      template: require('../partials/general-tab-content.html'),
      replace: true,
      scope: {
        data: "="
      },
      link: function (scope, el, attr) {
        scope.InfoData = prepareDataForProcessInfoService.parseXmlString(scope.data);
      }
    }
  }])

  .directive('activityTabContent', ["$rootScope", 'prepareDataForProcessInfoService', function ($rootScope, prepareDataForProcessInfoService) {
    return {
      restrict: 'E',
      template: require('../partials/activity-tab-content.html'),
      // replace: true,
      scope: {
        data: "="
      },
      link: function (scope, el, attr) {
        scope.activityInstInfoOfGraphView = scope.data;
        var showActivityInfoDestroyFn = scope.$on('showActivityInfo', function (event, data) {
          if (data.length > 1) {
            data.forEach(function (value) {
              if (value.activityName === selectedActivity) {
                scope.activityInstInfoData = value;
              }
            })
          } else {
            scope.activityInstInfoData = data;
          }
          scope.lastUpdateTime = Date.now();
        });
        scope.refreshGridData = function () {
          $rootScope.$broadcast('setActivityInfo', function (data) {
            data.forEach(function (value) {
              if (value.activityName === selectedActivity) {
                scope.activityInstInfoData = value;
                scope.lastUpdateTime = Date.now();
              }
            })
            activityInstInfoData = data;

          });
        }
        // scope.$on('$destroy', ()=> {
        //     showActivityInfoDestroyFn();
        // });
      }
    }
  }])


  .directive('dragPanel', function () {
    return {
      restrict: 'A',
      link: function (scope, ele) {
        var parentWidth,
          moveX,
          dragging,
          doc = document,
          showTag = true,
          prevEle = ele.prev(),
          nextEle = ele.next(),
          theMarLeftOfnextEleAfterClickHide,
          parentOffsetLeft;

        ele.bind('mousedown', function () {
          //if left panel is hide  we can't move the dragPanel.
          if (!showTag) return;
          dragging = true;
          parentWidth = ele.parent().width();
          parentOffsetLeft = ele.parent().offset().left;
        });
        doc.onmousemove = function (ev) {
          ev.preventDefault();

          if (dragging) {
            moveX = ev.pageX;
            var lefte = parentWidth + parentOffsetLeft;

            // 160 is the min-width of the left Panel
            if (parentOffsetLeft + 160 < moveX && moveX < lefte) {
              //'138' is the parent's offset().left
              ele.css('left', moveX - parentOffsetLeft + 'px');
              prevEle.width(moveX - parentOffsetLeft + 'px');
              nextEle.width(parentWidth - (moveX - parentOffsetLeft + 1) + 'px');
              nextEle.css('margin-left', moveX - parentOffsetLeft + 'px');

            } else if (moveX <= parentOffsetLeft + 160) {
              // the min-width of left panel is 162px include border.
              ele.css('left', '162px');
              //when mousemove very fast,need reset the  of panel and main div
              prevEle.width('162px');
              nextEle.css('margin-left', '168px');
              nextEle.width(parentWidth - 169 + 'px');

            } else if (lefte <= moveX) {
              return false;
            }

          }
          // dragging = false;
        }
        doc.onmouseup = function (ev) {
          dragging = false;
        }
        ele.children('button').click(function () {
          dragging = false;

          //if tag is true,then hide the left panel,otherwise show them.
          if (showTag) {
            //save the current marginLeft of the next Element.
            theMarLeftOfnextEleAfterClickHide = nextEle.css('margin-left');
            prevEle.width('0px')
            prevEle.css('min-width', '0px')
            ele.css('left', '0px');
            ele.css('cursor', 'default')
            nextEle.css('width', parentWidth - 6 + 'px');
            nextEle.css('margin-left', '6px');
            jQuery(this).find('i').removeAttr('class').addClass('arrow_right');
            showTag = false;

          } else {
            theMarLeftOfnextEleAfterClickHide = parseInt(theMarLeftOfnextEleAfterClickHide);
            prevEle.width(theMarLeftOfnextEleAfterClickHide - 6 + 'px')
            ele.css('left', theMarLeftOfnextEleAfterClickHide - 6 + 'px')
            ele.css('cursor', 'ew-resize')
            nextEle.width(parentWidth - theMarLeftOfnextEleAfterClickHide - 1 + 'px');
            nextEle.css('margin-left', theMarLeftOfnextEleAfterClickHide + 'px');
            jQuery(this).find('i').removeAttr('class');
            showTag = true;
          }

        })
      }
    }
  })

  .directive('bwSlider', ["$state", '$rootScope', '$timeout', '$document', 'makeSvgDiagramAlwaysCenter', function ($state, $rootScope, $timeout, $document, makeSvgDiagramAlwaysCenter) {
    return {
      restrict: 'A',
      scope: {
        svgData: "=",
        delayFlag: '=',
        processDelayFlag: "="
      },
      template: '<div class="bw-slider" ng-class="{crudDisabled: !svgData.length}">'
        + '<div class="zoom-button out" ng-click="zoomOut()" title="zoom out"><i class="bw_icons_s-slider-zoom-in" ng-class="{active: zoomOutActiveFlag}"></i></div><input class="zoom-range bw_icon_s-slider-thumb" type="range" min="0" max="10" step="0.1" ng-model="currZoom"><div class="zoom-button in" ng-click="zoomIn()" title="zoom in"><i class="bw_icons_s-slider-zoom-out" ng-class="{active: zoomInActiveFlag}"></i></div>'
        + '</div>',
      link: function (scope) {

        var DefaultRange = 5.0;

        var getSupportedProp = function (propArray) {
          var root = $document[0].documentElement;
          for (var i = 0; i < propArray.length; i++) {
            if (propArray[i] in root.style) {
              return propArray[i]
            }
          }

        }

        var changeCssProperty = function (element, cssTransform, value) {
          if (typeof cssTransform != "undefined") {
            element.style[cssTransform] = value;
            $timeout(function () {
              makeSvgDiagramAlwaysCenter.init(scope);
            }, 300)
          }
        }

        var scaleSvgDiagram = function (scope, size) {
          var id;
          if ($state.current.name=== 'applications.application.defaultDetails.processInfo') {
            id = '#svgDataDiagram';
          } else {
            id = '#svgDataDiagramTransition';
          }
          var selector = id + ' svg';
          var svgObject = scope.svgData ? jQuery(selector)[0].childNodes[0] : jQuery(".empty-diagram")[0];
          var cssTransform = getSupportedProp(['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform']);
          size = ((DefaultRange - size) / 10).toFixed(1);
          size = 1 - size;
          var scaleSize = "scale(" + size + ")";
          jQuery(id).css('width', '100%');
          changeCssProperty(svgObject, cssTransform, scaleSize);
        }

        scope.$watch('svgData', function (newV, oldV) {
          if (newV !== oldV) {
            scope.currZoom = DefaultRange;
          }
        })

        var promise;

        scope.$watch('currZoom', function (newV, oldV) {

          if (typeof newV === 'string') {
            $timeout.cancel(promise);

            promise = $timeout(function () {
              scope.currZoom = parseFloat(newV);
              scaleSvgDiagram(scope, scope.currZoom);
            });

          }
        });

        scope.zoomOut = function () {
          scope.zoomOutActiveFlag = true;
          scope.zoomInActiveFlag = false;

          if (scope.currZoom > 1) {
            scope.currZoom = parseFloat((scope.currZoom - 1).toFixed(1));
          } else if (scope.currZoom <= 1) {
            scope.currZoom = 0;
          }

          scaleSvgDiagram(scope, scope.currZoom);
        };

        scope.zoomIn = function () {
          scope.zoomInActiveFlag = true;
          scope.zoomOutActiveFlag = false;

          if (scope.currZoom >= 10) {
            scope.currZoom = 10;
          } else {
            scope.currZoom = parseFloat((scope.currZoom + 1).toFixed(1));
          }
          scaleSvgDiagram(scope, scope.currZoom);
        };


      }
    }
  }])


  .directive('processDiagram', ['$rootScope', '$compile','initSvgObject', 'prepareDataForProcessInfoService', 'processDiagramInfoServer', 'globalVariables', function ($rootScope, $compile, initSvgObject, prepareDataForProcessInfoService, processDiagramInfoServer, globalVariables) {
    return {
      restrict: 'E',
      priority: 200,
      scope: {
        svgData: '=',
        currentSvgData: '=',
        activityData: '=',
        transitionData: '='
      },

      link: function (scope, element, attr) {
        scope.$watch('activityData', function (newV, oldV) {
          initSvgObject.init();
          scope.svgData = scope.currentSvgData;
          $rootScope.uniqueActivity4002ReplyForService = [];
          $rootScope.isActivityClicked = false;
          var xmlDoc = StringToXML(scope.svgData);
          if (xmlDoc.getElementsByTagName('parsererror').length) {
            var element = xmlDoc.getElementsByTagName("parsererror"), index;

            for (index = element.length - 1; index >= 0; index--) {
              element[index].parentNode.removeChild(element[index]);
            }

          }
          var activityDir = xmlDoc.getElementsByTagName("activity-dir");
          var linkDir = xmlDoc.getElementsByTagName("link-dir");
          var catchAll = xmlDoc.getElementsByTagName("catch-all");
          var singleCatch = xmlDoc.getElementsByTagName("catch");

          if (newV && (newV !== oldV) && scope.activityData) {
            for (var i = 0; i < catchAll.length; i++) {
              if (highlightCatchAllBlock(i, catchAll)) {
                xmlDoc.getElementsByTagName("catch-all")[i].setAttribute("color", "#5cb85c");
                xmlDoc.getElementsByTagName("catch-all")[i].setAttribute("stroke-width", "2px");
              }
            }

            for (var i = 0; i < singleCatch.length; i++) {
              if (highlightCatchAllBlock(i, singleCatch)) {
                xmlDoc.getElementsByTagName("catch")[i].setAttribute("color", "#5cb85c");
                xmlDoc.getElementsByTagName("catch")[i].setAttribute("stroke-width", "2px");
              }
            }

            if (scope.transitionData && scope.transitionData.length > 0) {
              for (var i = 0; i < linkDir.length; i++) {
                var colorLinkFlag = false;
                for (var j = 0; j < scope.transitionData.length; j++) {
                  if (linkDir[i].getAttribute('name') === scope.transitionData[j].transitionname) {
                    colorLinkFlag = true;
                  }
                }
                if (colorLinkFlag) {
                  var color = '#5cb85c';
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("color", color);
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("stroke-width", "2px");
                  colorizeArrow(i, color);
                } else {
                  var color = '#d3d3d3';
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("color", color);
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("stroke-width", "2px");
                  colorizeArrow(i, color);
                }
              }
            } else {
              for (var i = 0; i < linkDir.length; i++) {
                if (checkLink(linkDir[i].getAttribute('source'), linkDir[i].getAttribute('target'), linkDir[i].getAttribute('name'), activityDir)) {
                  var color = '#5cb85c';
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("color", color);
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("stroke-width", "2px");
                  colorizeArrow(i, color);
                } else {
                  var color = '#d3d3d3';
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("color", color);
                  xmlDoc.getElementsByTagName("link-dir")[i].setAttribute("stroke-width", "2px");
                  colorizeArrow(i, color);
                }
              }
            }
            scope.activityData.forEach(function (data) {
              if (data.activitystate === "FAULTED") {
                var index = findIndex(data.activityname, activityDir);
                if (index || index === 0) {
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#c9302c');
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('color', '#00007f');
                }
              } else if (data.activitystate === "COMPLETED") {
                var index = findIndex(data.activityname, activityDir);
                if (index || index === 0) {
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#fff');
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('color', '#5cb85c');
                }
              } else if (data.activitystate === "CANCELLED") {
                var index = findIndex(data.activityname, activityDir);
                if (index || index === 0) {
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#ec971f');
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#00007f');
                }
              } else if (data.activitystate === "STARTED") {
                var index = findIndex(data.activityname, activityDir);
                if (index || index === 0) {

                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#5bc0de')
                  xmlDoc.getElementsByTagName('activity-dir')[index].setAttribute('bgcolor', '#00007f')
                }
              }
            });

            scope.svgData = XMLToString(xmlDoc);
            scope.createDiagram();


          }
        })
        var StringToXML = function (oString) {
          //code for IE
          if (window.ActiveXObject) {
            var oXML = new ActiveXObject("Microsoft.XMLDOM");
            oXML.loadXML(oString);
            return oXML;
          }
          // code for Chrome, Safari, Firefox, Opera, etc.
          else {
            return (new DOMParser()).parseFromString(oString, "text/xml");
          }
        }
        var XMLToString = function (oXML) {
          //code for IE
          if (window.ActiveXObject) {
            var oString = oXML.xml;
            return oString;
          }
          // code for Chrome, Safari, Firefox, Opera, etc.
          else {
            return (new XMLSerializer()).serializeToString(oXML);
          }
        }
        var findIndex = function (activityName, activityDir) {
          for (var i = 0; i < activityDir.length; i++) {
            if (activityName == activityDir[i].getAttribute('name')) {
              return i;
            }
          }
        }
        var colorizeArrow = function (index, x) {
          var svg = d3.select("#svgContainer");
          var marker = document.getElementById("markerArrow" + x);
          // var svg = d3.Sell
          if (!marker) {
            svg.append("svg:defs")
              .append('svg:marker')
              .attr('id', id)
              .attr('orient', 'auto')
              .attr('viewBox', '-5 -5 10 10')
              .attr('refX', 4)
              .attr('markerWidth', 8)
              .attr('markerHeight', 8)
              .append('svg:path')
              .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
              .attr('fill', x)
          }
        }

        var checkLink = function (source, target, linkName, activityDir) {
          var obj = {};
          for (var i = 0; i < activityDir.length; i++) {
            if (activityDir[i].getAttribute('id') === source) {
              obj.source = activityDir[i].getAttribute('name');
            }
            if (activityDir[i].getAttribute('id') === target) {
              obj.target = activityDir[i].getAttribute('name');
            }
          }
          var decessionObj = {};
          scope.activityData.forEach(function (data) {
            if (data.activityname === obj.source) {
              decessionObj.isSource = true;
            }
            if (data.activityname === obj.target) {
              decessionObj.isTarget = true;
            }
          });
          if (decessionObj.isSource && decessionObj.isTarget) {
            return true;
          } else return false;
        }

        var highlightCatchAllBlock = function (index, catchBlock) {
          var activityDirInCatchBlock = StringToXML(catchBlock[index].innerHTML).getElementsByTagName("activity-dir");
          var status = false;
          for (var j = 0; j < activityDirInCatchBlock.length; j++) {
            scope.activityData && scope.activityData.every(function (data) {
              if (activityDirInCatchBlock[j].getAttribute('name') === data.activityname) {
                status = true;
                j = activityDirInCatchBlock.length;
              } else return true;
            });
          }
          return status;

        }

        scope.getProcessActivityInfo = function () {
          var data = processDiagramInfoServer.getProcessData();
          var selectProcess = processDiagramInfoServer.getProcessDataByKey("selectProcess");
          if (selectProcess) {
            mainModelViewDataQueryService.getActivityInstrumentationStatisticsForProcessOfLevel2(selectProcess).then(function (data) {
              var appnode = processDiagramInfoServer.getProcessDataByKey("selectAppnode");
              if (appnode) {
                $scope.activityStatsStatusList = data[appnode];
              } else {
                var newObj = [];
                for (var d in data) {
                  var obj = data[d]; // one appnode
                  //foreach on appnode
                  obj.forEach(function (item, i) {
                    newObj.push(utils.dataFilter(item));
                  })
                }
                $scope.activityStatsStatusList = newObj;
              }
              $scope.loading_flag = false;
            })
          } else {
            //todo
          }

        }
        var selectOnProcessActivityDestroyFn = scope.$on('selectOnProcessActivity', function (event, object) {
          $rootScope.$broadcast('activityInputOutput', { selectedActivity: object.value });
          $rootScope.$broadcast('setActivityInfo', function (data) {
            data.forEach(function (value) {
              if (value.activityName === object.value) {
                $rootScope.$broadcast('showActivityInfo', value);
              }
            });
            activityInstInfoData = data;

          });
        });
        var processSelectedDestroyFn = scope.$on('processSelected', function (event, obj) {
          scope.svgData = obj;
          scope.createDiagram();
        });

        // scope.$on('$destroy', ()=> {
        //     selectOnProcessActivityDestroyFn();
        //     processSelectedDestroyFn();
        // });
        scope.$watch('processSvg.currentNode', function (newV, oldV) {
          if (newV && oldV) {
            if (newV == oldV) {
              return;
            } else {

              var rect_new = $(newV).find('rect');
              var rect_old = $(oldV).find('rect');
              if (rect_new) {
                rect_new.attr("stroke", "black");
                rect_new.attr("stroke-width", "2");
              }
              if (rect_old) {
                rect_old.attr("stroke-width", "0");
              }
            }
          } else if (newV && oldV == null) {
            var rect_new = $(newV).find('rect');
            if (rect_new) {
              rect_new.attr("stroke", "black");
              rect_new.attr("stroke-width", "2");
            }
          }
        })
        scope.formatXML = function (xml) {
          var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
          var wsexp = / *(.*) +\n/g;
          var contexp = /(<.+>)(.+\n)/g;
          xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
          var pad = 0;
          var formatted = '';
          var lines = xml.split('\n');
          var indent = 0;
          var lastType = 'other';
          // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
          var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
          };

          for (var i = 0; i < lines.length; i++) {
            var ln = lines[i];
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            var padding = '';

            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++) {
              padding += '\t';
            }
            if (fromTo == 'opening->closing')
              formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            else
              formatted += padding + ln + '\n';
          }

          return formatted;
        };

        scope.createDiagram = function () {
          var div = document.createElement('div');
          $(div).attr('id', 'svgContainer_div');
          if ($('#svgContainer_div').html() != null) {
            $('#svgContainer_div').empty();
          }
          if (globalVariables.processTabViewType === 'instanceInfo') {
            $(div).css({
              "overflow-x": "auto",
              "max-height": "300px"
            })

          } else {
            $(div).css({
              "overflow-x": "auto",
              "max-height": "583px"
            })

          }

          div.innerHTML = '<svg id="svgContainer" style="min-height:583px;width:200%;overflow-x: auto"><g><g id="svgDragObject">' + scope.svgData + '</g></g></svg>';
          element.html(div);
          var svg = d3.select("#svgContainer");
          var markerGrey = document.getElementById("markerArrow#d3d3d3");
          if (!markerGrey) {
            svg.append("svg:defs")
              .append('svg:marker')
              .attr('id', 'markerArrow#d3d3d3')
              .attr('orient', 'auto')
              .attr('viewBox', '-5 -5 10 10')
              .attr('refX', 4)
              .attr('markerWidth', 8)
              .attr('markerHeight', 8)
              .append('svg:path')
              .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
              .attr('fill', '#d3d3d3')
          }
          var markerGreen = document.getElementById("markerArrow#5cb85c");
          if (!markerGreen) {
            svg.append("svg:defs")
              .append('svg:marker')
              .attr('id', 'markerArrow#5cb85c')
              .attr('orient', 'auto')
              .attr('viewBox', '-5 -5 10 10')
              .attr('refX', 4)
              .attr('markerWidth', 8)
              .attr('markerHeight', 8)
              .append('svg:path')
              .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
              .attr('fill', '#5cb85c')
          }
          var markerBlack = document.getElementById("markerArrow#000");
          if (!markerBlack) {
            svg.append("svg:defs")
              .append('svg:marker')
              .attr('id', 'markerArrow#000')
              .attr('orient', 'auto')
              .attr('viewBox', '-5 -5 10 10')
              .attr('refX', 4)
              .attr('markerWidth', 8)
              .attr('markerHeight', 8)
              .append('svg:path')
              .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
              .attr('fill', 'black')
          }
          var gg = d3.select("#svgContainer #svgDragObject");
          var zoom = d3.zoom();
          if (globalVariables.processTabViewType === 'instanceInfo') {
            gg.attr("transform", "scale(0.6)");
          } else {
            gg.attr("transform", "scale(1)");
          }
          $rootScope.$on('selectedProcess', function (event, obj) {
            if (globalVariables.processTabViewType === 'instanceInfo') {
              $(div).css({
                "overflow-x": "auto",
                "max-height": "300px"
              })
              gg.attr("transform", "scale(0.6)");
            } else {
              $(div).css({
                "overflow-x": "auto",
                "max-height": "583px"
              })
              gg.attr("transform", "scale(1)");
            }
          })
          element[0].onclick = function (event) {
            $(element).css("cursor", "move")
            svg.call(zoom.scaleExtent([0.5, 5]).on("zoom", function () {
              gg.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
            }));
            element[0].onmouseout = function () {
              $(element).css('cursor', 'default')
              svg.on(".zoom", null);
              $("element").scroll();
            }
            event.stopPropagation();
          }

          $compile(div)($rootScope);

        }
        scope.createDiagram();

      }
    }

  }])
  .directive('processDir', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseTemplateStr(),
      scope: {
        x: '=',
        y: '=',
        width: '@',
        height: '@',
        id: '=',
        name: '@'
      },
      replace: true,
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', 'svgRoute', function ($scope, $element, $attrs, $transclude, svgRoute) {
        var a = $transclude(); //$transclude()
        $element.append(a);
      }],
      compile: function (element, attrs, transclude) {
        return {
          pre: function (scope, element, attrs) {
            var svg = d3.select('#svgContainer')
            var height = parseInt(scope.height) + parseInt(scope.y) * 2 + 'px';
            svg.style({
              'width': '100%',
              'height': height
            });
            scope = svgRoute.setParenerLink(scope);
            scope.title_x = (parseInt(scope.width) - svgRoute.getTextWidth(scope.name, 12)) / 2;
            scope.title_y = 15;
            scope.container_width = scope.width - 4;
            scope.container_height = scope.height - 22;
            scope.container_x = 2;
            scope.container_y = 20;
            scope.svgLeftPanel_x = -120;
            scope.svgLeftPanel_y = 20;
            scope.svgRightPanel_x = parseInt(scope.width) + 5;
            scope.svgRightPanel_y = 20;

            scope.referenceImgPath = svgRoute.getActivityPath('referenceImgPath');
            scope.serversImgPath = svgRoute.getActivityPath('serversImgPath');
            scope.interfaceImgPath = svgRoute.getActivityPath('interfaceImgPath');
            scope.restServerImgPath = svgRoute.getActivityPath('restServerImgPath');
            if ($rootScope.processSvg.parenerLeftLinks.length > 0) {

            }
            if ($rootScope.processSvg.parenerRightLinks.length > 0) {

            }
            element[0].removeAttribute('width');
            element[0].removeAttribute('height');

            var links = $rootScope.processSvg.exampleLinks;
            var nodes = $rootScope.processSvg.exampleNodes;
            var unknowActivityMap = $rootScope.processSvg.unknowActivityMap;
            svgRoute.setNodePosition(nodes);
            svgRoute.setLinkProperty(links);
            svgRoute.setUnknowActivityImg(unknowActivityMap, nodes);
          },
          post: function (scope, element, attrs) {
          }
        }

      }
    }
  }])
  .directive("linkDir", ["$rootScope", "$timeout", "svgRoute", "svgProcessConfig", function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      template: svgProcessConfig.baseLinkStr(),
      replace: true,
      scope: {
        id: "@",
        name: "@",
        source: "@",
        target: "@",
        points: "@",
        color: "@",
        strokeWidth: "@"
      },
      templateNamespace: "svg",
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
      }],
      link: function (scope, element, attrs) {
        scope.color = scope.color || '#000';
        scope.strokeWidth = scope.strokeWidth || "1.5px";
        var p = eval(scope.points);
        var str = svgRoute.setPoints(p);
        scope.linkAttr_d = str;
        scope.basePath = window.location.href;
        element[0].source = scope.source;
        element[0].target = scope.target;
        element[0].color = scope.color;
        element[0].strokeWidth = scope.strokeWidth;
        $rootScope.processSvg.exampleLinks.push(element[0]);
      }
    }
  }])
  .directive('partnerLink', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      template: '',
      replace: true,
      scope: {
        id: '@',
        myrole: '@',
        name: '@',
        partnerlinkyype: '@',
        partnerrole: '@',
        partnertype: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
      }],
      link: function (scope, element, attrs) {

        if (scope.myrole && scope.myrole == 'use') {
          element[0].float = 'left';
          element[0].partnertype = scope.partnertype;
          $rootScope.processSvg.parenerLeftLinks.push(element[0]);
        }

        if (scope.partnerrole && scope.partnerrole == 'use') {
          element[0].float = 'right';
          $rootScope.processSvg.parenerRightLinks.push(element[0]);
        }
        $rootScope.processSvg.partnerLinksMap[element[0].id] = element[0];
      }
    }
  }])
  .directive('customerActivity', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', 'xmlToJson', function ($rootScope, $timeout, svgRoute, svgProcessConfig, xmlToJson) {
    return {
      restrict: 'E',
      template: '',
      replace: true,
      scope: {
        type: '@',
        img: '@'
      },
      link: function (scope, element, attrs) {
        $rootScope.processSvg.unknowActivityMap[attrs.type] = attrs.img;
      }
    }
  }])
  .directive('activityDir', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', 'xmlToJson', 'globalVariables', function ($rootScope, $timeout, svgRoute, svgProcessConfig, xmlToJson, globalVariables) {
    return {
      restrict: 'E',
      template: svgProcessConfig.baseActivityStr(),
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        partnerlink: '@',
        createinstance: "@",
        bgcolor: "@",
        color: "@",
        operation: "@"
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
      }],
      link: function (scope, element, attrs, controller, transcludeFun) {
        scope.bgcolor = scope.bgcolor || '#fff';
        transcludeFun(function (clone, scope) {
          var clone_final = [];
          angular.forEach(clone, function (index, value) {
            if (value.nodeType != 3) {
              clone_final.push(value)
            }
          })
          element[0].containText = clone_final;
        });

        scope.activityRectId = scope.id + '_rect';


        element[0].x = parseInt(attrs.x);
        element[0].y = parseInt(attrs.y);
        element[0].width = parseInt(attrs.width);
        element[0].height = parseInt(attrs.height);
        element[0].id = attrs.id;
        element[0].type = attrs.type;
        element[0].parent = element[0].parentNode;
        element[0].name = attrs.name;
        element[0].scopeId = scope.$id;
        $rootScope.processSvg.exampleNodes.push(element[0]);
        //$rootScope.processSvg.exampleNodesScope[element[0].type] = scope;
        $rootScope.processSvg.nodeMap[element[0].id] = element[0];

        element[0].sourceLinks = [];
        element[0].rightLinks = [];
        element[0].targetLinks = [];
        element[0].leftLinks = [];
        element[0].connectedNodes = [];
        element[0].childrenNode = [];
        element[0].ancestors = [];

        scope.activityPath = svgRoute.getActivityPath(scope.type);
        if (scope.createinstance && scope.createinstance == 'true') {
          if (scope.type.indexOf('Activity_4002_Receive') > -1) {
            scope.activityPath = svgRoute.getActivityPath(scope.type + '_1');
          }
        }
        scope.activityName = scope.name;
        scope.activityText_x = (scope.width - svgRoute.getTextWidth(scope.name, 12)) / 2;

        scope.activityText_y = parseInt(scope.height) + 12;
        element[0].removeAttribute('width');
        element[0].removeAttribute('height');
        scope.showText = true;
        if (scope.type.indexOf('groupStart') > -1 || scope.type.indexOf('groupEnd') > -1
          || scope.type.indexOf('onMessageStart') > -1 || scope.type.indexOf('onMessageEnd') > -1) {
          scope.showText = false;
        }
        if ($rootScope.uniqueActivity4002ReplyForService === undefined)
          $rootScope.uniqueActivity4002ReplyForService = [];
        var duplicateActivity4002ReplyFlag = false;
        function checkForReply(name) {
          for (var i = 0; i < $rootScope.uniqueActivity4002ReplyForService.length; i++) {
            if ($rootScope.uniqueActivity4002ReplyForService[i] === name) {
              return true;
            }
          }
          return false;
        }
        if (scope.partnerlink && scope.type) {
          if (scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Invoke") > -1
            || scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Receive") > -1
            || scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Reply") > -1) {
            var node = $rootScope.processSvg.partnerLinksMap[scope.partnerlink];
            if (!node.subTab) {
              node.subTab = [];
            } else {
            }
            if (scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Reply") > -1
              || scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Receive") > -1) {
              if (checkForReply(scope.operation + scope.partnerlink))
                duplicateActivity4002ReplyFlag = true;
              else
                $rootScope.uniqueActivity4002ReplyForService.push(scope.operation + scope.partnerlink);
              if (!duplicateActivity4002ReplyFlag) {
                element[0].operation = scope.operation;
                element[0].color = scope.color || '00007f';
                node.subTab.push(element[0]);
              }
            } else if (scope.type.indexOf("com.tibco.bw.core.design.process.editor.Activity_4002_Invoke") > -1) {
              element[0].operation = scope.name;
              element[0].color = scope.color || '00007f';
              node.subTab.push(element[0]);
            }
          }
        }
        scope.strokeWidth = 0;
        scope.$on('selectNode', function (event, activityName) {
          if (scope.activityName === activityName) {
            scope.strokeWidth = 2;
          } else {
            scope.strokeWidth = 0;
          }
        });
        element[0].ondblclick = function (event) {
          $rootScope.$broadcast('callProcessActivity', { type: "activity", value: attrs.name });
        }
        element[0].onclick = function (event) {
          globalVariables.isShowActivityTab = true;
          globalVariables.selectedTabProcessDiagram = 'activityTab';
          $rootScope.$apply(function () {
            $rootScope.isActivityClicked = true;
            //$rootScope.$broadcast('activityWasSelect', { node: element[0] });
            $rootScope.processSvg.currentNode = element[0];
            $rootScope.processSvg.activityContainText = element[0].containText;
            $rootScope.$broadcast('selectOnProcessActivity', { type: 'activity', value: attrs.name });
            selectedActivity = attrs.name;
            if ($rootScope.processSvg.activityContainText.length == 0) {
              $rootScope.processConfigDataArray = [];
            }
            else {


              for (var i = 0; i < $rootScope.processSvg.activityContainText.length; i++) {


                if ($rootScope.processSvg.activityContainText[i].nodeName === 'bwactivity') {


                  //var xmlString = $rootScope.processSvg.activityContainText[i].childNodes[1].innerHTML;
                  var xmlString = $rootScope.processSvg.activityContainText[i].outerHTML;
                  var toJson = xmlToJson.fromXmlStr(xmlString);
                  /*var processConfigDataObj = toJson.properties.value['@attributes'];
                  $rootScope.processConfigDataArray = [];
                  for(var attr in processConfigDataObj){
                    $rootScope.processConfigDataArray.push( {name:attr, value:processConfigDataObj[attr]})
                  }*/
                } else if ($rootScope.processSvg.activityContainText[i].nodeName === 'inputbinding') {

                } else if ($rootScope.processSvg.activityContainText[i].nodeName === 'partbinding') {

                }
              }
            }

          });
          event.stopPropagation();
        }

        var setBorder = function (ele, type) {
          ele.setAttribute('strokeOld', ele.getAttribute('stroke') || '');
          ele.setAttribute('strokeWidthOld', ele.getAttribute('stroke-width') || '');
          ele.setAttribute('stroke', 'red');
          ele.setAttribute('stroke-width', '1');
        }
        var clearBorder = function (ele, type) {
          ele.setAttribute('stroke', ele.getAttribute('strokeOld') || '');
          ele.setAttribute('stroke-width', ele.getAttribute('strokeWidthOld') || '');
        }

      }
    }
  }])
  .directive('scope', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseScopeStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        collapse: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
        var a = $transclude(); //$transclude()
        $scope.childEle = a;
        if ($scope.collapse == 'false') {

        } else if ($scope.collapse == 'true') {

          for (var i = 0; i < a.length; i++) {
            var ele = a[i];
            jQuery(ele).css('display', 'none');
          }
        } else {

        }
        $element.append(a);
      }],
      link: function (scope, element, attrs) {

        scope.activityRectId = scope.id + '_rect';


        element[0].x = parseInt(attrs.x);
        element[0].y = parseInt(attrs.y);
        element[0].width = parseInt(attrs.width);
        element[0].height = parseInt(attrs.height);
        element[0].id = attrs.id;
        element[0].type = attrs.type;
        element[0].parent = element[0].parentNode;
        element[0].name = attrs.name;
        $rootScope.processSvg.exampleNodes.push(element[0]);
        $rootScope.processSvg.nodeMap[element[0].id] = element[0];

        element[0].sourceLinks = [];
        element[0].rightLinks = [];
        element[0].targetLinks = [];
        element[0].leftLinks = [];
        element[0].connectedNodes = [];
        element[0].childrenNode = [];
        element[0].ancestors = [];


        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope = svgRoute.setDirectiveIconPosition_compensationHandlerOrScope(scope);
      }
    }
  }])
  .directive('compensationHandler', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseCompensationHandlerStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
        var a = $transclude(); //$transclude()
        $element.append(a);
      }],
      link: function (scope, element, attrs) {
        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.compensationHandler_info_path = svgRoute.getActivityPath('compensation.handler');
        scope.compensationText = 'Compensation';
        scope.info_width = scope.compensationText.length * 6 + 20;
        scope.info_height = 20;
        scope = svgRoute.setDirectiveIconPosition_compensationHandlerOrScope(scope);
      }
    }
  }])
  .directive('catch', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseCatchStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        faultname: "@",
        color: "@",
        strokeWidth: "@"
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
        var a = $transclude(); //$transclude()
        $element.append(a);
      }],
      link: function (scope, element, attrs) {
        scope.color = scope.color || 'black';
        scope.strokeWidth = scope.strokeWidth || '1px';
        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.catchText = scope.faultname;
        if (scope.catchText) {
          scope.info_width = scope.catchText.length * 6 + 20;
        } else {
          scope.info_width = 20;
        }
        scope.info_height = 20;
        scope.catch_width = 32;
        scope.catch_height = 32;
        scope.catch_x = -16;
        scope.catch_y = scope.height / 2 - 32;
        scope.catch_info_path = svgRoute.getActivityPath('catch');
        scope.catchLeftImg_path = svgRoute.getActivityPath('catchLeftImg');

        scope = svgRoute.setDirectiveIconPosition(scope);
      }
    }
  }])
  .directive('onEvent', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseOnEventStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        partnerlink: '@',
        operation: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
        var a = $transclude(); //$transclude()
        $element.append(a);
      }],
      link: function (scope, element, attrs) {
        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.eventText = scope.partnerlink + '/' + scope.operation;
        scope.info_width = scope.eventText.length * 7 + 20;
        scope.info_height = 20;
        scope.event_info_path = svgRoute.getActivityPath('onEvent');
        scope.eventHandlersLeftImg_path = svgRoute.getActivityPath('eventHandlersLeftImg');
        scope.event_width = 32;
        scope.event_height = 32;
        scope.event_x = -16;
        scope.event_y = scope.height / 2 - 32;


        scope = svgRoute.setDirectiveIconPosition(scope);
        if (scope.partnerlink) {
          var node = $rootScope.processSvg.partnerLinksMap[scope.partnerlink];
          if (!node.subTab) {
            node.subTab = [];
          } else {
          }
          element[0].operation = scope.operation;
          node.subTab.push(element[0]);
        }
      }
    }
  }])
  .directive('catchAll', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseCatchAllStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        partnerlink: '@',
        operation: "@",
        color: "@",
        strokeWidth: "@"
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function ($scope, $element, $attrs, $transclude) {
          var a = $transclude(); //$transclude()
          $element.append(a);
        }],
      link: function (scope, element, attrs) {
        scope.color = scope.color || 'black';
        scope.strokeWidth = scope.strokeWidth || '1px';

        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.eventText = 'Exception';
        scope.info_width = scope.eventText.length * 6 + 20;
        scope.info_height = 20;
        scope.catchAll_info_path = svgRoute.getActivityPath('catchAll');
        scope.catchAllLeftImg_path = svgRoute.getActivityPath('catchAllLeftImg');

        scope.catchAll_width = 32;
        scope.catchAll_height = 32;
        scope.catchAll_x = -16;
        scope.catchAll_y = scope.height / 2 - 32;

        scope = svgRoute.setDirectiveIconPosition(scope);
      }
    }
  }])
  .directive('pick', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.basePickStr(),
      replace: true,
      scope: {
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        collapse: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function ($scope, $element, $attrs, $transclude) {
          var a = $transclude(); //$transclude()
          $scope.childEle = a;
          if ($scope.collapse == 'false') {

          } else if ($scope.collapse == 'true') {

            for (var i = 0; i < a.length; i++) {
              var ele = a[i];
              jQuery(ele).css('display', 'none');
            }
          } else {

          }
          $element.append(a);
        }],
      link: function (scope, element, attrs) {
        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.pick_path = svgRoute.getActivityPath('pick');

        scope = svgRoute.setDirectiveIconPosition_pick(scope);

      }
    }
  }])
  .directive('onMessage', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'E',
      transclude: true,
      template: svgProcessConfig.baseOnMessageStr(),
      replace: true,
      scope: {
        activityType: '@',
        height: '@',
        id: '@',
        name: '@',
        width: '@',
        x: '=',
        y: '=',
        type: '@',
        partnerLink: '@',
        porttype: '@',
        variable: '@',
        operation: '@',
        collapse: '@',
        input: '@',
        output: '@'
      },
      templateNamespace: 'svg',
      controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {
        var hide_g = function (a) {
          for (var i = 0; i < a.length; i++) {
            var ele = a[i];
            jQuery(ele).css('display', 'none');
          }
        }
        var a = $transclude(); //$transclude()
        $scope.childEle = a;

        if ($scope.collapse == 'false') {

        } else if ($scope.collapse == 'true') {
          for (var i = 0; i < a.length; i++) {
            var ele = a[i];
            jQuery(ele).css('display', 'none');
          }
        } else {

        }

        $element.append(a);
      }],
      link: function (scope, element, attrs) {
        if (scope.collapse == 'false') {
          scope.showScope = true;
        } else if (scope.collapse == 'true') {
          scope.showScope = false;
        } else {
          scope.showScope = true;
        }
        scope.eventText = scope.partnerLink + '/' + scope.operation;
        scope.info_width = scope.eventText.length * 7 + 20;
        scope.info_height = 20;
        if (scope.input == 'true' && scope.output == 'true') {
          scope.event_info_path = svgRoute.getActivityPath('onEvent');
        } else if (scope.input == 'true' && !scope.output) {
          scope.event_info_path = svgRoute.getActivityPath('onMesageIn');
        } else if (scope.output == 'true' && !scope.input) {
          scope.event_info_path = svgRoute.getActivityPath('onMesageOut');
        }

        scope.eventHandlersLeftImg_path = svgRoute.getActivityPath('eventHandlersLeftImg');
        scope.event_width = 32;
        scope.event_height = 32;
        scope.event_x = -16;
        scope.event_y = scope.height / 2 - 32;

        scope = svgRoute.setDirectiveIconPosition(scope);
        // if (scope.partnerLink) {
        //   var node = $rootScope.processSvg.partnerLinksMap[scope.partnerLink];
        //   if (!node.subTab) {
        //     node.subTab = [];
        //   }
        //   element[0].operation = scope.operation;
        //   node.subTab.push(element[0]);
        // }
      }
    }
  }])
  .directive('activitySelect', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'A',
      template: '',
      link: function (scope, element, attrs) {

        scope.$on('activityWasSelect', function (event, args) {
          setSelectNode(args.node);
        })
        var lineEndActivityWasSelectDestroyFn = scope.$on('lineEndActivityWasSelect', function (event, args) {
          setSelectNode(args.node);
          $rootScope.processSvg.currentNode = args.node;
        })
        var setSelectNode = function (node) {
          var node = node;
          if (node.id != attrs.id) {
            return;
          }
          var rect = $(node).find('rect');
          if (rect) {
            rect.attr('stroke', 'red');
            rect.attr('stroke-width', '1');
          }
        }
      }
    }
  }])
  .directive('lineThrough', ['$rootScope', '$timeout', 'svgRoute', 'svgProcessConfig', function ($rootScope, $timeout, svgRoute, svgProcessConfig) {
    return {
      restrict: 'A',
      template: '',
      link: function (scope, element, attrs) {

        scope.$on('throughLine', function (event, args) {

          var line = args.line;
          if (line.id != attrs.id) {
            return;
          }
          if ($(line)) {
            $(line).attr('stroke', 'red');
            var targetNode = line.target;

            $rootScope.$broadcast('lineEndActivityWasSelect', { node: targetNode });


          }
        })
      }
    }
  }])
  .directive("formatXml", ["$rootScope", "$timeout", "svgRoute", "svgProcessConfig", "xmlToJson", function ($rootScope, $timeout, svgRoute, svgProcessConfig, xmlToJson) {
    return {
      restrict: 'E',
      template: '<div>No data available</div>',
      scope: {
        type: "=",
        data: "="
      },
      link: function (scope, element, attrs) {
        scope.$watch('data', function () {
          preetifyXml(scope.data, scope.type);
        });
        preetifyXml(scope.data, scope.type);
        function formatXml(xml) {
          var formatted = '';
          var reg = /(>)(<)(\/*)/g;
          xml = xml.replace(reg, '$1\r\n$2$3');
          var pad = 0;
          jQuery.each(xml.split('\r\n'), function (index, node) {
            var indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
              indent = 0;
            } else if (node.match(/^<\/\w/)) {
              if (pad != 0) {
                pad -= 1;
              }
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
              indent = 1;
            } else {
              indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
              padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
          });

          return formatted;
        }

        function preetifyXml(xml, id) {
          if (xml) {
            // var xml_raw = xml.substr(2).slice(0, -2);
            // xml_raw = xml_raw.replace('\/', '/').replace('\"', '"');
            var xml_formatted = '';
            if (id === 'inputSection' && xml.length > 0) {
              xml.forEach(function (data) {
                xml_formatted = xml_formatted + formatXml(data.input);
              });
            } else if (id === 'outputSection' && xml.length > 0) {
              xml.forEach(function (data) {
                xml_formatted = xml_formatted + formatXml(data.output);
              });
            } else {
              xml_formatted = 'No data available';
            }
            // var xml_formatted = id ==='inputSection'? formatXml(xml[0].input): formatXml(xml[0].input);
            var xml_escaped = xml_formatted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');

            var inputOutputSection = document.getElementById(id);

            var length = xml_escaped.length;
            var subStringValue = 25000;
            var counter = 0;
            inputOutputSection.innerHTML = '<div>' + length <= subStringValue ? xml_escaped : xml_escaped.substr(0, subStringValue) + '</div>';
            $('#output').on('scroll', function () {
              var outputScrollHeight = document.getElementById("output").scrollHeight;
              if ($("#output").scrollTop() > outputScrollHeight * 3 / 4 && counter === 0 && length > subStringValue) {
                inputOutputSection.innerHTML = '<div>' + xml_escaped + '</div>';
                colorXml(document.getElementById(id));
                counter++;
              }
            });
            $('#input').on('scroll', function () {
              var inputScrollHeight = document.getElementById("input").scrollHeight;
              if ($("#input").scrollTop() > inputScrollHeight * 3 / 4 && counter === 0 && length > subStringValue) {
                inputOutputSection.innerHTML = '<div>' + xml_escaped + '</div>';
                colorXml(document.getElementById(id));
                counter++;
              }
            });
            // document.body.appendChild(inputOutputSection);

            colorXml(document.getElementById(id));
          }
        }






        function colorXml(elmnt, mode) {
          var lang = (mode || "html");
          var elmntObj = (document.getElementById(elmnt) || elmnt);
          var elmntTxt = elmntObj.innerHTML;
          var tagcolor = "mediumblue";
          var tagnamecolor = "brown";
          var attributecolor = "red";
          var attributevaluecolor = "mediumblue";
          var commentcolor = "green";
          var cssselectorcolor = "brown";
          var csspropertycolor = "red";
          var csspropertyvaluecolor = "mediumblue";
          var cssdelimitercolor = "black";
          var cssimportantcolor = "red";
          var jscolor = "black";
          var jskeywordcolor = "mediumblue";
          var jsstringcolor = "brown";
          var jsnumbercolor = "red";
          var jspropertycolor = "black";
          elmntObj.style.fontFamily = "Consolas,'Courier New', monospace";
          if (!lang) { lang = "html"; }
          if (lang == "html") { elmntTxt = htmlMode(elmntTxt); }
          if (lang == "css") { elmntTxt = cssMode(elmntTxt); }
          if (lang == "js") { elmntTxt = jsMode(elmntTxt); }
          elmntObj.innerHTML = elmntTxt;

          function extract(str, start, end, func, repl) {
            var s, e, d = "", a = [];
            while (str.search(start) > -1) {
              s = str.search(start);
              e = str.indexOf(end, s);
              if (e == -1) { e = str.length; }
              if (repl) {
                a.push(func(str.substring(s, e + (end.length))));
                str = str.substring(0, s) + repl + str.substr(e + (end.length));
              } else {
                d += str.substring(0, s);
                d += func(str.substring(s, e + (end.length)));
                str = str.substr(e + (end.length));
              }
            }
            this.rest = d + str;
            this.arr = a;
          }
          function htmlMode(txt) {
            var rest = txt, done = "", php, comment, angular, startpos, endpos, note, i;
            comment = new extract(rest, "&lt;!--", "--&gt;", commentMode, "SRIKANTAHTMLCOMMENTPOS");
            rest = comment.rest;
            while (rest.indexOf("&lt;") > -1) {
              note = "";
              startpos = rest.indexOf("&lt;");
              if (rest.substr(startpos, 9).toUpperCase() == "&LT;STYLE") { note = "css"; }
              if (rest.substr(startpos, 10).toUpperCase() == "&LT;SCRIPT") { note = "javascript"; }
              endpos = rest.indexOf("&gt;", startpos);
              if (endpos == -1) { endpos = rest.length; }
              done += rest.substring(0, startpos);
              done += tagMode(rest.substring(startpos, endpos + 4));
              rest = rest.substr(endpos + 4);
              if (note == "css") {
                endpos = rest.indexOf("&lt;/style&gt;");
                if (endpos > -1) {
                  done += cssMode(rest.substring(0, endpos));
                  rest = rest.substr(endpos);
                }
              }
              if (note == "javascript") {
                endpos = rest.indexOf("&lt;/script&gt;");
                if (endpos > -1) {
                  done += jsMode(rest.substring(0, endpos));
                  rest = rest.substr(endpos);
                }
              }
            }
            rest = done + rest;
            for (i = 0; i < comment.arr.length; i++) {
              rest = rest.replace("SRIKANTAHTMLCOMMENTPOS", comment.arr[i]);
            }
            return rest;
          }
          function tagMode(txt) {
            var rest = txt, done = "", startpos, endpos, result;
            while (rest.search(/(\s|<br>)/) > -1) {
              startpos = rest.search(/(\s|<br>)/);
              endpos = rest.indexOf("&gt;");
              if (endpos == -1) { endpos = rest.length; }
              done += rest.substring(0, startpos);
              done += attributeMode(rest.substring(startpos, endpos));
              rest = rest.substr(endpos);
            }
            result = done + rest;
            result = "<span style=color:" + tagcolor + ">&lt;</span>" + result.substring(4);
            if (result.substr(result.length - 4, 4) == "&gt;") {
              result = result.substring(0, result.length - 4) + "<span style=color:" + tagcolor + ">&gt;</span>";
            }
            return "<span style=color:" + tagnamecolor + ">" + result + "</span>";
          }
          function attributeMode(txt) {
            var rest = txt, done = "", startpos, endpos, singlefnuttpos, doublefnuttpos, spacepos;
            while (rest.indexOf("=") > -1) {
              endpos = -1;
              startpos = rest.indexOf("=");
              singlefnuttpos = rest.indexOf("'", startpos);
              doublefnuttpos = rest.indexOf('"', startpos);
              spacepos = rest.indexOf(" ", startpos + 2);
              if (spacepos > -1 && (spacepos < singlefnuttpos || singlefnuttpos == -1) && (spacepos < doublefnuttpos || doublefnuttpos == -1)) {
                endpos = rest.indexOf(" ", startpos);
              } else if (doublefnuttpos > -1 && (doublefnuttpos < singlefnuttpos || singlefnuttpos == -1) && (doublefnuttpos < spacepos || spacepos == -1)) {
                endpos = rest.indexOf('"', rest.indexOf('"', startpos) + 1);
              } else if (singlefnuttpos > -1 && (singlefnuttpos < doublefnuttpos || doublefnuttpos == -1) && (singlefnuttpos < spacepos || spacepos == -1)) {
                endpos = rest.indexOf("'", rest.indexOf("'", startpos) + 1);
              }
              if (!endpos || endpos == -1 || endpos < startpos) { endpos = rest.length; }
              done += rest.substring(0, startpos);
              done += attributeValueMode(rest.substring(startpos, endpos + 1));
              rest = rest.substr(endpos + 1);
            }
            return "<span style=color:" + attributecolor + ">" + done + rest + "</span>";
          }
          function attributeValueMode(txt) {
            return "<span style=color:" + attributevaluecolor + ">" + txt + "</span>";
          }
          function commentMode(txt) {
            return "<span style=color:" + commentcolor + ">" + txt + "</span>";
          }
          function cssMode(txt) {
            var rest = txt, done = "", s, e, comment, i, midz, c, cc;
            comment = new extract(rest, /\/\*/, "*/", commentMode, "SRIKANTACSSCOMMENTPOS");
            rest = comment.rest;
            while (rest.search("{") > -1) {
              s = rest.search("{");
              midz = rest.substr(s + 1);
              cc = 1;
              c = 0;
              for (i = 0; i < midz.length; i++) {
                if (midz.substr(i, 1) == "{") { cc++; c++ }
                if (midz.substr(i, 1) == "}") { cc--; }
                if (cc == 0) { break; }
              }
              if (cc != 0) { c = 0; }
              e = s;
              for (i = 0; i <= c; i++) {
                e = rest.indexOf("}", e + 1);
              }
              if (e == -1) { e = rest.length; }
              done += rest.substring(0, s + 1);
              done += cssPropertyMode(rest.substring(s + 1, e));
              rest = rest.substr(e);
            }
            rest = done + rest;
            rest = rest.replace(/{/g, "<span style=color:" + cssdelimitercolor + ">{</span>");
            rest = rest.replace(/}/g, "<span style=color:" + cssdelimitercolor + ">}</span>");
            for (i = 0; i < comment.arr.length; i++) {
              rest = rest.replace("SRIKANTACSSCOMMENTPOS", comment.arr[i]);
            }
            return "<span style=color:" + cssselectorcolor + ">" + rest + "</span>";
          }
          function cssPropertyMode(txt) {
            var rest = txt, done = "", s, e, n, loop;
            if (rest.indexOf("{") > -1) { return cssMode(rest); }
            while (rest.search(":") > -1) {
              s = rest.search(":");
              loop = true;
              n = s;
              while (loop == true) {
                loop = false;
                e = rest.indexOf(";", n);
                if (rest.substring(e - 5, e + 1) == "&nbsp;") {
                  loop = true;
                  n = e + 1;
                }
              }
              if (e == -1) { e = rest.length; }
              done += rest.substring(0, s);
              done += cssPropertyValueMode(rest.substring(s, e + 1));
              rest = rest.substr(e + 1);
            }
            return "<span style=color:" + csspropertycolor + ">" + done + rest + "</span>";
          }
          function cssPropertyValueMode(txt) {
            var rest = txt, done = "", s;
            rest = "<span style=color:" + cssdelimitercolor + ">:</span>" + rest.substring(1);
            while (rest.search(/!important/i) > -1) {
              s = rest.search(/!important/i);
              done += rest.substring(0, s);
              done += cssImportantMode(rest.substring(s, s + 10));
              rest = rest.substr(s + 10);
            }
            result = done + rest;
            if (result.substr(result.length - 1, 1) == ";" && result.substr(result.length - 6, 6) != "&nbsp;" && result.substr(result.length - 4, 4) != "&lt;" && result.substr(result.length - 4, 4) != "&gt;" && result.substr(result.length - 5, 5) != "&amp;") {
              result = result.substring(0, result.length - 1) + "<span style=color:" + cssdelimitercolor + ">;</span>";
            }
            return "<span style=color:" + csspropertyvaluecolor + ">" + result + "</span>";
          }
          function cssImportantMode(txt) {
            return "<span style=color:" + cssimportantcolor + ";font-weight:bold;>" + txt + "</span>";
          }
          function jsMode(txt) {
            var rest = txt, done = "", esc = [], i, cc, tt = "", sfnuttpos, dfnuttpos, compos, comlinepos, keywordpos, numpos, mypos, dotpos, y;
            for (i = 0; i < rest.length; i++) {
              cc = rest.substr(i, 1);
              if (cc == "\\") {
                esc.push(rest.substr(i, 2));
                cc = "SRIKANTAJSESCAPE";
                i++;
              }
              tt += cc;
            }
            rest = tt;
            y = 1;
            while (y == 1) {
              sfnuttpos = getPos(rest, "'", "'", jsStringMode);
              dfnuttpos = getPos(rest, '"', '"', jsStringMode);
              compos = getPos(rest, /\/\*/, "*/", commentMode);
              comlinepos = getPos(rest, /\/\//, "<br>", commentMode);
              numpos = getNumPos(rest, jsNumberMode);
              keywordpos = getKeywordPos("js", rest, jsKeywordMode);
              dotpos = getDotPos(rest, jsPropertyMode);
              if (Math.max(numpos[0], sfnuttpos[0], dfnuttpos[0], compos[0], comlinepos[0], keywordpos[0], dotpos[0]) == -1) { break; }
              mypos = getMinPos(numpos, sfnuttpos, dfnuttpos, compos, comlinepos, keywordpos, dotpos);
              if (mypos[0] == -1) { break; }
              if (mypos[0] > -1) {
                done += rest.substring(0, mypos[0]);
                done += mypos[2](rest.substring(mypos[0], mypos[1]));
                rest = rest.substr(mypos[1]);
              }
            }
            rest = done + rest;
            for (i = 0; i < esc.length; i++) {
              rest = rest.replace("SRIKANTAJSESCAPE", esc[i]);
            }
            return "<span style=color:" + jscolor + ">" + rest + "</span>";
          }
          function jsStringMode(txt) {
            return "<span style=color:" + jsstringcolor + ">" + txt + "</span>";
          }
          function jsKeywordMode(txt) {
            return "<span style=color:" + jskeywordcolor + ">" + txt + "</span>";
          }
          function jsNumberMode(txt) {
            return "<span style=color:" + jsnumbercolor + ">" + txt + "</span>";
          }
          function jsPropertyMode(txt) {
            return "<span style=color:" + jspropertycolor + ">" + txt + "</span>";
          }
          function getDotPos(txt, func) {
            var x, i, j, s, e, arr = [".", "<", " ", ";", "(", "+", ")", "[", "]", ",", "&", ":", "{", "}", "/", "-", "*", "|", "%"];
            s = txt.indexOf(".");
            if (s > -1) {
              x = txt.substr(s + 1);
              for (j = 0; j < x.length; j++) {
                cc = x[j];
                for (i = 0; i < arr.length; i++) {
                  if (cc.indexOf(arr[i]) > -1) {
                    e = j;
                    return [s + 1, e + s + 1, func];
                  }
                }
              }
            }
            return [-1, -1, func];
          }
          function getMinPos() {
            var i, arr = [];
            for (i = 0; i < arguments.length; i++) {
              if (arguments[i][0] > -1) {
                if (arr.length == 0 || arguments[i][0] < arr[0]) { arr = arguments[i]; }
              }
            }
            if (arr.length == 0) { arr = arguments[i]; }
            return arr;
          }
          function getKeywordPos(typ, txt, func) {
            var words, i, pos, rpos = -1, rpos2 = -1, patt;
            if (typ == "js") {
              words = ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete",
                "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import",
                "in", "instanceof", "int", "interface", "let", "long", "NaN", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static",
                "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"];
            }
            for (i = 0; i < words.length; i++) {
              pos = txt.indexOf(words[i]);
              if (pos > -1) {
                patt = /\W/g;
                if (txt.substr(pos + words[i].length, 1).match(patt) && txt.substr(pos - 1, 1).match(patt)) {
                  if (pos > -1 && (rpos == -1 || pos < rpos)) {
                    rpos = pos;
                    rpos2 = rpos + words[i].length;
                  }
                }
              }
            }
            return [rpos, rpos2, func];
          }
          function getPos(txt, start, end, func) {
            var s, e;
            s = txt.search(start);
            e = txt.indexOf(end, s + (end.length));
            if (e == -1) { e = txt.length; }
            return [s, e + (end.length), func];
          }
          function getNumPos(txt, func) {
            var arr = ["<br>", " ", ";", "(", "+", ")", "[", "]", ",", "&", ":", "{", "}", "/", "-", "*", "|", "%", "="], i, j, c, startpos = 0, endpos, word;
            for (i = 0; i < txt.length; i++) {
              for (j = 0; j < arr.length; j++) {
                c = txt.substr(i, arr[j].length);
                if (c == arr[j]) {
                  if (c == "-" && (txt.substr(i - 1, 1) == "e" || txt.substr(i - 1, 1) == "E")) {
                    continue;
                  }
                  endpos = i;
                  if (startpos < endpos) {
                    word = txt.substring(startpos, endpos);
                    if (!isNaN(word)) { return [startpos, endpos, func]; }
                  }
                  i += arr[j].length;
                  startpos = i;
                  i -= 1;
                  break;
                }
              }
            }
            return [-1, -1, func];
          }
        }
      }
    }
  }])
