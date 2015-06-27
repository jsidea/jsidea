module jsidea.geom {
    export class Transform {
        
        private static _GET_SCENE_TRANSFORM_3D: Matrix3D = new Matrix3D();
        
        private static TEMP: Matrix2D = new Matrix2D();
        private static TEMP1: Matrix2D = new Matrix2D();
        private static TEMP2: Matrix2D = new Matrix2D();

        
        private static TMP3: Point2D = new Point2D();
        private static TMP4: Point2D = new Point2D();
        private static TMP5: Point3D = new Point3D();
        private static TMP6: Point3D = new Point3D();

        public static getGlobalToLocal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
//            console.log(Transform.getSceneTransform2D(visual, Matrix2D.TEMP2).invert().getCSS());
            console.log(Transform.getSceneTransform2D(visual, Transform.TEMP2).toString() + Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).toString());
            
//                        console.log(Transform.getSceneTransform2D(visual, Matrix2D.TEMP2).toString());
//                        console.log(Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).toString());
            
//            console.log(Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).getCSS());
//            console.log(Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).invert().getCSS());
            //            return Transform.getSceneTransform2D(visual, Matrix2D.TEMP2).invert().transformRaw(x, y);
//            return Transform.getSceneTransform2D(visual, Matrix2D.TEMP2).invert().transformRaw(x, y);
//            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).invert().transformRaw(x, y, 0);
//            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).invert().transformRaw(x, y, 0);
//            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).clearZ().invert().transformRaw(x, y, 0);
//            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).clearZ().invert().transformRaw(x, y, 0);
//            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).clearZ().invert().transformRaw(x, y, 0);
            
            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).clearZ().invert().transformRaw(x, y, 0);
        }

        public static getLocalToGlobal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
            //            console.log(Transform.getSceneTransform2D(visual, Matrix2D.TEMP2).transformRaw(x, y));
            //            console.log(Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).transformRaw(x, y, 0));
            
            return Transform.getSceneTransform2D(visual, Transform.TEMP2).transformRaw(x, y);
            //            return Transform.getSceneTransform3D(visual, Matrix3D.TEMP2).transformRaw(x, y, 0);
        }

        private static getSceneTransform3D(visual: HTMLElement, ret = new Matrix3D()): Matrix3D {
            if (<any> visual == window)
                return ret.identity();

            var cs = window.getComputedStyle(visual);
            var c = 1;
            var mat: Matrix3D = Transform.extractMatrix3D(cs, visual, ret);
            var p: HTMLElement = visual.parentElement;
            while (p) {
                cs = window.getComputedStyle(p);
                mat.prepend(Transform.extractMatrix3D(cs, p, Transform._GET_SCENE_TRANSFORM_3D));
                c++;
                if (p == document.body)
                    break;
                p = p.parentElement;
            }
            //console.log("COUNT", c);
            return mat;
        }

        private static getSceneTransform2D(visual: HTMLElement, ret = new Matrix2D()): Matrix2D {
            if (<any> visual == window)
                return ret.identity();

            var cs = window.getComputedStyle(visual);
            var mat: Matrix2D = Transform.extractMatrix2D(cs, visual, ret);
            var p: HTMLElement = visual.parentElement;
            while (p) {
                cs = window.getComputedStyle(p);
                mat.prepend(Transform.extractMatrix2D(cs, p, Transform.TEMP));
                if (p == document.body)
                    break;
                p = p.parentElement;
            }
            return mat;
        }

        private static extractMatrix2D(style: CSSStyleDeclaration, visual: HTMLElement, ret = new Matrix2D()): Matrix2D {
            var matrix = Matrix2D.parse(style.transform, ret);
//            return matrix;
            var origin = visual.ownerDocument ? this.extractOrigin2D(visual, style, Transform.TMP3) : new Point2D();

            var k = matrix.deltaTransform(origin.x, origin.y, Transform.TMP4);
            matrix.appendPositionRaw(origin.x - k.x, origin.y - k.y);
            if (<any>visual != window)
                matrix.appendPositionRaw(visual.offsetLeft - visual.scrollLeft, visual.offsetTop - visual.scrollTop);

            var isFixed: boolean = visual.ownerDocument ? visual.style.position == "fixed" : false;
            var pm = visual.parentElement;
            if (isFixed && pm && visual.children.length == 0)
                matrix.appendPositionRaw(-pm.offsetLeft, -pm.offsetTop);
            return matrix;
        }

        private static extractMatrix3D(style: CSSStyleDeclaration, visual: HTMLElement, ret = new Matrix3D()): Matrix3D {
            //var matrix = Matrix3D.parse(style.transform, ret);

            var offsetLeft = visual.offsetLeft;
            var offsetTop = visual.offsetTop;
            var position = style.position;
            if (position === 'absolute' || position === 'fixed') {
            } else if (position === 'static' || position === 'relative') {
                var closestPositionedParent = visual.offsetParent;

                if (closestPositionedParent === visual.parentNode) {
                    // nothing
                } else {
                    var parent = visual.parentElement;
                    if (parent && parent.nodeType === 1) {
                        offsetLeft -= parent.offsetLeft;
                        offsetTop -= parent.offsetTop;
                    }
                }
            }
            var x = offsetLeft + visual.clientLeft;
            var y = offsetTop + visual.clientTop;
            if (visual !== document.body) {
                x -= visual.scrollLeft;
                y -= visual.scrollTop;
            }
            var p01 = new Matrix3D();
            p01.appendPositionRaw(x, y, 0);

            var p12 = new Matrix3D();
            var orp = this.extractOrigin3D(visual, style);
            p12.appendPosition(orp);

            var p23 = new Matrix3D();
            p23.setCSS(style.transform);
            p23.normalize();

            var p21 = p12.clone().invert();

            var p03 = new Matrix3D();
            p03.append(p01);
            p03.append(p12);
            p03.append(p23);
            p03.append(p21);

            return p03;
        }
        
        //        private static extractMatrix3D(style: CSSStyleDeclaration, visual: HTMLElement, ret = new Matrix3D()): Matrix3D {
        //            var matrix = Matrix3D.parse(style.transform, ret);
        //            
        ////            console.log(style.perspectiveOrigin);
        ////            console.log(style.perspective);
        ////            console.log(matrix.toString());
        //            return matrix;
        //            
        //            var origin = visual.ownerDocument ? this.extractOrigin3D(visual, style, Transform.TMP5) : new Point3D();
        ////            console.log(origin.z);
        //            var k = matrix.deltaTransform(origin, Transform.TMP6);
        ////            matrix.prependPositionRaw(origin.x - k.x, origin.y - k.y, origin.z - k.z);
        //            
        //            matrix.prependPositionRaw(-origin.x, -origin.y, -origin.z);
        //            matrix.appendPositionRaw(origin.x, origin.y, origin.z);
        ////            matrix.m41 += origin.x - k.x;
        ////            matrix.m42 += origin.y - k.y;
        ////            matrix.m43 += origin.z - k.z;
        //            
        ////            origin.scaleBy(-1);
        ////            matrix.prependPosition(origin);
        //            
        //            if (<any>visual != window)
        //            {
        ////                matrix.prependPositionRaw(visual.offsetLeft - visual.scrollLeft, visual.offsetTop - visual.scrollTop, 0);
        //                matrix.m41 += visual.offsetLeft - visual.scrollLeft;
        //                matrix.m42 += visual.offsetTop - visual.scrollTop;
        //                }
        //            
        ////            var isFixed: boolean = visual.ownerDocument ? visual.style.position == "fixed" : false;
        ////            var pm = visual.parentElement;
        ////            if (isFixed && pm && visual.children.length == 0)
        ////                matrix.appendPositionRaw(-pm.offsetLeft, -pm.offsetTop, 0);
        //            
        //            return matrix;
        //        }

        private static extractOrigin2D(visual: HTMLElement, style: CSSStyleDeclaration, ret: Point2D = new Point2D()): Point2D {
            var vals = style.transformOrigin.split(" ");
            return ret.setTo(
                math.Number.parseRelation(vals[0], visual.offsetWidth, 0),
                math.Number.parseRelation(vals[1], visual.offsetHeight, 0));
        }

        private static extractOrigin3D(visual: HTMLElement, style: CSSStyleDeclaration, ret: Point3D = new Point3D()): Point3D {
            var vals = style.transformOrigin.split(" ");
            return ret.setTo(
                math.Number.parseRelation(vals[0], visual.offsetWidth, 0),
                math.Number.parseRelation(vals[1], visual.offsetHeight, 0),
                math.Number.parseRelation(vals[2], 0, 0));
        }
    }
}