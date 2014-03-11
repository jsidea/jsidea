module jsidea.display {
    export interface IViewport extends IDisplayObject {
    }
    export class Viewport extends jsidea.display.DisplayObject implements IViewport {
        constructor(element: JQuery = null) {
            super(element);
        }

        public toString(): string {
            return "[jsidea.display.Viewport]";
        }
    }
}