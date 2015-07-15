module jsidea.geom {
    export interface IPlane3DValue extends IPoint3DValue {
    }
    export class Plane3D {

        constructor(
            public x: number = 0,
            public y: number = 0,
            public z: number = 0,
            public w: number = 0) {
        }

        public clone(): Plane3D {
            return new Plane3D(
                this.x,
                this.y,
                this.z,
                this.w);
        }

        public copyFrom(value: IPlane3DValue): void {
            this.x = value.x;
            this.y = value.y;
            this.z = value.z;
            this.w = value.w;
        }

        public fromPoints(p0: Point3D, p1: Point3D, p2: Point3D): void {
            var d1x: number = p1.x - p0.x;
            var d1y: number = p1.y - p0.y;
            var d1z: number = p1.z - p0.z;

            var d2x: number = p2.x - p0.x;
            var d2y: number = p2.y - p0.y;
            var d2z: number = p2.z - p0.z;

            this.x = d1y * d2z - d1z * d2y;
            this.y = d1z * d2x - d1x * d2z;
            this.z = d1x * d2y - d1y * d2x;
            this.w = this.x * p0.x + this.y * p0.y + this.z * p0.z;
        }

        public fromNormalAndPoint(normal: Point3D, point: Point3D): void {
            this.x = normal.x;
            this.y = normal.y;
            this.z = normal.z;
            this.w = this.x * point.x + this.y * point.y + this.z * point.z;
        }

        public normalize(): Plane3D {
            var len: number = 1 / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            this.x *= len;
            this.y *= len;
            this.z *= len;
            this.w *= len;
            return this;
        }

        public intersectLine(a: Point3D, b: Point3D): Point3D {
            var normal: Point3D = new Point3D(this.x, this.y, this.z);
            var d: number = this.w;
            var ba: Point3D = b.clone().subPoint(a);
            var nDotA: number = normal.dotPoint(a);
            var nDotBA: number = normal.dotPoint(ba);
            ba.scaleBy((d - nDotA) / nDotBA);
            return a.clone().subPoint(ba);
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Plane3D";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() +
                + " x=" + this.x
                + " y=" + this.y
                + " z=" + this.z
                + " w=" + this.w
                + "]";
        }
    }
}