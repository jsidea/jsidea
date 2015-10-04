namespace jsidea.geom {
    export class Quad implements IQuadValue {
        public points: geom.Point3D[] = [];
        constructor(
            public p1: geom.Point3D = new geom.Point3D(),
            public p2: geom.Point3D = new geom.Point3D(),
            public p3: geom.Point3D = new geom.Point3D(),
            public p4: geom.Point3D = new geom.Point3D()
        ) {
            this.points = [this.p1, this.p2, this.p3, this.p4];
        }

        public clone(): Quad {
            return new Quad(
                this.p1.clone(),
                this.p2.clone(),
                this.p3.clone(),
                this.p4.clone());
        }

        public setRect(x: number, y: number, width: number, height: number): Quad {
            this.p1.x = x;
            this.p1.y = y;
            this.p2.x = x + width;
            this.p2.y = y;
            this.p3.x = x;
            this.p3.y = y + height;
            this.p4.x = x + width;
            this.p4.y = y + height;
            return this;
        }

        public setData(
            data: IPoint3DValue[]): Quad {
            this.p1.copyFrom(data[0]);
            this.p2.copyFrom(data[1]);
            this.p3.copyFrom(data[2]);
            this.p4.copyFrom(data[3]);
            return this;
        }

        public setTo(
            p1: geom.IPoint3DValue,
            p2: geom.IPoint3DValue,
            p3: geom.IPoint3DValue,
            p4: geom.IPoint3DValue): Quad {
            this.p1.copyFrom(p1);
            this.p2.copyFrom(p2);
            this.p3.copyFrom(p3);
            this.p4.copyFrom(p4);
            return this;
        }

        public copyFrom(value: IQuadValue): Quad {
            return this.setTo(value.p1, value.p2, value.p3, value.p4);
        }

        public dispose(): void {
        }
    }
}