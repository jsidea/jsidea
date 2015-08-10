module jsidea.layout {
    export interface IPositionValue {
        x?: number | string;
        y?: number | string;
        offsetX?: number | string;
        offsetY?: number | string;
        minX?: number | string;
        minY?: number | string;
        maxX?: number | string;
        maxY?: number | string;
    }
    export class Position {
        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public fromElement: HTMLElement = null;
        public boundsElement: HTMLElement = null;
        public toBox: string = layout.BoxModel.BORDER;
        public fromBox: string = layout.BoxModel.BORDER;
        public useTransform: boolean = true;
        public transformMode: string = geom.Transform.MODE_AUTO;
        private _from: geom.Transform = new geom.Transform();
        private _to: geom.Transform = new geom.Transform();
        private _bounds: geom.Transform = new geom.Transform();

        constructor() {
        }

        public static create(): Position {
            return new Position();
        }

        public clone(): Position {
            var p = new Position();
            p.to = this.to;
            p.from = this.from;
            p.from = this.from;
            p.toBox = this.toBox;
            p.fromBox = this.fromBox;
            p.useTransform = this.useTransform;
            return p;
        }

        public apply(element: HTMLElement): void {
            if (!element)
                return;

            var pt = this.calc(element);
            var m = geom.Matrix3D.create(element, Buffer._APPLY_POSITION);
            if (this.useTransform) {
                m.m41 += pt.x;
                m.m42 += pt.y;
                if (system.Caps.isSafari)
                    element.style["webkitTransform"] = m.getCSS();
                else
                    element.style.transform = m.getCSS();
            }
            else {
                pt.x += math.Number.parse(element.style.left, 0) - m.m41;
                pt.y += math.Number.parse(element.style.top, 0) - m.m42;
                element.style.left = Math.round(pt.x) + "px";
                element.style.top = Math.round(pt.y) + "px";
            }
        }

        public calc(element: HTMLElement): geom.Point3D {
            if (!element)
                return null;

            //retrieve "of"-element
            var fromElement = this.fromElement ? this.fromElement : element.ownerDocument.documentElement;

            this._from.update(fromElement, this.transformMode);
            this._to.update(element, this.transformMode);
            
            //transform box-models of "to"
            var sizeTo = Buffer._APPLY_POSITION_SIZE_TO.setTo(element.offsetWidth, element.offsetHeight);
            this._to.boxModel.size(sizeTo, this.toBox, layout.BoxModel.BORDER);
            var toX: number = math.Number.parseRelation(this.to.x, sizeTo.x, 0) + math.Number.parseRelation(this.to.offsetX, sizeTo.x, 0);
            var toY: number = math.Number.parseRelation(this.to.y, sizeTo.y, 0) + math.Number.parseRelation(this.to.offsetY, sizeTo.y, 0);
            
            //transform box-models of "from"
            var sizeFrom = Buffer._APPLY_POSITION_SIZE_FROM.setTo(fromElement.offsetWidth, fromElement.offsetHeight);
            this._from.boxModel.size(sizeFrom, this.fromBox, layout.BoxModel.BORDER);
            var fromX: number = math.Number.parseRelation(this.from.x, sizeFrom.x, 0) + math.Number.parseRelation(this.from.offsetX, sizeFrom.x, 0);
            var fromY: number = math.Number.parseRelation(this.from.y, sizeFrom.y, 0) + math.Number.parseRelation(this.from.offsetY, sizeFrom.y, 0);
            
            //the transfrom: "from" -> "to"
            var point = this._from.localToLocal(
                this._to,
                fromX,
                fromY,
                0,
                this.toBox,
                this.fromBox);
            
            //            console.log("LOC", point.x, point.y);

            //shift to origin/pivot/to-point
            //            point.x -= toX;
            //            point.y -= toY;
            
            point.z = 0;
//            point.x -= this._to.matrix.m41;
//            point.y -= this._to.matrix.m42;
            point = this._to.matrix.unproject(point);
            
            //            point.x += this._to.matrix.m41;
            //            point.y += this._to.matrix.m42;
            
            //from "to" -> parent
            //            point = this._to.matrix.project(point);
            
            //            var pk = this._to.matrix.getMatrix2D().transform(point);
            //            point.x = pk.x;
            //            point.y = pk.y;
            
            //            point.x -= this._to.matrix.m41;
            //            point.y -= this._to.matrix.m42;
            
            //            point.x = point.x - this._to.matrix.m41;
            //            point.y = point.y - this._to.matrix.m42;
            
            //            point = this._to.matrix.project(point);

            //keep in bounds
            if (this.boundsElement) {
                if (this.boundsElement == element)
                    throw new Error("The bounds element cannot be the \"to\"-element.");
                if (element.contains(this.boundsElement))
                    throw new Error("The bounds element cannot be a child-element of the \"to\"-element.");
                var toBox = layout.BoxModel.BORDER;
                var fromBox = layout.BoxModel.PADDING;
                this._bounds.update(this.boundsElement, this.transformMode);
                point = this._to.clampBox2(this._bounds, toBox, fromBox, point, point);
            }

            return point;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.from = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}