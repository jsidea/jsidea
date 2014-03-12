module jsidea.ui {
    export class UIElement extends jsidea.display.Element {
        constructor() {
            super();
        }

        //@override
        public configureVisual(visual: JQuery): void {
            super.configureVisual(visual);
            visual.addClass("jsidea-ui-uielement");
        }

        //@override
        public deconfigureVisual(visual: JQuery): void {
            super.deconfigureVisual(visual);
            visual.removeClass("jsidea-ui-uielement");
        }
    }
}