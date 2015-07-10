module jsidea.geom {
    export interface ITransformElement {
        element: HTMLElement;
        matrix: geom.Matrix3D;
        preserve3D: boolean;
        perspective: number;
        is2D: boolean;
    }
    export class Transform {

        public static getGlobalToLocal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
            return null;
        }

        public static getLocalToGlobal(visual: HTMLElement, lpt: geom.IPoint2DValue, ret: Point2D = new Point2D()): jsidea.geom.Point3D {
            //collect
            var chain: ITransformElement[] = [];
            while (visual && visual != document.body) {
                var ma = this.extractTransform(visual);
//                console.log(visual, ma.matrix.isIdentity());
//                if (!ma.matrix.isIdentity())
                    chain.push(ma);
                visual = visual.parentElement;
            }

            //accumulate
            var l = chain.length;
//            for (var i = 0; i < l; ++i) {
//                if (i < (l - 1)
//                    && (chain[i].is2D || chain[i].preserve3D)) {
//                    chain[i + 1].matrix.prepend(chain[i].matrix);
//                    l--;
//                    chain.splice(i, 1);
//                }
//            }

            //transform
            var pt = new geom.Point3D(lpt.x, lpt.y, 0);
            for (var i = 0; i < l; ++i) {
//                console.log(chain[i].element);
                if (chain[i].preserve3D)
                    pt = chain[i].matrix.transform3D(pt);
                else
                    pt = chain[i].matrix.transform2D(pt);
            }
            return pt;
        }

        private static extractPerspectiveMatrix(a: HTMLElement): geom.Matrix3D {
            var result = new geom.Matrix3D();
            if (!a)
                return result;
            var pers = math.Number.parse(window.getComputedStyle(a.parentElement).perspective, 0);
            if (!pers)
                return result;
            var perspectiveOrigin = this.extractPerspectiveOrigin(a.parentElement);
            
            //perspective
            result.appendPositionRaw(-perspectiveOrigin.x, -perspectiveOrigin.y, 0);
            result.appendPerspective(pers);
            result.appendPositionRaw(perspectiveOrigin.x, perspectiveOrigin.y, 0);

            return result;
        }

        private static extractTransformMatrix(a: HTMLElement): geom.Matrix3D {
            var result = new geom.Matrix3D();
            if (!a)
                return result;
            var style = window.getComputedStyle(a);
            var parentStyle = window.getComputedStyle(a.parentElement);
            var matrix = geom.Matrix3D.extract(a);
            var origin = this.extractOrigin(a);
            var offset = this.extractPosition(a);
            var perspective = math.Number.parse(parentStyle.perspective, 0);
            //BUG OR WHAT???? BODY PRESERVES ALWAYS???? but its not reflected to computed style
            var preserve3d = a.parentElement == document.body || (parentStyle.transformStyle == "preserve-3d");
            
            //if no perspective and disabled 3d (no preserve-3d)
            if (!preserve3d && !perspective) {
                matrix.setMatrix2D(matrix.getMatrix2D());
            }

            var isWebkit = true;
            
            //            //do not include (directly) the border for elements which box-sizing is set to border-box
            //            var border = this.extractBorder(a);
            //            if(style.boxSizing != "border-box")
            //                matrix.appendPositionRaw(border.x, border.y, 0);
            //            
            //tricky stuff (if parent has border-box add parents border here)
            if (!isWebkit) {

                //                var borderParent = this.extractBorder(a.parentElement);
                //                if (parentStyle.boxSizing != "border-box")
                //                    matrix.appendPositionRaw(-borderParent.x, -borderParent.y, 0);


                //                var border = this.extractBorder(a);
                //                if (style.boxSizing != "border-box")
                //                    matrix.appendPositionRaw(-border.x, -border.y, 0);
                //                
                var borderParent = this.extractBorder(a.parentElement);
                if (parentStyle.boxSizing != "border-box") {
                    offset.x += borderParent.x;
                    offset.y += borderParent.y;
                }

            }
            else {
                var borderParent = this.extractBorder(a.parentElement);
                offset.x += borderParent.x;
                offset.y += borderParent.y;
            }
            
            //do not include (directly) the border for elements which box-sizing is set to border-box
            //            var border = this.extractBorder(a);
            //            if(style.boxSizing != "border-box")
            //                matrix.appendPositionRaw(border.x, border.y, 0);
            
            //transform
            result.appendPositionRaw(-origin.x, -origin.y, -origin.z);
            result.append(matrix);
            result.appendPositionRaw(origin.x, origin.y, origin.z);
            
            //offset
            result.appendPositionRaw(offset.x, offset.y, 0);

            return result;
        }

        public static extractTransform(a: HTMLElement): geom.ITransformElement {
            //BUG OR WHAT???? BODY PRESERVES ALWAYS????
            var preserve3d = a.parentElement == document.body || (window.getComputedStyle(a.parentElement).transformStyle == "preserve-3d");
            var perspective = math.Number.parse(window.getComputedStyle(a.parentElement).perspective, 0);
            var transformMatrix = this.extractTransformMatrix(a);
            var perspectiveMatrix = this.extractPerspectiveMatrix(a);
            var is2D = transformMatrix.is2D();

            var matrix = new geom.Matrix3D();
            matrix.append(transformMatrix);
            matrix.append(perspectiveMatrix);
            return {
                element: a,
                matrix: matrix,
                preserve3D: preserve3d,
                is2D: is2D,
                perspective: perspective,
            };
        }

        public static extractPerspectiveOrigin(visual: HTMLElement, bounds: Box2D = this.extractBounds(visual), ret: Point2D = new Point2D()): Point2D {
            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
            var vals = style.perspectiveOrigin.split(" ");
            return ret.setTo(
                math.Number.parseRelation(vals[0], bounds.width, 0),
                math.Number.parseRelation(vals[1], bounds.height, 0));
        }

        public static extractPosition(visual: HTMLElement, ret: Point2D = new Point2D()): Point2D {
            return ret.setTo(
                visual.offsetLeft,
                visual.offsetTop);
        }

        public static extractBorder(visual: HTMLElement, ret: Point2D = new Point2D()): Point2D {
            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
            return ret.setTo(
                math.Number.parse(style.borderLeftWidth, 0),
                math.Number.parse(style.borderTopWidth, 0));
        }

        public static extractOrigin(visual: HTMLElement, bounds: Box2D = this.extractBounds(visual), ret: Point3D = new Point3D()): Point3D {
            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
            var vals = style.transformOrigin.split(" ");
            return ret.setTo(
                math.Number.parseRelation(vals[0], bounds.width, 0),
                math.Number.parseRelation(vals[1], bounds.height, 0),
                math.Number.parseRelation(vals[3], 0, 0));//2nd param "focalLength" ?
        }

        public static extractBounds(visual: HTMLElement, ret: Point3D = new Point3D()): Box2D {
            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
            //            return new Box2D(0, 0,
            //                visual.offsetWidth - (math.Number.parse(style.borderLeftWidth, 0) + math.Number.parse(style.borderRightWidth, 0)),
            //                visual.offsetHeight - (math.Number.parse(style.borderTopWidth, 0) + math.Number.parse(style.borderBottomWidth, 0)));
            return new Box2D(0, 0,
                visual.offsetWidth,
                visual.offsetHeight);
        }
    }
}