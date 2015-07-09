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
                var ma = this.extract(visual);
                if (!ma.matrix.isIdentity())
                    chain.push(ma);
                visual = visual.parentElement;
            }

            //accumulate
            var l = chain.length;
            for (var i = 0; i < l; ++i) {
                if (i < (l - 1)
                    && (chain[i].is2D || chain[i].preserve3D)) {
                    var mat = chain[i].matrix;
                    chain[i + 1].matrix.prepend(mat);
                    l--;
                    chain.splice(i, 1);
                }
            }
            console.log("MAT-COUNT", chain.length);

            //transform
            var pt = new geom.Point3D(lpt.x, lpt.y, 0);
            for (var i = 0; i < l; ++i) {
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
            var perspectiveOrigin = geom.Point2D.extractPerspectiveOrigin(a.parentElement);
            
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
            var matrix = geom.Matrix3D.extract(a);
            var origin = geom.Point3D.extractOrigin(a);
            var offset = geom.Point2D.extractPosition(a);
            var perspective = math.Number.parse(window.getComputedStyle(a.parentElement).perspective, 0);
            //BUG OR WHAT???? BODY PRESERVES ALWAYS????
            var preserve3d = a.parentElement == document.body || (window.getComputedStyle(a.parentElement).transformStyle == "preserve-3d");
            
            //if no perspective and disabled 3d (no preserve-3d)
            if (!preserve3d && !perspective) {
                matrix.setMatrix2D(matrix.getMatrix2D());
            }
            
            //transform
            result.appendPositionRaw(-origin.x, -origin.y, -origin.z);
            result.append(matrix);
            result.appendPositionRaw(origin.x, origin.y, origin.z);
            
            //offset
            result.appendPositionRaw(offset.x, offset.y, 0);

            return result;
        }

        public static extract(a: HTMLElement): geom.ITransformElement {
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
    }
}