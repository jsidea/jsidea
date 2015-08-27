module jsidea.action {
    export class EventCircuit extends jsidea.events.EventDispatcher implements geom.IPoint2DValue {

        public uid: number = 0;
        public x: number = 0;
        public y: number = 0;

        constructor() {
            super();
        }
    }
}