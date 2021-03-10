describe('Component: gridComponent', () => {
  beforeEach(angular.mock.module('monitor'));
  var element: any;
  var scope: any;
  var controller: any;

  beforeEach(angular.mock.inject(($rootScope: any, $compile: any) => {
    scope = $rootScope.$new();
     // element = window.__html__['src/aa.html'];
    element = angular.element('<bw-monitor>');
    element = $compile(element)(scope);
    controller = element.controller('bwMonitor');
    scope.$apply();
  }));
   it('Is controller defined ', () => {
    expect(controller).toBeDefined();
  });

    it('Is controller defined ', () => {
    expect(controller).toBeDefined();
  });

  it('Is partial Loaded ', () => {
    var span: any = element.find('span');
    expect(span.text()).toBe('TIBCO BusinessWorks Monitoring');
  });

});


