 /**
  * Created by atin  on 2/13/2017.
  */
 import * as moment from 'moment';

  export function timeFormatFilter(): any {
   return function(uptimeInfo: any): any {
        let durationObj: any = moment.duration(uptimeInfo , 'milliseconds');
        let fromHours: number = durationObj._data.hours;
        let fromMinutes: number = durationObj._data.minutes;
        let fromSeconds: number = durationObj._data.seconds;
        let uptime: any = durationObj._data.days + 'd ' +
        moment({hour: fromHours, minute: fromMinutes, seconds: fromSeconds}).format('HH:mm:ss');
        return uptime;
    };
  }