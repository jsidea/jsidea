module jsidea.layout {
    export interface IPositionClamper {
        clamp(point: geom.Point3D, width: number, height: number, depth?: number): geom.Point3D;
    }
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
    export interface IPositionMode {
        apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void;
    }
    class TransformMode implements IPositionMode {
        private _point = new geom.Point3D();
        public apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void {
            this._point.setTo(
                matrix.m41,
                matrix.m42,
                matrix.m43);
            if (clamper)
                clamper.clamp(this._point, element.offsetWidth, element.offsetHeight);
            matrix.m41 = this._point.x;
            matrix.m42 = this._point.y;
            matrix.m43 = this._point.z;
            //WebKit bug
            if (system.Caps.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
    }
    class TopLeftMode implements IPositionMode {
        private _point = new geom.Point3D();
        public apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void {
            this._point.setTo(
                matrix.m41 + math.Number.parse(element.style.left, 0),
                matrix.m42 + math.Number.parse(element.style.top, 0),
                matrix.m43);
            if (clamper)
                clamper.clamp(this._point, element.offsetWidth, element.offsetHeight);
            element.style.left = Math.round(this._point.x) + "px";
            element.style.top = Math.round(this._point.y) + "px";
        }
    }
    class BottomRightMode implements IPositionMode {
        private _point = new geom.Point3D();
        public apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void {
            this._point.setTo(
                matrix.m41 + math.Number.parse(element.style.right, 0),
                matrix.m42 + math.Number.parse(element.style.bottom, 0),
                matrix.m43);
            if (clamper)
                clamper.clamp(this._point, element.offsetWidth, element.offsetHeight);
            element.style.left = Math.round(this._point.x) + "px";
            element.style.top = Math.round(this._point.y) + "px";
        }
    }
    class BackgroundMode implements IPositionMode {
        private _point = new geom.Point3D();
        private _box = new geom.Box2D();
        private _boxSizing = new layout.BoxSizing();
        public apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void {
            this._boxSizing.update(element);
            var bx = this._boxSizing.getBox(layout.BoxModel.PADDING, layout.BoxModel.BACKGROUND, this._box);
            this._point.setTo(
                matrix.m41 + bx.x,
                matrix.m42 + bx.y,
                matrix.m43);
            if (clamper)
                clamper.clamp(this._point, bx.width, bx.height);
            element.style.backgroundPosition = Math.round(this._point.x) + "px " + Math.round(this._point.y) + "px";
        }
    }
    class ScrollMode implements IPositionMode {
        public apply(matrix: geom.Matrix3D, element: HTMLElement, clamper?: IPositionClamper): void {

        }
    }
    export class Position implements IPositionClamper, IDisposable {
        public static TRANSFORM: IPositionMode = new TransformMode();
        public static TOP_LEFT: IPositionMode = new TopLeftMode();
        public static BACKGROUND: IPositionMode = new BackgroundMode();
        public static SCROLL: IPositionMode = new ScrollMode();

        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public bounds: IPositionBounds = {};
        public mode: IPositionMode;
        public transformMode: geom.ITransformMode;

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
            this.mode = position.mode;
            this.transformMode = position.transformMode;
            return this;
        }

        public apply(element?: HTMLElement, mode?: IPositionMode): void {
            element = element ? element : this.to.element;
            if (!element)
                return;

            mode = mode || this.mode || Position.TRANSFORM;

            var m = this.calc(element);
            mode.apply(m, element, this);
        }

        public calc(element: HTMLElement, ret: geom.Matrix3D = new geom.Matrix3D()): geom.Matrix3D {
            if (!element)
                return ret;

            //retrieve "of"-element
            var fromElement = this.from.element || element.ownerDocument.documentElement;

            this._from.update(fromElement, this.transformMode);
            this._to.update(element, this.transformMode);

            var toBox = this.to.boxModel || layout.BoxModel.BORDER;
            var fromBox = this.from.boxModel || layout.BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = this._to.boxSizing.getBox(toBox, layout.BoxModel.BORDER);
            var toX: number = math.Number.relation(this.to.x, sizeTo.width, 0) + math.Number.relation(this.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(this.to.y, sizeTo.height, 0) + math.Number.relation(this.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = this._from.boxSizing.getBox(fromBox, layout.BoxModel.BORDER);
            var fromX: number = math.Number.relation(this.from.x, sizeFrom.width, 0) + math.Number.relation(this.from.offsetX, sizeFrom.width, 0);
            var fromY: number = math.Number.relation(this.from.y, sizeFrom.height, 0) + math.Number.relation(this.from.offsetY, sizeFrom.height, 0);
            
            //clamp from
            if (this.from.minX !== undefined)
                fromX = Math.max(fromX, math.Number.relation(this.from.minX, sizeFrom.width, fromX));
            if (this.from.maxX !== undefined)
                fromX = Math.min(fromX, math.Number.relation(this.from.maxX, sizeFrom.width, fromX));
            if (this.from.minY !== undefined)
                fromY = Math.max(fromY, math.Number.relation(this.from.minY, sizeFrom.height, fromY));
            if (this.from.maxY !== undefined)
                fromY = Math.min(fromY, math.Number.relation(this.from.maxY, sizeFrom.height, fromY)); 

            //calc local position
            var lc = this._from.localToLocal(this._to, fromX, fromY, 0, toBox, fromBox);
            lc.x -= toX;
            lc.y -= toY;
            
            //keep in bounds
            if (this.bounds.element) {
                //                if (this.bounds.element == element)
                //                    console.warn("The bounds element cannot be the \"to\"-element.");
                //                else 
                if (element.contains(this.bounds.element))
                    console.warn("The bounds element cannot be a child-element of the \"to\"-element.");
                else {
                    var toBox = this.bounds.toBoxModel || layout.BoxModel.BORDER;
                    var boundsBox = this.bounds.boxModel || layout.BoxModel.BORDER;

                    this._bounds.update(this.bounds.element, this.transformMode);
                    var boundsSize = this._bounds.boxSizing.getBox(boundsBox);
                    var toSize = this._to.boxSizing.getBox(toBox);

                    lc = this._to.clamp(this._bounds, lc, toSize.width, toSize.height, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, 0, toSize.height, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, toSize.width, 0, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                    lc = this._to.clamp(this._bounds, lc, 0, 0, 0, boundsSize.width, 0, boundsSize.height, toBox, boundsBox);
                }
            }
            
            //prepend the local offset
            ret.copyFrom(this._to.matrix);
            ret.prependPositionRaw(lc.x, lc.y, 0);

            return ret;
        }

        public clamp(point: geom.Point3D, width: number, height: number, depth: number = 1000): geom.Point3D {
            if (this.to.minX !== undefined)
                point.x = Math.max(point.x, math.Number.relation(this.to.minX, width, point.x));
            if (this.to.maxX !== undefined)
                point.x = Math.min(point.x, math.Number.relation(this.to.maxX, width, point.x));
            if (this.to.minY !== undefined)
                point.y = Math.max(point.y, math.Number.relation(this.to.minY, height, point.y));
            if (this.to.maxY !== undefined)
                point.y = Math.min(point.y, math.Number.relation(this.to.maxY, height, point.y));
            if (this.to.minZ !== undefined)
                point.z = Math.max(point.z, math.Number.relation(this.to.minZ, depth, point.z));
            if (this.to.maxY !== undefined)
                point.z = Math.min(point.z, math.Number.relation(this.to.maxZ, depth, point.z));
            return point;
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