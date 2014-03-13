module jsidea.geom {
    export interface IMatrixValue {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }
    export interface IMatrix extends IMatrixValue, jsidea.core.ICore {
        cssMatrix: string;
        clone(): IMatrix;
        copyFrom(matrix: IMatrixValue): void;
        identity(): void;
        translate(x: number, y: number): void;
        deltaTransform(x: number, y: number): IPoint;
        transform(x: number, y: number): IPoint;
        rotate(angle: number): void;
        rotateDegree(angle: number): void;
        scale(scaleX: number, scaleY: number): void;
        skew(skewX: number, skewY: number): void;
        originBox(x: number, y: number, originX: number, originY: number, scaleX: number, scaleY: number, rotation: number): void;
        invert(): void;
        concat(value: IMatrixValue): void;
        decompose(): ITransformValue;
        decompose(target: ITransformValue): ITransformValue;
        isIdentity(): boolean;
    }
    export class Matrix implements IMatrix {

        public static RAD_TO_DEG: number = 180 / Math.PI;
        public static DEG_TO_RAD: number = Math.PI / 180;

        constructor(
            public a: number = 1,
            public b: number = 0,
            public c: number = 0,
            public d: number = 1,
            public tx: number = 0,
            public ty: number = 0) {
        }

        public clone(): IMatrix {
            return new Matrix(
                this.a,
                this.b,
                this.c,
                this.d,
                this.tx,
                this.ty);
        }

        public copyFrom(value: IMatrixValue): void {
            this.a = value.a;
            this.b = value.b;
            this.c = value.c;
            this.d = value.d;
            this.tx = value.tx;
            this.ty = value.ty;
        }

        public concat(value: IMatrixValue): void {
            this.append(value.a, value.b, value.c, value.d, value.tx, value.ty);
        }

        public append(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
            var a_tmp: number = this.a;
            var b_tmp: number = this.b;
            var c_tmp: number = this.c;
            var d_tmp: number = this.d;

            this.a = a * a_tmp + b * c_tmp;
            this.b = a * b_tmp + b * d_tmp;
            this.c = c * a_tmp + d * c_tmp;
            this.d = c * b_tmp + d * d_tmp;
            this.tx = tx * a_tmp + ty * c_tmp + this.tx;
            this.ty = tx * b_tmp + ty * d_tmp + this.ty;
        }

        public identity(): void {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;
        }

        public isIdentity(): boolean {
            return this.a == 1 &&
                this.b == 0 &&
                this.c == 0 &&
                this.d == 1 &&
                this.tx == 0 &&
                this.ty == 0;
        }

        public deltaTransform(x: number, y: number): IPoint {
            return new Point(
                this.a * x + this.c * y,
                this.b * x + this.d * y);
        }

        public transform(x: number, y: number): IPoint {
            return new Point(
                this.a * x + this.c * y + this.tx,
                this.b * x + this.d * y + this.ty);
        }

        public rotateDegree(angle: number): void {
            this.rotate(angle * Matrix.DEG_TO_RAD);
        }

        public rotate(angle: number): void {
            var a: number = this.a;
            var c: number = this.c;
            var x: number = this.tx;

            var THETA: number = Math.cos(angle);
            var BETA: number = Math.sin(angle);
            this.a = a * THETA - this.b * BETA;
            this.b = a * BETA + this.b * THETA;
            this.c = c * THETA - this.d * BETA;
            this.d = c * BETA + this.d * THETA;
            this.tx = x * THETA - this.ty * BETA;
            this.ty = x * BETA + this.ty * THETA;
        }

        public scale(scaleX: number, scaleY: number): void {
            this.a *= scaleX;
            this.b *= scaleY;
            this.c *= scaleX;
            this.d *= scaleY;
            this.tx *= scaleX;
            this.ty *= scaleY;
        }

        public skew(skewX: number, skewY: number): void {
            skewX = skewX * Matrix.DEG_TO_RAD;
            skewY = skewY * Matrix.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
        }

        public translate(dx: number, dy: number): void {
            this.tx += dx;
            this.ty += dy;
        }

        public invert(): void {
            var a: number = this.a;
            var b: number = this.b;
            var c: number = this.c;
            var d: number = this.d;
            var x: number = this.tx;
            var n: number = a * d - b * c;

            this.a = d / n;
            this.b = -b / n;
            this.c = -c / n;
            this.d = a / n;
            this.tx = (c * this.ty - d * x) / n;
            this.ty = -(a * this.ty - b * x) / n;
        }

        public decompose(target: ITransformValue = null): ITransformValue {
            target = target ? target : { x: 0, y: 0, scaleX: 0, scaleY: 0, skewX: 0, skewY: 0, rotation: 0 };
            target.x = this.tx;
            target.y = this.ty;
            target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
            target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);
            var skewX: number = Math.atan2(-this.c, this.d);
            var skewY: number = Math.atan2(this.b, this.a);
            if (skewX == skewY) {
                var rotation = skewY * Matrix.RAD_TO_DEG;
                if (this.a < 0 && this.d >= 0)
                    rotation += (target.rotation <= 0) ? 180 : -180;
                target.rotation = rotation;
                target.skewX = 0;
                target.skewY = 0;
            } else {
                target.skewX = skewX * Matrix.RAD_TO_DEG;
                target.skewY = skewY * Matrix.RAD_TO_DEG;
            }
            return target;
        }

        public get cssMatrix(): string {
            return "matrix("
                + this.a.toFixed(10) + ","
                + this.b.toFixed(10) + ","
                + this.c.toFixed(10) + ","
                + this.d.toFixed(10) + ","
                + this.tx.toFixed(10) + ","
                + this.ty.toFixed(10) + ")";
        }

        public set cssMatrix(value: string) {
            var trans = value.replace("matrix(", "").replace(")", "").split(",");
            this.a = parseNumber(trans[0], 1);
            this.b = parseNumber(trans[1], 0);
            this.c = parseNumber(trans[2], 0);
            this.d = parseNumber(trans[3], 1);
            this.tx = parseNumber(trans[4], 0);
            this.ty = parseNumber(trans[5], 0);
        }

        public originBox(
            x: number = 0,
            y: number = 0,
            originX: number = 0,
            originY: number = 0,
            scaleX: number = 1,
            scaleY: number = 1,
            rotation: number = 0): void {

            //pivotX/pivotY is 'lost in transformation'

            rotation *= 0.017453292519943295;
            originX *= scaleX;
            originY *= scaleY;
            var theta: number = Math.cos(rotation);
            var gamma: number = Math.sin(rotation);

            this.a = theta * scaleX;
            this.b = gamma * scaleX;
            this.c = -gamma * scaleY;
            this.d = theta * scaleY;
            this.tx = theta * -originX + gamma * originY + x;
            this.ty = gamma * -originX + theta * -originY + y;
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Matrix";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() +
                + " a=" + this.a
                + " b=" + this.b
                + " c=" + this.c
                + " d=" + this.d
                + " x=" + this.tx
                + " y=" + this.ty + "]";
        }
    }
}