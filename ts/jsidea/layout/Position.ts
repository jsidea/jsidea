module jsidea.layout {
    export interface IPositionValue {
        element?: HTMLElement;
        x?: any;
        y?: any;
        offsetX?: any;
        offsetY?: any;
        minX?: any;
        maxX?: any;
        minY?: any;
        maxY?: any;
        minZ?: any;
        maxZ?: any;
        boxModel?: IBoxModel;
    }
    export interface IPositionBounds {
        element?: HTMLElement;
        minX?: any;
        maxX?: any;
        minY?: any;
        maxY?: any;
        minZ?: any;
        maxZ?: any;
        boxModel?: IBoxModel;
        toBoxModel?: IBoxModel;
    }
    export class Position {
        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public bounds: IPositionBounds = {};
        public useTransform: boolean = true;
        public transformMode: string = geom.Transform.MODE_AUTO;

        private _to: geom.Transform = new geom.Transform();
        private _from: geom.Transform = new geom.Transform();
        private _bounds: geom.Transform = new geom.Transform();

        constructor() {
        }

        public static create(): Position {
            return new Position();
        }

        public clone(): Position {
            return (new Position()).copyFrom(this);
        }

        public copyFrom(position: Position): Position {
            this.to = position.to;
            this.from = position.from;
            this.bounds = position.bounds;
            this.useTransform = position.useTransform;
            this.transformMode = position.transformMode;
            return this;
        }

        public apply(element?: HTMLElement): void {
            element = element ? element : this.to.element;
            if (!element)
                return;

            var m = this.calc(element);            
            
            //the strangest bug ever
            //it applies the zoom-factor as a scaling factor
            //for the z-value (m43)
            //-->> zoom does not apply to z value bug
            if (system.Caps.isWebKit) {
                var scale = 1 / (window.innerWidth / window.outerWidth);
                m.m43 *= scale;
            }

            if (this.useTransform) {
                element.style.transform = m.getCSS();
            }
            else {
                var x = math.Number.parse(element.style.left, 0);
                var y = math.Number.parse(element.style.top, 0);
                element.style.left = Math.round(m.m41 + x) + "px";
                element.style.top = Math.round(m.m42 + y) + "px";
            }
        }

        public calc(element: HTMLElement): geom.Matrix3D {
            if (!element)
                return null;

            //retrieve "of"-element
            var fromElement = this.from.element || element.ownerDocument.documentElement;

            this._from.update(fromElement, this.transformMode);
            this._to.update(element, this.transformMode);

            var toBox = this.to.boxModel || layout.BoxModel.BORDER;
            var fromBox = this.from.boxModel || layout.BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = this._to.boxModel.getBox(toBox, layout.BoxModel.BORDER);
            var toX: number = math.Number.parseRelation(this.to.x, sizeTo.width, 0) + math.Number.parseRelation(this.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.parseRelation(this.to.y, sizeTo.height, 0) + math.Number.parseRelation(this.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = this._from.boxModel.getBox(fromBox, layout.BoxModel.BORDER);
            var fromX: number = math.Number.parseRelation(this.from.x, sizeFrom.width, 0) + math.Number.parseRelation(this.from.offsetX, sizeFrom.width, 0);
            var fromY: number = math.Number.parseRelation(this.from.y, sizeFrom.height, 0) + math.Number.parseRelation(this.from.offsetY, sizeFrom.height, 0);
            
            //clamp from
            if (this.from.minX !== undefined)
                fromX = Math.max(fromX, math.Number.parseRelation(this.from.minX, sizeFrom.width, fromX));
            if (this.from.maxX !== undefined)
                fromX = Math.min(fromX, math.Number.parseRelation(this.from.maxX, sizeFrom.width, fromX));
            if (this.from.minY !== undefined)
                fromY = Math.max(fromY, math.Number.parseRelation(this.from.minY, sizeFrom.height, fromY));
            if (this.from.maxY !== undefined)
                fromY = Math.min(fromY, math.Number.parseRelation(this.from.maxY, sizeFrom.height, fromY)); 

            //calc local position
            var lc = this._from.localToLocal(this._to, fromX, fromY, 0, toBox, fromBox);
            lc.x -= toX;
            lc.y -= toY;
            
            //keep in bounds
            if (this.bounds.element) {
                if (this.bounds.element == element)
                    console.warn("The bounds element cannot be the \"to\"-element.");
                else if (element.contains(this.bounds.element))
                    console.warn("The bounds element cannot be a child-element of the \"to\"-element.");
                else {
                    var toBox = this.bounds.toBoxModel || layout.BoxModel.BORDER;
                    var boundsBox = this.bounds.boxModel || layout.BoxModel.BORDER;

                    this._bounds.update(this.bounds.element, this.transformMode);
                    var boundsSize = this._bounds.boxModel.getBox(boundsBox);
                    var toSize = this._to.boxModel.getBox(toBox);

                    lc = this._to.clamp(this._bounds, lc, toSize.width, toSize.height, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, 0, toSize.height, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, toSize.width, 0, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, 0, 0, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                }
            }
            
            //prepend the local offset
            var ma = this._to.matrix.clone();
            ma.prependPositionRaw(lc.x, lc.y, 0);
            
            //clamp to
            if (this.to.minX !== undefined)
                ma.m41 = Math.max(ma.m41, math.Number.parseRelation(this.to.minX, sizeTo.width, ma.m41));
            if (this.to.maxX !== undefined)
                ma.m41 = Math.min(ma.m41, math.Number.parseRelation(this.to.maxX, sizeTo.width, ma.m41));
            if (this.to.minY !== undefined)
                ma.m42 = Math.max(ma.m42, math.Number.parseRelation(this.to.minY, sizeTo.height, ma.m42));
            if (this.to.maxY !== undefined)
                ma.m42 = Math.min(ma.m42, math.Number.parseRelation(this.to.maxY, sizeTo.height, ma.m42));
            if (this.to.minZ !== undefined && !isNaN(this.to.minZ))
                ma.m43 = Math.max(ma.m43, this.to.minZ);
            if (this.to.maxZ !== undefined && !isNaN(this.to.maxZ))
                ma.m43 = Math.min(ma.m43, this.to.maxZ);

            return ma;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this._bounds = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}