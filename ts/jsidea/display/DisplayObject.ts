module jsidea.display {
    export interface IDisplayObject extends jsidea.events.IEventDispatcher, jsidea.geom.ITransformTarget {
        transform: jsidea.geom.ITransform;
        element: JQuery;
        originX: number;
        originY: number;
        validate(): void;
    }
    export class DisplayObject extends jsidea.events.EventDispatcher {

        private _transform: jsidea.geom.ITransform;
        private _element: JQuery = null;
        private _originX: number = 0;
        private _originY: number = 0;
        private _originXAbsolute: boolean = true;
        private _originYAbsolute: boolean = true;
        private _x: number = 0;
        private _y: number = 0;
        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _skewX: number = 0;
        private _skewY: number = 0;
        private _rotation: number = 0;
        private _isDirtyRotation: boolean = false;
        private _isDirtyScale: boolean = false;
        private _isDirtySkew: boolean = false;
        private _isDirtyPosition: boolean = false;
        private _isDirtyOrigin: boolean = false;
        private _isDirty: boolean = false;

        constructor(element: JQuery = null) {
            super();
            this._transform = new jsidea.geom.Transform(this);
            this.element = element;
        }

        public get transform(): jsidea.geom.ITransform {
            return this._transform;
        }

        public get element(): JQuery {
            return this._element;
        }

        public set element(element: JQuery) {
            if (this._element == element)
                return;
            if (this._element)
                this.deconfigureElement(this._element);
            this._element = element;
            if (this._element)
                this.configureElement(this._element);
            this.invalidate();
        }

        public get originX(): number {
            return this._originX;
        }

        public set originX(value: number) {
            if (this._originX == value)
                return;
            this._originX = value;
            this._isDirtyOrigin = true;
            this.invalidate();
        }

        public get originXAbsolute(): boolean {
            return this._originXAbsolute;
        }

        public set originXAbsolute(value: boolean) {
            if (this._originXAbsolute == value)
                return;
            this._originXAbsolute = value;
            this._isDirtyOrigin = true;
            this.invalidate();
        }

        public get originY(): number {
            return this._originY;
        }

        public set originY(value: number) {
            if (this._originY == value)
                return;
            this._originY = value;
            this._isDirtyOrigin = true;
            this.invalidate();
        }

        public get originYAbsolute(): boolean {
            return this._originYAbsolute;
        }

        public set originYAbsolute(value: boolean) {
            if (this._originYAbsolute == value)
                return;
            this._originYAbsolute = value;
            this._isDirtyOrigin = true;
            this.invalidate();
        }

        public get x(): number {
            return this._x;
        }

        public set x(value: number) {
            if (this._x == value)
                return;
            this._x = value;
            this._isDirtyPosition = true;
            this.invalidate();
        }

        public get y(): number {
            return this._y;
        }

        public set y(value: number) {
            if (this._y == value)
                return;
            this._y = value;
            this._isDirtyPosition = true;
            this.invalidate();
        }

        public get scaleX(): number {
            return this._scaleX;
        }

        public set scaleX(value: number) {
            if (this._scaleX == value)
                return;
            this._scaleX = value;
            this._isDirtyScale = true;
            this.invalidate();
        }

        public get scaleY(): number {
            return this._scaleY;
        }

        public set scaleY(value: number) {
            if (this._scaleY == value)
                return;
            this._scaleY = value;
            this._isDirtyScale = true;
            this.invalidate();
        }

        public get skewX(): number {
            return this._skewX;
        }

        public set skewX(value: number) {
            if (this._skewX == value)
                return;
            this._skewX = value;
            this._isDirtyScale = true;
            this.invalidate();
        }

        public get skewY(): number {
            return this._skewY;
        }

        public set skewY(value: number) {
            if (this._skewY == value)
                return;
            this._skewY = value;
            this._isDirtyScale = true;
            this.invalidate();
        }

        public get rotation(): number {
            return this._rotation;
        }

        public set rotation(value: number) {
            if (this._rotation == value)
                return;
            this._rotation = value;
            this._isDirtyRotation = true;
            this.invalidate();
        }

        public configureElement(element: JQuery): void {
            element.data("jsidea-display-object", this);
            element.addClass("jsidea-display-object");
            var origin = jsidea.geom.Transform.extractOrigin(element);
            this._originX = origin.valueX;
            this._originXAbsolute = origin.xAbsolute;
            this._originY = origin.valueY;
            this._originYAbsolute = origin.yAbsolute;
            this._transform.refresh();
        }

        public deconfigureElement(element: JQuery): void {
            element.data("jsidea-display-object", null);
            element.removeClass("jsidea-display-object");
        }

        public validate(): void {
            if (this._isDirty) {
                this.unbind("tick.display_object");
            }
            if (this._element
                && (this._isDirtyPosition
                || this._isDirtyScale
                || this._isDirtyRotation
                || this._isDirtySkew
                || this._isDirtyOrigin)) {

                var m = this._transform.matrix;
                this.element.css("transform-origin",
                    (this._originX) + (this._originXAbsolute ? "px " : "% ")
                    + (this._originY) + (this._originYAbsolute ? "px " : "% "));
                this.element.css("transform", m.cssMatrix);

                var evt = new jsidea.events.TransformEvent();
                evt.translated = this._isDirtyPosition;
                evt.scaled = this._isDirtyScale;
                evt.rotated = this._isDirtyRotation;
                evt.skewed = this._isDirtySkew;
                evt.originChanged = this._isDirtyOrigin;
                this.trigger(jsidea.events.TransformEvent.TRANSFORM, evt);
            }

            this._isDirtyPosition = false;
            this._isDirtyScale = false;
            this._isDirtyRotation = false;
            this._isDirtySkew = false;
            this._isDirtyOrigin = false;
            this._isDirty = false;
        }

        public invalidate(): void {
            if (this._isDirty)
                return;
            this._isDirty = true;
            this.bind("tick.display_object", this.validate, this);
        }

        public dispose(): void {
            super.dispose();
        }

        public toString(): string {
            return "[jsidea.display.DisplayObject]";
        }
    }
}