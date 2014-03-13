module jsidea.display {
    export interface IElement extends jsidea.events.IEventDispatcher {
        transform: jsidea.geom.ITransformElement;
        added: boolean;
        presented: boolean;
        visible: boolean;
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
        validate(): void;
        localToGlobal(x: number, y: number): jsidea.geom.IPoint;
        globalToLocal(x: number, y: number): jsidea.geom.IPoint;
    }
    export class Element extends jsidea.events.EventDispatcher implements IElement {

        private _transform: jsidea.geom.ITransformElement = null;
        private _visual: JQuery = null;
        private _htmlElement: HTMLElement;

        private _isDirtyOffset: boolean = false;
        private _isDirtySize: boolean = false;
        private _invalidated: boolean = false;

        constructor(visual: JQuery = null) {
            super();

            this.visual = visual;
        }

        public get transform(): jsidea.geom.ITransformElement {
            if (!this._transform)
                this._transform = new jsidea.geom.TransformElement(this._visual, this);
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
            this._htmlElement = this._visual ? this._visual.get(0) : null;

            if (this._transform)
                this._transform.visual = visual;

            if (this._visual)
                this.configureVisual(this._visual);
            this.invalidate();
        }

        public configureVisual(visual: JQuery): void {
            visual.data("jsidea-display-element", this);
            visual.addClass("jsidea-display-element");
        }

        public deconfigureVisual(visual: JQuery): void {
            visual.data("jsidea-display-element", null);
            visual.removeClass("jsidea-display-element");
        }

        public globalToLocal(x: number, y: number): jsidea.geom.IPoint {
            var wt = jsidea.geom.Transform.getWindowTransform(this._visual);
            wt.invert();
            return wt.transform(x, y);
        }

        public localToGlobal(x: number, y: number): jsidea.geom.IPoint {
            var wt = jsidea.geom.Transform.getWindowTransform(this._visual);
            return wt.transform(x, y);
        }

        public get width(): number {
            return this._visual.width();
        }

        public set width(value: number) {
            if (this._visual.width() == value)
                return;
            this._visual.width(value);
            this._isDirtySize = true;
            this.invalidate();
        }

        public get height(): number {
            return this._visual.height();
        }

        public set height(value: number) {
            if (this._visual.height() == value)
                return;
            this._visual.height(value);
            this._isDirtySize = true;
            this.invalidate();
        }

        public get offsetX(): number {
            return this._htmlElement ? this._htmlElement.offsetLeft : 0;
        }

        public set offsetX(value: number) {
            if(!this._htmlElement)
                return;
            if (this._htmlElement.offsetLeft == value)
                return;
            this._htmlElement.offsetLeft = value;
            this._isDirtyOffset = true;
            this.invalidate();
        }

        public get offsetY(): number {
            return this._htmlElement ? this._htmlElement.offsetTop : 0;
        }

        public set offsetY(value: number) {
            if(!this._htmlElement)
                return;
            if (this._htmlElement.offsetTop == value)
                return;
            this._htmlElement.offsetTop = value;
            this._isDirtyOffset = true;
            this.invalidate();
        }

        public get opacity(): number {
            return this._visual ? parseNumber(this._visual.css("opacity"), 1) : 1;
        }

        public set opacity(value: number) {
            if (this._visual)
                this._visual.css("opacity", value);
        }

        public get visible(): boolean {
            return this._visual ? !this._visual.hasClass("hidden") : false;
        }

        public set visible(value: boolean) {
            if (this._visual)
                this._visual.toggleClass("hidden", !value);
        }

        public get added(): boolean {
            return this._htmlElement ? jQuery.contains(document.body, this._htmlElement) : false;
        }

        public get presented(): boolean {
            return this._visual ? this._visual.is(":visible") : false;
        }

        public validate(): void {
            if (this._invalidated) {
                this.unbind("tick.display_object");
            }

            if (this._isDirtyOffset) {

            }

            if (this._isDirtySize) {

            }

            this._isDirtyOffset = false;
            this._isDirtySize = false;
            this._invalidated = false;
        }

        public invalidate(): void {
            if (this._invalidated)
                return;
            this._invalidated = true;
            this.bind("tick.display_object", this.validate, this);
        }

        public dispose(): void {
            if (this._transform)
                this._transform.dispose();
            if (this._visual)
                this._visual.remove();
            this.visual = null;
            this._transform = null;
            super.dispose();
        }

        public qualifiedClassName(): string {
            return "jsidea.display.Element";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}