module jsidea.geom {
    export interface IMatrixValue extends IPointValue {
        a: number;
        b: number;
        c: number;
        d: number;
    }
    export interface IMatrix extends IMatrixValue, jsidea.core.IDisposable {
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
    }
    export class Matrix implements IMatrix {

        public static RAD_TO_DEG: number = 180 / Math.PI;
        public static DEG_TO_RAD: number = Math.PI / 180;

        constructor(
            public a: number = 1,
            public b: number = 0,
            public c: number = 0,
            public d: number = 1,
            public x: number = 0,
            public y: number = 0) {
        }

        public clone(): IMatrix {
            return new Matrix(
                this.a,
                this.b,
                this.c,
                this.d,
                this.x,
                this.y);
        }

        public copyFrom(value: IMatrixValue): void {
            this.a = value.a;
            this.b = value.b;
            this.c = value.c;
            this.d = value.d;
            this.x = value.x;
            this.y = value.y;
        }

        public concat(value: IMatrixValue): void {
            this.append(value.a, value.b, value.c, value.d, value.x, value.y);
        }

        public append(a: number, b: number, c: number, d: number, x: number, y: number): void {
            var a_tmp: number = this.a;
            var b_tmp: number = this.b;
            var c_tmp: number = this.c;
            var d_tmp: number = this.d;

            this.a = a * a_tmp + b * c_tmp;
            this.b = a * b_tmp + b * d_tmp;
            this.c = c * a_tmp + d * c_tmp;
            this.d = c * b_tmp + d * d_tmp;
            this.x = x * a_tmp + y * c_tmp + this.x;
            this.y = x * b_tmp + y * d_tmp + this.y;
        }

//        public prependTranslate(x: number, y: number): void {
//            var x1 = this.x;
//            this.x = x1 * this.a + this.y * this.c + x;
//            this.y = x1 * this.b + this.y * this.d + y;
//        }

        public identity(): void {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.x = 0;
            this.y = 0;
        }

        public deltaTransform(x: number, y: number): IPoint {
            return new Point(
                this.a * x + this.c * y,
                this.b * x + this.d * y);
        }

        public transform(x: number, y: number): IPoint {
            return new Point(
                this.a * x + this.c * y + this.x,
                this.b * x + this.d * y + this.y);
        }

        public rotateDegree(angle: number): void {
            this.rotate(angle * Matrix.DEG_TO_RAD);
        }

        public rotate(angle: number): void {
            var a: number = this.a;
            var c: number = this.c;
            var x: number = this.x;

            var THETA: number = Math.cos(angle);
            var BETA: number = Math.sin(angle);
            this.a = a * THETA - this.b * BETA;
            this.b = a * BETA + this.b * THETA;
            this.c = c * THETA - this.d * BETA;
            this.d = c * BETA + this.d * THETA;
            this.x = x * THETA - this.y * BETA;
            this.y = x * BETA + this.y * THETA;
        }

        public scale(scaleX: number, scaleY: number): void {
            this.a *= scaleX;
            this.b *= scaleY;
            this.c *= scaleX;
            this.d *= scaleY;
            this.x *= scaleX;
            this.y *= scaleY;
        }

        public skew(skewX: number, skewY: number): void {
            skewX = skewX * Matrix.DEG_TO_RAD;
            skewY = skewY * Matrix.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
        }

        public translate(x: number, y: number): void {
            this.x += x;
            this.y += y;
        }

        public invert(): void {
            var a: number = this.a;
            var b: number = this.b;
            var c: number = this.c;
            var d: number = this.d;
            var x: number = this.x;
            var n: number = a * d - b * c;

            this.a = d / n;
            this.b = -b / n;
            this.c = -c / n;
            this.d = a / n;
            this.x = (c * this.y - d * x) / n;
            this.y = -(a * this.y - b * x) / n;
        }

        public decompose(target: ITransformValue = null): ITransformValue {
            target = target ? target : { x: 0, y: 0, scaleX: 0, scaleY: 0, skewX: 0, skewY: 0, rotation: 0 };
            target.x = this.x;
            target.y = this.y;
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
                + this.x.toFixed(10) + ","
                + this.y.toFixed(10) + ")";
        }

        public set cssMatrix(value: string) {
            var trans = value.replace("matrix(", "").replace(")", "").split(",");
            this.a = parseNumber(trans[0], 1);
            this.b = parseNumber(trans[1], 0);
            this.c = parseNumber(trans[2], 0);
            this.d = parseNumber(trans[3], 1);
            this.x = parseNumber(trans[4], 0);
            this.y = parseNumber(trans[5], 0);
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
            this.x = theta * -originX + gamma * originY + x;
            this.y = gamma * -originX + theta * -originY + y;
        }

        public dispose(): void {
        }

        public toString(): string {
            return "[jsidea.geom.Matrix"
                + " a=" + this.a
                + " b=" + this.b
                + " c=" + this.c
                + " d=" + this.d
                + " x=" + this.x
                + " y=" + this.y + "]";
        }
    }
}