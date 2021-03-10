/**
 * Created by Srikanta Dutta on 2/7/2017.
 */
export function orderFilter(): any {
    return (input: any, sortBy: Array<any>): any => {
        let orderedArray: any = [];
        for (let key in sortBy) {
            orderedArray.push(input[sortBy[key]]);
        }
        return orderedArray;
    };
}