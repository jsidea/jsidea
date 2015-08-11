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
            p.fromElement = this.fromElement;
            p.boundsElement = this.boundsElement;
            p.toBox = this.toBox;
            p.fromBox = this.fromBox;
            p.useTransform = this.useTransform;
            p.transformMode = this.transformMode;
            return p;
        }

        public apply(element: HTMLElement): void {
            if (!element)
                return;

            var m = this.calc(element);            
            
            //the strangest bug ever
            //it applies the zoom-factor as a scaling factor
            //for the z-value (m43)
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

            //create matrix
            var lc = this._from.localToLocal(this._to, fromX, fromY, 0, this.toBox, this.fromBox);
            lc.x -= toX;
            lc.y -= toY;
            var ma = this._to.matrix.clone();
            
            
            //keep in bounds
            if (this.boundsElement) {
                if (this.boundsElement == element)
                    throw new Error("The bounds element cannot be the \"to\"-element.");
                if (element.contains(this.boundsElement))
                    throw new Error("The bounds element cannot be a child-element of the \"to\"-element.");
                var toBox = layout.BoxModel.BORDER;
                var fromBox = layout.BoxModel.BORDER;
                
                this._bounds.update(this.boundsElement, this.transformMode);
                
                lc = this._to.clamp(this._bounds, lc, 0, 1024, 0, 1024, toBox, fromBox);
                
//                var point = ma.getPosition();
//                point.subPoint(this._to.matrix.getPosition());
//                point = this._to.clamp(this._bounds, point, 0, 1024, 0, 1024, toBox, fromBox);
//                point.addPoint(this._to.matrix.getPosition());
//                ma.setPosition(point);
            } 
            
            ma.prependPositionRaw(lc.x, lc.y, 0);

            //keep in bounds
            //            if (this.boundsElement) {
            //                if (this.boundsElement == element)
            //                    throw new Error("The bounds element cannot be the \"to\"-element.");
            //                if (element.contains(this.boundsElement))
            //                    throw new Error("The bounds element cannot be a child-element of the \"to\"-element.");
            //                var toBox = layout.BoxModel.BORDER;
            //                var fromBox = layout.BoxModel.PADDING;
            //                this._bounds.update(this.boundsElement, this.transformMode);
            //                point = this._to.clampBox2(this._bounds, toBox, fromBox, point, point);
            //            }            
            
            return ma;
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