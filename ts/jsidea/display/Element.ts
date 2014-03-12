module jsidea.display {
    export interface IElement extends jsidea.events.IEventDispatcher, jsidea.geom.ITransformTarget {
        transform: jsidea.geom.ITransform;
        originX: number;
        originY: number;
        offsetX: number;
        offsetY: number;
        validate(): void;
    }
    export class Element extends jsidea.events.EventDispatcher implements IElement {

        private _transform: jsidea.geom.ITransform;
        private _visual: JQuery = null;
        private _visualElement: HTMLElement;
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
        private _isDirtyOffset: boolean = false;
        private _isDirty: boolean = false;
        private _invalidated: boolean = false;

        constructor(visual: JQuery = null) {
            super();

            this.create(visual);
        }

        private create(visual: JQuery): void {
            this._transform = new jsidea.geom.Transform(this);
            this.visual = visual;
        }

        public get transform(): jsidea.geom.ITransform {
            return this._transform;
        }

        public get visual(): JQuery {
            return this._visual;
        }

        public set visual(visual: JQuery) {
            if (this._visual == visual)
                return;
            if (this._visual)
                this.deconfigureVisual(this._visual);
            
            this._visual = visual;
            this._visualElement = this._visual ? this._visual[0] : null;
            
            if (this._visual)
                this.configureVisual(this._visual);
            this.invalidate();
        }

        public get offsetX(): number {
            return this._visual[0].offsetLeft;
        }

        public set offsetX(value: number) {
            if (this._visualElement.offsetLeft == value)
                return;
            this._visualElement.offsetLeft = value;
            this._isDirtyOffset = true;
            this.invalidate();
        }

        public get offsetY(): number {
            return this._visualElement.offsetTop;
        }

        public set offsetY(value: number) {
            if (this._visualElement.offsetTop == value)
                return;
            this._visualElement.offsetTop = value;
            this._isDirtyOffset = true;
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

        public configureVisual(visual: JQuery): void {
            visual.data("jsidea-display-element", this);
            visual.addClass("jsidea-display-element");
            var origin = jsidea.geom.Transform.extractOrigin(visual);
            this._originX = origin.valueX;
            this._originXAbsolute = origin.xAbsolute;
            this._originY = origin.valueY;
            this._originYAbsolute = origin.yAbsolute;
            this._transform.refresh();
        }

        public deconfigureVisual(visual: JQuery): void {
            visual.data("jsidea-display-element", null);
            visual.removeClass("jsidea-display-element");
        }

        public validate(): void {
            if (this._isDirty && this._invalidated) {
                this.unbind("tick.display_object");
                this._invalidated = false;
            }
            if (this._visual
                && (this._isDirtyPosition
                || this._isDirtyScale
                || this._isDirtyRotation
                || this._isDirtySkew
                || this._isDirtyOrigin)) {

                var m = this._transform.matrix;
                this.visual.css("transform-origin",
                    (this._originX) + (this._originXAbsolute ? "px " : "% ")
                    + (this._originY) + (this._originYAbsolute ? "px " : "% "));
                this.visual.css("transform", m.cssMatrix);

                var evt = new jsidea.events.TransformEvent();
                evt.translated = this._isDirtyPosition;
                evt.scaled = this._isDirtyScale;
                evt.rotated = this._isDirtyRotation;
                evt.skewed = this._isDirtySkew;
                evt.originChanged = this._isDirtyOrigin;
                this.trigger(jsidea.events.TransformEvent.TRANSFORM, evt);
            }

            if (this._isDirtyOffset) {

            }

            this._isDirtyPosition = false;
            this._isDirtyScale = false;
            this._isDirtyRotation = false;
            this._isDirtySkew = false;
            this._isDirtyOrigin = false;
            this._isDirtyOffset = false;
            this._isDirty = false;
        }

        public invalidate(): void {
            if (this._isDirty)
                return;
            this._isDirty = true;
            this._invalidated = true;
            this.bind("tick.display_object", this.validate, this);
        }

        public dispose(): void {
            this._transform.dispose();
            if (this._visual)
                this._visual.remove();
            this.visual = null;
            this._transform = null;
            super.dispose();
        }

        public toString(): string {
            return "[jsidea.display.Element]";
        }
    }
}