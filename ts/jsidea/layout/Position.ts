module jsidea.layout {
    export interface IPositionValue {
        x?: number | string;
        y?: number | string;
        offsetX?: number | string;
        offsetY?: number | string;
        lockX?: boolean;
        lockY?: boolean;
        minX?: number | string;
        minY?: number | string;
        maxX?: number | string;
        maxY?: number | string;
    }
    export class Position {
        private _box: layout.BoxModel = new layout.BoxModel();

        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public fromElement: HTMLElement = null;
        public toBox: string = layout.BoxModel.BORDER;
        public fromBox: string = layout.BoxModel.BORDER;
        public useTransform: boolean = true;
        public transformMode: string = geom.Transform.MODE_AUTO;
        private _from: geom.Transform = new geom.Transform();
        private _to: geom.Transform = new geom.Transform();

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
                m.m41 = pt.x;
                m.m42 = pt.y;
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
                return;

            //retrieve "of"-element
            var fromElement = this.fromElement ? this.fromElement : document.body;
            
            //transform box-models of visual
            this._box.update(element);
            var sizeTo = Buffer._APPLY_POSITION_SIZE_TO.setTo(element.offsetWidth, element.offsetHeight);
            this._box.size(sizeTo, this.toBox, layout.BoxModel.BORDER);
            var toX: number = math.Number.parseRelation(this.to.x, sizeTo.x, 0) + math.Number.parseRelation(this.to.offsetX, sizeTo.x, 0);
            var toY: number = math.Number.parseRelation(this.to.y, sizeTo.y, 0) + math.Number.parseRelation(this.to.offsetY, sizeTo.y, 0);

            //transform box-models of from
            this._box.update(fromElement);
            var sizeFrom = Buffer._APPLY_POSITION_SIZE_FROM.setTo(fromElement.offsetWidth, fromElement.offsetHeight);
            this._box.size(sizeFrom, this.fromBox, layout.BoxModel.BORDER);
            var fromX: number = math.Number.parseRelation(this.from.x, sizeFrom.x, 0) + math.Number.parseRelation(this.from.offsetX, sizeFrom.x, 0);
            var fromY: number = math.Number.parseRelation(this.from.y, sizeFrom.y, 0) + math.Number.parseRelation(this.from.offsetY, sizeFrom.y, 0);

            if (this.from.lockX)
                fromX = math.Number.parseRelation(this.from.offsetX, sizeFrom.x, 0);
            if (this.from.lockY)
                fromY = math.Number.parseRelation(this.from.offsetY, sizeFrom.y, 0);
            
            //the transfrom from "from" to visual
            this._from.update(fromElement, this.transformMode);
            this._to.update(element, this.transformMode);
            var lc = this._from.localToLocal(
                this._to,
                fromX,
                fromY,
                0,
                this.toBox,
                this.fromBox);
            lc.x -= toX;
            lc.y -= toY;

            var m = geom.Matrix3D.createWithPerspective(element, Buffer._APPLY_POSITION);
            var pt = m.project(lc);

            if (this.to.lockX)
                pt.x = m.m41;
            if (this.to.lockY)
                pt.y = m.m42;
            
            return pt.clone();
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