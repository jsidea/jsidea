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
                return null;

            //retrieve "of"-element
            var fromElement = this.fromElement ? this.fromElement : element.ownerDocument.documentElement;
            
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

            var m = Position.createWithPerspective(element, Buffer._APPLY_POSITION);
            var pt = m.project(lc).clone();
            
            var par = geom.Transform.create(element.parentElement);
            var con = geom.Transform.create(element.parentElement.parentElement);
            //get the new global position
            var glc = par.localToGlobal(pt.x + element._node.position.x, pt.y + element._node.position.y, 0);//element._node.position.x
            var conLc = con.globalToLocal(glc.x, glc.y, 0);
            conLc.x = math.Number.clamp(conLc.x, 0, con.element.offsetWidth);
            conLc.y = math.Number.clamp(conLc.y, 0, con.element.offsetHeight);
            glc = con.localToGlobal(conLc.x, conLc.y, 0);
            var loc = par.globalToLocal(glc.x, glc.y, 0);
            pt.x = loc.x - element._node.position.x;
            pt.y = loc.y - element._node.position.y;
            
//            pt = m.project(pt).clone();
            
            
            //            var glc = this._to.localToGlobal(0, 0);
            //            var par = geom.Transform.create(element.parentElement);
            //            var parLc = par.globalToLocal(glc.x, glc.y, 0);
            //            parLc.x = math.Number.clamp(parLc.x, 0, 512);
            //            parLc.y = math.Number.clamp(parLc.y, 0, 512);
            //            var parGl = par.localToGlobal(parLc.x, parLc.y);
            //            var min = this._to.globalToLocal(parGl.x, parGl.y, 0);

            //            min.x -= m.m41;
            //            min.y -= m.m42;
            //            min.x -= element.offsetLeft;
            //            min.y -= element.offsetTop;
            //            var max = par.localToLocal(this._to, 256, 256, 0);
            //            max.x -= m.m41;
            //            max.y -= m.m42;
            
            //            pt.x = math.Number.clamp(pt.x, min.x, 512);
            //            pt.y = math.Number.clamp(pt.y, min.y, 512);

            return pt;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.from = null;
        }

        private static createWithPerspective(visual: HTMLElement, ret = new geom.Matrix3D()): geom.Matrix3D {
            if (visual.ownerDocument) {
                if (visual.parentElement) {
                    var parentStyle = window.getComputedStyle(visual.parentElement);
                    var perspective = math.Number.parse(parentStyle.perspective, 0);
                    if (!perspective)
                        return ret;

                    var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
                    var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], visual.parentElement.offsetWidth, 0);
                    var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], visual.parentElement.offsetHeight, 0);

                    ret.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
                    ret.appendPerspective(perspective);
                    ret.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);
                }
                ret.appendCSS(window.getComputedStyle(visual).transform);
                return ret;
            }
            ret.identity();
            return ret;
        }


        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}