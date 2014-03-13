module jsidea.geom {
    export interface ITransformElement extends ITransformTarget, ITransform, jsidea.core.ICore {
        originX: number;
        originY: number;
        validate(): void;
    }
    export class TransformElement extends Transform implements ITransformElement {

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
        private _invalidated: boolean = false;
        private _autoValidate: boolean = true;

        private _visual: JQuery = null;
        private _dispatcher: jsidea.events.IEventDispatcher = null;

        constructor(visual: JQuery = null, dispatcher: jsidea.events.IEventDispatcher = null) {
            super();

            this.target = this;
            this.visual = visual;
            this.dispatcher = dispatcher;
        }

        public get visual(): JQuery {
            return this._visual;
        }

        public set visual(value: JQuery) {
            if (this._visual == value)
                return;
            if (this._visual)
                this.deconfigureVisual(this._visual);
            this._visual = value;
            if (this._visual)
                this.configureVisual(this._visual);
            this.invalidate();
        }

        public configureVisual(visual: JQuery): void {
            visual.data("jsidea-display-elementtransform", this);
            var origin = Transform.extractOrigin(visual);
            this._originX = origin.valueX;
            this._originXAbsolute = origin.xAbsolute;
            this._originY = origin.valueY;
            this._originYAbsolute = origin.yAbsolute;
            this.refresh();
        }

        public deconfigureVisual(visual: JQuery): void {
            visual.data("jsidea-display-elementtransform", null);
        }

        public get dispatcher(): jsidea.events.IEventDispatcher {
            return this._dispatcher;
        }

        public set dispatcher(value: jsidea.events.IEventDispatcher) {
            if (this._dispatcher == value)
                return;
            if (this._dispatcher)
                this.deconfigureDispatcher(this._dispatcher);
            this._dispatcher = value;
            if (this._dispatcher)
                this.configureDispatcher(this._dispatcher);
        }

        public configureDispatcher(dispatcher: jsidea.events.IEventDispatcher): void {
            if (this._autoValidate && this._invalidated)
                dispatcher.bind("tick.display_object", this.validate, this);
        }

        public deconfigureDispatcher(dispatcher: jsidea.events.IEventDispatcher): void {
            dispatcher.unbind("tick.display_object");
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

        public validate(): void {
            if (this._invalidated) {
                if (this._dispatcher)
                    this._dispatcher.unbind("tick.display_object");
            }
            if (this._visual
                && (this._isDirtyPosition
                || this._isDirtyScale
                || this._isDirtyRotation
                || this._isDirtySkew
                || this._isDirtyOrigin)) {

                var m = this.matrix;
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
                if (this._dispatcher)
                    this._dispatcher.trigger(jsidea.events.TransformEvent.TRANSFORM, evt);
            }

            this._isDirtyPosition = false;
            this._isDirtyScale = false;
            this._isDirtyRotation = false;
            this._isDirtySkew = false;
            this._isDirtyOrigin = false;
            this._invalidated = false;
        }

        public invalidate(): void {
            if (this._invalidated)
                return;
            this._invalidated = true;
            if (this._autoValidate && this._dispatcher)
                this._dispatcher.bind("tick.display_object", this.validate, this);
        }

        public get autoValidate(): boolean {
            return this._autoValidate;
        }

        public set autoValidate(value: boolean) {
            if (this._autoValidate == value)
                return;
            this._autoValidate = value;

            if(!this._dispatcher)
                return;
                    
            if (this._autoValidate && this._invalidated)
                this._dispatcher.bind("tick.display_object", this.validate, this);
            else if (!this._autoValidate)
                this._dispatcher.unbind("tick.display_object");
        }

        public dispose(): void {
            this.visual = null;
            this.dispatcher = null;

            super.dispose();
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.TransformElement";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "";
        }
    }
}