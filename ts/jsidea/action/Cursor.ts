namespace jsidea.action {
    export class Cursor extends jsidea.events.EventDispatcher implements geom.IPoint2DValue {

        public uid: number = 0;
        public x: number = 0;
        public y: number = 0;
        public target: HTMLElement = null;

        constructor() {
            super();
        }
    }
}