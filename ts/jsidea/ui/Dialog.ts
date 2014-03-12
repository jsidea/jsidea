module jsidea.ui {
    export class Dialog extends UIElement {
        constructor() {
            super();
        }

        //@override
        public configureVisual(visual: JQuery): void {
            super.configureVisual(visual);
            visual.addClass("jsidea-ui-dialog");
        }

        //@override
        public deconfigureVisual(visual: JQuery): void {
            super.deconfigureVisual(visual);
            visual.removeClass("jsidea-ui-dialog");
        }
    }
}