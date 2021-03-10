/**
 * Created by atin  on 2/13/2017.
 */
import * as angular from 'angular';
export function orderMapFilter(globalVariables: any): any {
  return (items: any): any => {
    var filtered: Array<any> = [];
    angular.forEach(items, (item: any): any => {
      if (globalVariables.env === 'pcf') {
        if (item.space === globalVariables.space) {
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    });
    /*            filtered.sort((a: any, b: any): any => {
                    return (a[field] > b[field] ? 1 : -1);
                });
                if (reverse) { filtered.reverse(); }*/
                  globalVariables.applicationsCount = filtered.length;
            return filtered;
  };
}