module jsidea.action {
    export class BaseInteractor extends jsidea.events.EventDispatcher {
        constructor() {
            super();
        }

        public configureVisual(visual: JQuery): void {
        }

        public deconfigureVisual(visual: JQuery): void {
        }
    }
}