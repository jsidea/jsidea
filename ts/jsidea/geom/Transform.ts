module jsidea.geom {
    export interface ITransformElement {
        matrix: geom.Matrix3D;
        origin: geom.Point3D;
        perspectiveOrigin: geom.Point2D;
        perspective: number;
        preserve3D: boolean;
    }
    export class Transform {

        public static getGlobalToLocal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
            return null;
        }

        public static getLocalToGlobal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
            return null;
        }

        private static extract(a: HTMLElement): geom.Matrix3D {
            var fin = new geom.Matrix3D();

            var ma = geom.Matrix3D.extract(a);
            var or = geom.Point3D.extractOrigin(a);
            var po = geom.Point2D.extractPosition(a);
            var por = geom.Point2D.extractPerspectiveOrigin(a.parentElement);
            var pers = math.Number.parse(window.getComputedStyle(a.parentElement).perspective, 0);
            var preserve = window.getComputedStyle(a.parentElement).transformStyle == "preserve-3d";

            //if no perspective and disabled 3d (no preserve-3d)
            if (!preserve && !pers) {
                ma.setMatrix2D(ma.getMatrix2D());
            }

            //transform
            fin.appendPositionRaw(-or.x, -or.y, -or.z);
            fin.append(ma);
            fin.appendPositionRaw(or.x, or.y, or.z);
            
            //offset
            fin.appendPositionRaw(po.x, po.y, 0);
            
            //perspective
            fin.appendPositionRaw(-por.x, -por.y, 0);
            if (pers)
                fin.appendPerspective(pers);
            fin.appendPositionRaw(por.x, por.y, 0);

            return fin;
        }
    }
}