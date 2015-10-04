namespace jsidea.geom {
    /**
    *  
    * @author Jöran Benker
    * 
    */
    export class MatrixUtil {
        private static tempAxeX: Point3D = new Point3D();
        private static tempAxeY: Point3D = new Point3D();
        private static tempAxeZ: Point3D = new Point3D();

        public static lookAt(eye: Point3D, target: Point3D, up: Point3D): Matrix3D {
            var x: Point3D = MatrixUtil.tempAxeX;
            var y: Point3D = MatrixUtil.tempAxeY;
            var z: Point3D = MatrixUtil.tempAxeZ;

            z.difference(eye, target).normalize();
            if (z.length() === 0) {
                z.z = 1;
            }
            x.crossSet(up, z).normalize();
            if (x.length() === 0) {
                z.x += 0.0001;
                x.crossSet(up, z).normalize();
            }
            y.crossSet(z, x);

            var m = new Matrix3D();
            m.m11 = x.x;
            m.m12 = x.y;
            m.m13 = x.z;
            m.m21 = y.x;
            m.m22 = y.y;
            m.m23 = y.z;
            m.m31 = z.x;
            m.m32 = z.y;
            m.m33 = z.z;
            return m;
        }
    }
}