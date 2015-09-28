namespace jsidea.geom {
    export class Quad implements IQuadValue {
        constructor(
            public p1: geom.Point3D = new geom.Point3D(),
            public p2: geom.Point3D = new geom.Point3D(),
            public p3: geom.Point3D = new geom.Point3D(),
            public p4: geom.Point3D = new geom.Point3D()
        ) {
        }

        public clone(): Quad {
            return new Quad(
                this.p1.clone(),
                this.p2.clone(),
                this.p3.clone(),
                this.p4.clone());
        }

        public setTo(
            p1: geom.Point3D,
            p2: geom.Point3D,
            p3: geom.Point3D,
            p4: geom.Point3D): Quad {
            this.p1.copyFrom(p1);
            this.p2.copyFrom(p2);
            this.p3.copyFrom(p3);
            this.p4.copyFrom(p4);

            return this;
        }

        public center(ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            return this.outerBox().center(ret);
        }

        public clamp(x: number, y: number): geom.Point2D {
            var c = this.center();
            var pt = new geom.Point2D(x, y);

            var int: geom.Point2D = null;
            int = this.intersection(c, pt, this.p1, this.p2);
            if (int)
                return int;

            int = this.intersection(c, pt, this.p2, this.p3);
            if (int)
                return int;

            int = this.intersection(c, pt, this.p3, this.p4);
            if (int)
                return int;

            int = this.intersection(c, pt, this.p4, this.p1);
            if (int)
                return int;

            return new geom.Point2D(x, y);
        }

        private intersection(c: geom.IPoint2DValue, pt: geom.IPoint2DValue, a: geom.IPoint2DValue, b: geom.IPoint2DValue): geom.Point2D {
            var max = Math.max(geom.Point2D.distance(c, a), geom.Point2D.distance(c, b));
            if (geom.Point2D.distance(pt, c) > max)
                return null;
            else
                return geom.Point2D.intersection(c, pt, a, b);
        }

        public outerBox(ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            ret.x = Math.min(this.p1.x, this.p2.x, this.p3.x, this.p4.x);
            ret.y = Math.min(this.p1.y, this.p2.y, this.p3.y, this.p4.y);
            ret.width = Math.max(this.p1.x, this.p2.x, this.p3.x, this.p4.x) - ret.x;
            ret.height = Math.max(this.p1.y, this.p2.y, this.p3.y, this.p4.y) - ret.y;
            return ret;
        }

        public innerBox(ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            var x = [this.p1.x, this.p2.x, this.p3.x, this.p4.x];
            var y = [this.p1.y, this.p2.y, this.p3.y, this.p4.y];
            x.sort(this.sortNumber);
            y.sort(this.sortNumber);
            ret.x = x[1];
            ret.y = y[1];
            ret.width = x[2] - ret.x;
            ret.height = y[2] - ret.y;
            return ret;
        }

        private sortNumber(a: number, b: number): number {
            return a - b;
        }

        public copyFrom(value: IQuadValue): Quad {
            return this.setTo(value.p1, value.p2, value.p3, value.p4);
        }

        public dispose(): void {
        }

        public toString(): string {
            return "[ jsidea.geom.Quad" 
                + " a=" + this.p1.toString()
                + " b=" + this.p2.toString()
                + " c=" + this.p3.toString()
                + " d=" + this.p4.toString()
                + "]";
        }
    }
}