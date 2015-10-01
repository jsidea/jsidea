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

        public copyFrom(value: IQuadValue): Quad {
            return this.setTo(value.p1, value.p2, value.p3, value.p4);
        }

        public dispose(): void {
        }
    }
}