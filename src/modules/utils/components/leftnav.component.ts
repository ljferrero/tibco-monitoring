/**
 * Created by bmane on 2/1/2017.
 */
import { IGlobalVariables } from '../../../interfaces/IGlobalVariables';
export class LeftNavComponent implements ng.IComponentOptions {
    public controller: any = LeftNavController;
    public template: string = require('../partials/monitor-left-nav.html');
}
export class LeftNavController {
    public static $inject: any = ['$window', 'globalVariables', 'monLabels', '$state'];
    constructor(private $window: ng.IWindowService, private globalVariables: IGlobalVariables, private monLabels: any,
        public $state: any) {
        $(this.$window).on('resize', (): any => {
            this.resize();
        });
        $(this.$window).on('scroll', (): any => {
            this.resize();
        });
        this.resize();
    }

    public spaceChanged(space: string): void {
        this.$state.go('applications', { viewType: 'default', space: space });
    }
    private resize(): void {
        if (this.$window.innerHeight > $('#tabcontent').height()) {
            $('.left-navbar').height(this.$window.innerHeight - Math.round($('.moniter_Header').height()));
        } else {
            $('.left-navbar').height(Math.round($('#tabcontent').height()));
        }
    }

}
