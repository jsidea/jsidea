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
        transformMode?: geom.ITransformMode;
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
        transformMode?: geom.ITransformMode;
    }
    export class Position implements IDisposable {
        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public bounds: IPositionBounds = {};
        public mode: IPositionMode;

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
            return this;
        }

        public apply(element?: HTMLElement, mode?: IPositionMode): void {
            element = element || this.to.element;
            if (!element)
                return;

            mode = mode || this.mode || PositionMode.TRANSFORM;

            //the un-clamped point
            var style = layout.Style.create(element);
            var point = this.calc(element);
            
            //the point in "Position"-space
            mode.transform(point, element, style);
            
            //TODO: use the correct box model
            var size = layout.BoxSizing.create(element);
            var box = size.getBox(null, layout.BoxModel.BORDER);
            this.clamp(point, box.width, box.height);
            
            //apply the final point
            mode.apply(point, element, style);
        }

        public calc(element: HTMLElement, ret: geom.Point3D = new geom.Point3D()): geom.Point3D {
            if (!element)
                return ret;

            //retrieve "of"-element
            var fromElement = this.from.element || element.ownerDocument.documentElement;

            this._from.update(fromElement, this.from.transformMode);
            this._to.update(element, this.to.transformMode);

            var toBox = this.to.boxModel || layout.BoxModel.BORDER;
            var fromBox = this.from.boxModel || layout.BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = this._to.boxSizing.getBox(layout.BoxModel.BORDER, toBox);
            var toX: number = math.Number.relation(this.to.x, sizeTo.width, 0) + math.Number.relation(this.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(this.to.y, sizeTo.height, 0) + math.Number.relation(this.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = this._from.boxSizing.getBox(layout.BoxModel.BORDER, fromBox);
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
            var lc = this._from.localToLocal(this._to, fromX, fromY, 0, fromBox, toBox);
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
                    var toBox = this.bounds.toBoxModel || BoxModel.BORDER;
                    var boundsBox = this.bounds.boxModel || BoxModel.BORDER;

                    this._bounds.update(this.bounds.element, this.bounds.transformMode);
                    var boundsSize = this._bounds.boxSizing.getBox(BoxModel.BORDER, boundsBox);
                    var toSize = this._to.boxSizing.getBox(BoxModel.BORDER, toBox);

                    lc = this._to.clamp(this._bounds, lc, toSize.width, toSize.height, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
                    lc = this._to.clamp(this._bounds, lc, 0, toSize.height, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
                    lc = this._to.clamp(this._bounds, lc, toSize.width, 0, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
                    lc = this._to.clamp(this._bounds, lc, 0, 0, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
                }
            }
            
            //prepend the local offset
            var mat = this._to.matrix.clone();
            mat.prependPositionRaw(lc.x, lc.y, 0);

            return mat.getPosition(ret);
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