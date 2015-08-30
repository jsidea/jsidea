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
    export class Position {
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
            //            var style = Style.create(element);
            var point = this.calc(element);
            var style = this._to.size.style;
            var size = this._to.size;
            //            console.log(point.x, point.y);
            
            //            var pt = mode.transform(new geom.Point3D(), element, style);
            //            point.x = math.Number.roundTo(point.x, 50);
            //            point.y = math.Number.roundTo(point.y, 50);
            
            //the point in "Position"-space
            mode.transform(point, element, style);
            
            //clamp it by its "natural" limits
            mode.clamp(point, element, style);
            
            //TODO: use the correct box model
            var toBox = this.to.boxModel || BoxModel.BORDER;

            var box = size.bounds(toBox);

            this.clamp(point, box.width, box.height);
            
            //apply the final point
            mode.apply(point, element, style);
            
            //            var to = geom.Transform.create(element.parentElement);
            //            var gl = to.localToGlobal(point.x, point.y, 0);
            //            gl.x = math.Number.roundTo(gl.x, 50);
            //            gl.y = math.Number.roundTo(gl.y, 50);
            //            var lc = geom.Transform.create(element.parentElement).globalToLocal(gl.x, gl.y, 0);
            //            point.x = lc.x;
            //            point.y = lc.y;
            //            mode.apply(point, element, layout.Style.create(element));

            //            var to = geom.Transform.create(element);
            //            var gl = to.localToGlobal(0, 0, 0);
            //            gl.x = math.Number.roundTo(gl.x, 50);
            //            gl.y = math.Number.roundTo(gl.y, 50);
            //            var lc = to.globalToLocal(gl.x, gl.y, 0);
            //            to.matrix.prependPositionRaw(lc.x, lc.y, 0);
            //            point.x = to.matrix.m41;
            //            point.y = to.matrix.m42;
            //            point.z = 0;
            //            mode.apply(point, element, layout.Style.create(element));
            
            //            var to = geom.Transform.create(element);
            //            var gl = to.localToGlobal(0, 0, 0);
            //            gl.x = math.Number.roundTo(gl.x, 50);
            //            gl.y = math.Number.roundTo(gl.y, 50);
            //            var lc = to.globalToLocalPoint(gl);
            //            to.matrix.prependPositionRaw(lc.x, lc.y, 0);
            //            point.x = to.matrix.m41;
            //            point.y = to.matrix.m42;
            //            point.z = to.matrix.m43;
            //            mode.transform(point, element, to.size.style);
            //            mode.apply(point, element, to.size.style);
            
//            var to = geom.Transform.create(element);
//            var gl = to.localToGlobal(0, 0, 0);
//            gl.x = math.Number.roundTo(gl.x, 50);
//            gl.y = math.Number.roundTo(gl.y, 50);
//            var lc = to.globalToLocalPoint(gl);
//            to.matrix.prependPositionRaw(lc.x, lc.y, 0);
//            point.x = to.matrix.m41;
//            point.y = to.matrix.m42;
//            point.z = to.matrix.m43;
//            mode.transform(point, element, to.size.style);
//            mode.apply(point, element, to.size.style);
        }

        private snap(to: geom.Transform): geom.Point3D {
            var gl = to.localToGlobal(0, 0, 0);
            gl.x = math.Number.roundTo(gl.x, 50);
            gl.y = math.Number.roundTo(gl.y, 50);
            var lc = to.globalToLocalPoint(gl);
            to.matrix.prependPositionRaw(lc.x, lc.y, 0);

            var point: geom.Point3D = new geom.Point3D();
            point.x = to.matrix.m41;
            point.y = to.matrix.m42;
            point.z = to.matrix.m43;
            return point;
        }

        public calc(element: HTMLElement, ret: geom.Point3D = new geom.Point3D()): geom.Point3D {
            if (!element)
                return ret;

            //retrieve "of"-element
            var fromElement = this.from.element || element.ownerDocument.documentElement;

            this._from.update(fromElement, this.from.transformMode);
            this._to.update(element, this.to.transformMode);

            var toBox = this.to.boxModel || BoxModel.BORDER;
            var fromBox = this.from.boxModel || BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = this._to.size.bounds(toBox);
            var toX: number = math.Number.relation(this.to.x, sizeTo.width, 0) + math.Number.relation(this.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(this.to.y, sizeTo.height, 0) + math.Number.relation(this.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = this._from.size.bounds(fromBox);
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
//            if (this.bounds.element) {
//                //                if (this.bounds.element == element)
//                //                    console.warn("The bounds element cannot be the \"to\"-element.");
//                //                else 
//                if (element.contains(this.bounds.element))
//                    console.warn("The bounds element cannot be a child-element of the \"to\"-element.");
//                else {
//                    var toBox = this.bounds.toBoxModel || BoxModel.BORDER;
//                    var boundsBox = this.bounds.boxModel || BoxModel.BORDER;
//
//                    this._bounds.update(this.bounds.element, this.bounds.transformMode);
//                    var boundsSize = this._bounds.size.bounds(boundsBox);
//                    var toSize = this._to.size.bounds(toBox);
//
//                    lc = this._to.clamp(this._bounds, lc, toSize.width, toSize.height, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
//                    lc = this._to.clamp(this._bounds, lc, 0, toSize.height, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
//                    lc = this._to.clamp(this._bounds, lc, toSize.width, 0, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
//                    lc = this._to.clamp(this._bounds, lc, 0, 0, 0, boundsSize.width, 0, boundsSize.height, boundsBox, toBox);
//                }
//            }
            

            var mt = new geom.Matrix3D();
            mt.appendPositionRaw(lc.x, lc.y, 0);
            this._to.prepend(mt);

            var point = this.snap(this._to);
            return point;
            
            //prepend the local offset
            var mat = this._to.matrix.clone();
            mat.prependPositionRaw(lc.x, lc.y, 0);
            
            //            var to = geom.Transform.create(element);
            //            var gl = to.localToGlobal(0, 0, 0);
            //            gl.x = math.Number.roundTo(gl.x, 50);
            //            gl.y = math.Number.roundTo(gl.y, 50);
            //            var lc = to.globalToLocalPoint(gl);
            //            to.matrix.prependPositionRaw(lc.x, lc.y, 0);
            //            point.x = to.matrix.m41;
            //            point.y = to.matrix.m42;
            //            point.z = to.matrix.m43;

            return mat.getPosition(ret);
        }

        private clamp(point: geom.Point3D, width: number, height: number, depth: number = 1000): geom.Point3D {
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
            this._to.dispose();
            this._from.dispose();
            this._bounds.dispose();
            this._to = null;
            this._from = null;
            this._bounds = null;
            this.to = null;
            this.from = null;
            this.bounds = null;
            this.mode = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}