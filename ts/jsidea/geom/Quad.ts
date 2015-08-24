module jsidea.geom {
    export interface IQuadValue {

    }
    export class Quad implements IQuadValue {

        constructor(
            public a: geom.Point3D = new geom.Point3D(),
            public b: geom.Point3D = new geom.Point3D(),
            public c: geom.Point3D = new geom.Point3D(),
            public d: geom.Point3D = new geom.Point3D()
            ) {
        }

        public clone(): Quad {
            return new Quad(
                this.a.clone(),
                this.b.clone(),
                this.c.clone(),
                this.d.clone());
        }

        public setTo(
            a: geom.Point3D,
            b: geom.Point3D,
            c: geom.Point3D,
            d: geom.Point3D): Quad {
            this.a.copyFrom(a);
            this.b.copyFrom(b);
            this.c.copyFrom(c);
            this.d.copyFrom(d);

            return this;
        }

        public center(ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            return this.outerBox().center(ret);
        }

        public clamp(x: number, y: number): geom.Point2D {
            var c = this.center();
            var pt = new geom.Point2D(x, y);

            var int = null;
            int = this.intersection(c, pt, this.a, this.b);
            if (int)
                return int;
            
            int = this.intersection(c, pt, this.b, this.c);
            if (int)
                return int;
            
            int = this.intersection(c, pt, this.c, this.d);
            if (int)
                return int;
            
            int = this.intersection(c, pt, this.d, this.a);
            if (int)
                return int;

            return new geom.Point2D(x, y);
        }

        private intersection(c: geom.IPoint2DValue, pt: geom.IPoint2DValue, a: geom.IPoint2DValue, b: geom.IPoint2DValue): void {
            var int = null;
            var max = Math.max(geom.Point2D.distance(c, a), geom.Point2D.distance(c, b));
            if (geom.Point2D.distance(pt, c) > max)
                int = null;
            else
                int = geom.Point2D.intersection(c, pt, a, b);
        }

        public outerBox(ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            ret.x = Math.min(this.a.x, this.b.x, this.c.x, this.d.x);
            ret.y = Math.min(this.a.y, this.b.y, this.c.y, this.d.y);
            ret.width = Math.max(this.a.x, this.b.x, this.c.x, this.d.x) - ret.x;
            ret.height = Math.max(this.a.y, this.b.y, this.c.y, this.d.y) - ret.y;
            return ret;
        }

        public innerBox(ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            var x = [this.a.x, this.b.x, this.c.x, this.d.x];
            var y = [this.a.y, this.b.y, this.c.y, this.d.y];
            x.sort(this.sortNumber);
            y.sort(this.sortNumber);
            ret.x = x[1];
            ret.y = y[1];
            ret.width = x[2] - ret.x;
            ret.height = y[2] - ret.y;
            return ret;
        }
        
        private sortNumber(a:number, b:number):number{
            return a - b;    
        }

        public copyFrom(value: Quad): Quad {
            return this.setTo(value.a, value.b, value.c, value.d);
        }

        public dispose(): void {
        }

        public static qualifiedClassName: string = "jsidea.geom.Quad";
        public toString(): string {
            return "[" + Box2D.qualifiedClassName
                + " a=" + this.a.toString()
                + " b=" + this.b.toString()
                + " c=" + this.c.toString()
                + " d=" + this.d.toString()
                + "]";
        }
    }
}