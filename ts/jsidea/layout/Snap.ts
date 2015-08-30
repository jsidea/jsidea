module jsidea.layout {
    export class Snap {
        public mode: ISnapMode = SnapMode.BASIC;

        private _to: geom.Transform = new geom.Transform();

        public calc(element: HTMLElement, ret: geom.Point3D = new geom.Point3D()): geom.Point3D {
            var to = this._to.update(element);
            var gl = to.localToGlobal(0, 0, 0);
            gl.x = math.Number.roundTo(gl.x, 50);
            gl.y = math.Number.roundTo(gl.y, 50);
            var lc = to.globalToLocalPoint(gl);
            to.matrix.prependPositionRaw(lc.x, lc.y, 0);
            ret.x = to.matrix.m41;
            ret.y = to.matrix.m42;
            ret.z = to.matrix.m43;

            return ret.setTo(to.matrix.m41, to.matrix.m42, to.matrix.m43);
        }
        
        public static snap(to: geom.Transform): geom.Point3D {
            var gl = to.localToGlobal(0, 0, 0);
            
            gl.x = math.Number.roundTo(gl.x, 50);
            gl.y = math.Number.roundTo(gl.y, 50);
            
            
            var lc = to.globalToLocalPoint(gl);
            to.matrix.prependPositionRaw(lc.x, lc.y, 0);

            var point: geom.Point3D = new geom.Point3D();
            point.x = to.matrix.m41;
            point.y = to.matrix.m42;
            point.z = to.matrix.m43;
            return point;
        }
    }
}