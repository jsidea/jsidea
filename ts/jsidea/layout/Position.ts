module jsidea.layout {
    export interface IPositionValue {
        x?: number | string;
        y?: number | string;
        offsetX?: number | string;
        offsetY?: number | string;
    }
    export class Position {
        private _box: geom.BoxModel = new geom.BoxModel();

        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public fromElement: HTMLElement = null;
        public toBox: string = geom.BoxModel.BORDER;
        public fromBox: string = geom.BoxModel.BORDER;
        public useTransform: boolean = true;
        public transformMode: string = geom.Transform.MODE_AUTO;
        private _transform: geom.Transform = new geom.Transform();

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

            //retrieve of-element
            var fromElement = this.fromElement ? this.fromElement : document.body;
            
            //transform box-models of visual
            this._box.parse(element);
            var sizeTo = Buffer._APPLY_POSITION_SIZE_TO.setTo(element.offsetWidth, element.offsetHeight);
            this._box.size(sizeTo, this.toBox, geom.BoxModel.BORDER);
            var toX: number = math.Number.parseRelation(this.to.x, sizeTo.x, 0) + math.Number.parseRelation(this.to.offsetX, sizeTo.x, 0);
            var toY: number = math.Number.parseRelation(this.to.y, sizeTo.y, 0) + math.Number.parseRelation(this.to.offsetY, sizeTo.y, 0);

            //transform box-models of from
            this._box.parse(fromElement);
            var sizeFrom = Buffer._APPLY_POSITION_SIZE_FROM.setTo(fromElement.offsetWidth, fromElement.offsetHeight);
            this._box.size(sizeFrom, this.fromBox, geom.BoxModel.BORDER);
            var fromX: number = math.Number.parseRelation(this.from.x, sizeFrom.x, 0) + math.Number.parseRelation(this.from.offsetX, sizeFrom.x, 0);
            var fromY: number = math.Number.parseRelation(this.from.y, sizeFrom.y, 0) + math.Number.parseRelation(this.from.offsetY, sizeFrom.y, 0);
            
            //the transfrom from "from" to visual
            this._transform.update(fromElement, this.transformMode);
            var lc = this._transform.localToLocal(
                element,
                fromX,
                fromY,
                0,
                this.toBox,
                this.fromBox);
            lc.x -= toX;
            lc.y -= toY;

            var m = geom.Matrix3D.create(element, Buffer._APPLY_POSITION);
            var pt = m.unproject(lc);

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

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.from = null;
        }

        public static qualifiedClassName(): string {
            return "jsidea.layout.Position";
        }

        public toString(): string {
            return "[" + Position.qualifiedClassName() + "]";
        }
    }
}