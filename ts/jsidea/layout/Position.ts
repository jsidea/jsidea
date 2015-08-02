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
                return null;

            //retrieve "of"-element
            var fromElement = this.fromElement ? this.fromElement : element.ownerDocument.documentElement;
            
            this._from.update(fromElement, this.transformMode);
            this._to.update(element, this.transformMode);
            
            //transform box-models of "to"
            var sizeTo = Buffer._APPLY_POSITION_SIZE_TO.setTo(element.offsetWidth, element.offsetHeight);
            this._to.box.size(sizeTo, this.toBox, layout.BoxModel.BORDER);
            var toX: number = math.Number.parseRelation(this.to.x, sizeTo.x, 0) + math.Number.parseRelation(this.to.offsetX, sizeTo.x, 0);
            var toY: number = math.Number.parseRelation(this.to.y, sizeTo.y, 0) + math.Number.parseRelation(this.to.offsetY, sizeTo.y, 0);

            //transform box-models of "from"
            var sizeFrom = Buffer._APPLY_POSITION_SIZE_FROM.setTo(fromElement.offsetWidth, fromElement.offsetHeight);
            this._from.box.size(sizeFrom, this.fromBox, layout.BoxModel.BORDER);
            var fromX: number = math.Number.parseRelation(this.from.x, sizeFrom.x, 0) + math.Number.parseRelation(this.from.offsetX, sizeFrom.x, 0);
            var fromY: number = math.Number.parseRelation(this.from.y, sizeFrom.y, 0) + math.Number.parseRelation(this.from.offsetY, sizeFrom.y, 0);
            
            //the transfrom from "from" to "to"
            var lc = this._from.localToLocal(
                this._to,
                fromX,
                fromY,
                0,
                this.toBox,
                this.fromBox);

            lc.x -= toX;
            lc.y -= toY;

            var m = Position.createWithPerspective(element, Buffer._APPLY_POSITION);
            var pt = m.project(lc).clone();
            
            //var pt = (new geom.Matrix3D()).project(lc).clone();

            //restrict to box
            //hhmmmmmmm the offset will be wrong in many cases
            //get layout.StyleChain and read that position
            //mmmmm?????? fuck
            //            var bounds = geom.Transform.create(element.parentElement);
            //            var node = layout.StyleChain.create(element);
            //            var container = geom.Transform.create(node.isSticked ? element.ownerDocument.body : element.parentElement);
            //            var pos = node.position;
            //            var bnds = m.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            //            
            //            pt.addPoint2D(pos);
            //            
            ////            pt.x -= bnds.x;
            ////            pt.y -= bnds.y;
            //            
            //            var glc = container.localToGlobal(pt.x, pt.y, 0);
            //            
            //            var conLc = bounds.globalToLocal(glc.x, glc.y, 0);
            ////            conLc = m.project(conLc);
            //            conLc.x = math.Number.clamp(conLc.x, 0, bounds.element.offsetWidth);
            //            conLc.y = math.Number.clamp(conLc.y, 0, bounds.element.offsetHeight);
            //            glc = bounds.localToGlobal(conLc.x, conLc.y, 0);
            //            
            //            
            //            var loc = container.globalToLocal(glc.x, glc.y, 0);
            //            pt.x = loc.x - pos.x;
            //            pt.y = loc.y - pos.y;
            
            //            m.invert();
            //            var pt = m.project(pt).clone();
            
            return pt;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.from = null;
        }

        private static createWithPerspective(element: HTMLElement, ret = new geom.Matrix3D()): geom.Matrix3D {
            ret.identity();
            if (element.ownerDocument) {
                ret.appendCSS(window.getComputedStyle(element).transform);
                if (element.parentElement) {
                    var parentStyle = window.getComputedStyle(element.parentElement);
                    var perspective = math.Number.parse(parentStyle.perspective, 0);
                    if (perspective) {
                        var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
                        var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
                        var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

                        ret.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
                        ret.appendPerspective(perspective);
                        ret.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);
                    }
                }
            }
            return ret;
        }

        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}