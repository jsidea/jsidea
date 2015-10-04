namespace jsidea.geom {
    /**
    * Matrix2D math.
    *  
    * @author Jöran Benker
    * 
    */
    export class Matrix2D implements IMatrix2DValue {

        public m11: number = 1;
        public m12: number = 0;
        public m13: number = 0;

        public m21: number = 0;
        public m22: number = 1;
        public m23: number = 0;

        public m31: number = 0;
        public m32: number = 0;
        public m33: number = 1;

        constructor() {
        }

        public static create(element: HTMLElement = null, style: CSSStyleDeclaration = null, ret = new Matrix2D()): Matrix2D {
            if (element && element.ownerDocument)
                return ret.setCSS((style || window.getComputedStyle(element)).transform);
            return ret.identity();
        }

        public getData(length: number = 6): number[] {
            if (length == 9)
                return [this.m11, this.m12, this.m13, this.m21, this.m22, this.m23, this.m31, this.m32, this.m33];
            return [this.m11, this.m12, this.m21, this.m22, this.m31, this.m32];
        }

        public setData(data: number[]): Matrix2D {
            if (data === undefined)
                return this.identity();

            var l = data.length;
            if (l == 6) {
                this.m11 = data[0];
                this.m12 = data[1];
                this.m13 = 0;
                this.m21 = data[2];
                this.m22 = data[3];
                this.m23 = 0;
                this.m31 = data[4];
                this.m32 = data[5];
                this.m33 = 1;
            }
            else if (l == 9) {
                this.m11 = data[0];
                this.m12 = data[1];
                this.m13 = data[2];
                this.m21 = data[3];
                this.m22 = data[4];
                this.m23 = data[5];
                this.m31 = data[6];
                this.m32 = data[7];
                this.m33 = data[8];
            }
            else if (l == 16) {
                this.m11 = data[0];
                this.m12 = data[1];
                this.m13 = data[3];
                this.m21 = data[4];
                this.m22 = data[5];
                this.m23 = data[7];
                this.m31 = data[12];
                this.m32 = data[13];
                this.m33 = data[15];
            }
            return this;
        }

        public copyFrom(matrix: IMatrix2DValue): Matrix2D {
            this.m11 = matrix.m11;
            this.m12 = matrix.m12;
            this.m13 = matrix.m13;
            this.m21 = matrix.m21;
            this.m22 = matrix.m22;
            this.m23 = matrix.m23;
            this.m31 = matrix.m31;
            this.m32 = matrix.m32;
            this.m33 = matrix.m33;
            return this;
        }

        public copyTo(matrix: IMatrix2DValue): Matrix2D {
            matrix.m11 = this.m11;
            matrix.m12 = this.m12;
            matrix.m12 = this.m13;
            matrix.m21 = this.m21;
            matrix.m22 = this.m22;
            matrix.m23 = this.m23;
            matrix.m31 = this.m31;
            matrix.m32 = this.m32;
            matrix.m33 = this.m33;
            return this;
        }

        public clone(): Matrix2D {
            var m = new Matrix2D();
            m.copyFrom(this);
            return m;
        }

        public identity(): Matrix2D {
            this.m11 = 1;
            this.m12 = 0;
            this.m13 = 0;
            this.m21 = 0;
            this.m22 = 1;
            this.m23 = 0;
            this.m31 = 0;
            this.m32 = 0;
            this.m33 = 1;
            return this;
        }

        public isIdentity(): boolean {
            return this.m11 == 1 &&
                this.m12 == 0 &&
                this.m13 == 0 &&
                this.m21 == 0 &&
                this.m22 == 1 &&
                this.m23 == 0 &&
                this.m31 == 0 &&
                this.m32 == 0 &&
                this.m33 == 1;
        }

        public scalar(scalar: number): Matrix2D {
            this.m11 *= scalar;
            this.m12 *= scalar;
            this.m13 *= scalar;

            this.m21 *= scalar;
            this.m22 *= scalar;
            this.m23 *= scalar;

            this.m31 *= scalar;
            this.m32 *= scalar;
            this.m33 *= scalar;
            return this;
        }

        public normalize(): Matrix2D {
            var m33 = this.m33 || 0.0001;
            return this.scalar(1 / m33);
        }

        public deltaTransform(point: IPoint2DValue, ret: Point2D = new Point2D()): Point2D {
            return ret.setTo(
                this.m11 * point.x + this.m21 * point.y,
                this.m12 * point.x + this.m22 * point.y,
                this.m13 * point.x + this.m23 * point.y);
        }

        public transform(point: IPoint2DValue, ret: Point2D = new Point2D()): Point2D {
            var w = math.Number.parse(point.w, 1);
            return ret.setTo(
                this.m11 * point.x + this.m21 * point.y + this.m31 * w,
                this.m12 * point.x + this.m22 * point.y + this.m32 * w,
                this.m13 * point.x + this.m23 * point.y + this.m33 * w);
        }

        public append(matrix: IMatrix2DValue): Matrix2D {
            return Matrix2D.multiply(this, matrix, this);
        }

        public prepend(matrix: IMatrix2DValue): Matrix2D {
            return Matrix2D.multiply(matrix, this, this);
        }

        /**
        * Get the decomposed position.
        * @param ret Optional buffer.
        * @return The position.
        */
        public getPosition(ret: Point2D = new Point2D()): Point2D {
            ret.x = this.m31;
            ret.y = this.m32;
            return ret;
        }

        /**
        * Sets the given position.
        * @param position The new position.
        * @return this-chained.
        */
        public setPosition(position: IPoint2DValue): Matrix2D {
            this.m31 = position.x;
            this.m32 = position.y;
            return this;
        }
        
        /**
        * Creates a new position/translation-matrix.
        * @param position The config object.
        * @return The new translation-matrix.
        */
        public makePosition(offset: IPoint2DValue, ret: Matrix2D = new Matrix2D()): Matrix2D {
            ret.identity();
            ret.m31 = offset.x;
            ret.m32 = offset.y;
            return ret;
        }
        
        /**
        * Appends position/offset.
        * @param position The offset.
        * @return this-chained.
        */
        public appendPosition(offset: IPoint2DValue): Matrix2D {
            return this.append(this.makePosition(offset, _MATRIX2D));;
        }

        /**
        * Prepends position/offset.
        * @param position The offset.
        * @return this-chained.
        */
        public prependPosition(offset: IPoint2DValue): Matrix2D {
            return this.prepend(this.makePosition(offset, _MATRIX2D));
        }
        
        /**
        * Prepends position/offset.
        * @param x The x-offset.
        * @param y The y-offset.
        * @param w The w-offset.
        * @return this-chained.
        */
        public prependPositionRaw(x: number, y: number): Matrix2D {
            return this.prependPosition(_POINT.setTo(x, y));
        }

        /**
        * Get the decomposed scaling-factors.
        * @param ret Optional buffer.
        * @return The scaling-point.
        */
        public getScale(ret: Point2D = new Point2D()): Point2D {
            ret.x = Math.sqrt(this.m11 * this.m11 + this.m12 * this.m12);
            ret.y = Math.sqrt(this.m21 * this.m21 + this.m22 * this.m22);
            return ret;
        }
        
        /**
        * Sets the given scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public setScale(pt: IPoint2DValue): Matrix2D {
            this.m11 = pt.x;
            this.m22 = pt.y;
            return this;
        }

        /**
        * Creates a new scaling-matrix.
        * @param scale The scaling-factor.
        * @return The new scaling-matrix.
        */
        public makeScale(scale: IPoint2DValue, ret: Matrix2D = new Matrix2D()): Matrix2D {
            ret.identity();
            ret.setScale(scale);
            return ret;
        }

        /**
        * Appends scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public appendScale(scale: IPoint2DValue): Matrix2D {
            this.append(this.makeScale(scale, _MATRIX2D));
            return this;
        }

        /**
        * Prepends scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public prependScale(scale: IPoint2DValue): Matrix2D {
            return this.prepend(this.makeScale(scale, _MATRIX2D));
        }
        
        /**
        * Prepends scaling-factors.
        * @param x The x-scaling factor.
        * @param y The y-scaling factor.
        * @return this-chained.
        */
        public prependScaleRaw(x: number, y: number): Matrix2D {
            return this.prependScale(_POINT.setTo(x, y));
        }

        /**
        * Get the decomposed skewing-angles in degree.
        * @param ret Optional buffer.
        * @return The skewing-point.
        */
        public getSkew(ret: Point2D = new Point2D()): Point2D {
            ret.setTo(
                Math.atan2(-this.m21, this.m22) * math.Number.RAD_TO_DEG,
                Math.atan2(this.m12, this.m11) * math.Number.RAD_TO_DEG);
            return ret;
        }

        /**
        * Sets the given skewing angles in degree.
        * @param scale The scaling factors.
        * @return this-chained.
        */
        public setSkew(skew: IPoint2DValue): Matrix2D {
            this.m11 = Math.cos(skew.y * math.Number.DEG_TO_RAD);
            this.m12 = Math.sin(skew.y * math.Number.DEG_TO_RAD);
            this.m21 = -Math.sin(skew.x * math.Number.DEG_TO_RAD);
            this.m22 = Math.cos(skew.x * math.Number.DEG_TO_RAD);
            return this;
        }
        
        /**
        * Create a new skewing-matrix.
        * @param skew The skewing angles.
        * @return The skewing-matrix.
        */
        public makeSkew(skew: IPoint2DValue, ret: Matrix2D = new Matrix2D()): Matrix2D {
            ret.identity();
            ret.setSkew(skew);
            return ret;
        }

        /**
        * Appends the given skewing-angles in degree.
        * @param skew The skewing-angles.
        * @return this-chained.
        */
        public appendSkew(skew: IPoint2DValue): Matrix2D {
            return this.append(this.makeSkew(skew, _MATRIX2D));
        }

        /**
        * Prepends the given skewing-angles in degree.
        * @param skew The skewing-angles.
        * @return this-chained.
        */
        public prependSkew(skew: IPoint2DValue): Matrix2D {
            return this.prepend(this.makeSkew(skew, _MATRIX2D));
        }
        
        /**
        * Get the decomposed rotation-angle in degree.
        * @param ret Optional buffer.
        * @return The rotation-point.
        */
        public getRotation(): number {
            var rotation = Math.atan2(this.m12, this.m11) * math.Number.RAD_TO_DEG;
            if (this.m11 < 0 && this.m22 >= 0)
                rotation += 180;
            return rotation;
        }

        /**
        * Sets the given rotation-angle in degree.
        * @param scale The rotation-angles.
        * @return this-chained.
        */
        public setRotation(rotation: number): Matrix2D {
            var ro = this.getRotation();
            ro += rotation - ro;
            this.appendRotation(ro);
            return this;
        }
        
        /**
        * Creates a new rotation-matrix.
        * @param angle The rotations angle in degree.
        * @return The rotation-matrix.
        */
        public makeRotation(angle: number, ret: Matrix2D = new Matrix2D()): Matrix2D {
            ret.identity();
            ret.setRotation(angle);
            return ret;
        }

        /**
        * Appends the given rotation-angle in degree.
        * @param angle The rotation-angle in degree.
        * @return this-chained.
        */
        public appendRotation(angle: number): Matrix2D {
            angle *= math.Number.DEG_TO_RAD;

            var m11: number = this.m11;
            var m21: number = this.m21;
            var m31: number = this.m31;

            var THETA: number = Math.cos(angle);
            var BETA: number = Math.sin(angle);
            this.m11 = m11 * THETA - this.m12 * BETA;
            this.m12 = m11 * BETA + this.m12 * THETA;
            this.m21 = m21 * THETA - this.m22 * BETA;
            this.m22 = m21 * BETA + this.m22 * THETA;
            this.m31 = m31 * THETA - this.m32 * BETA;
            this.m32 = m31 * BETA + this.m32 * THETA;
            return this;
        }

        /**
        * Prepends the given rotation-angle in degree.
        * @param angle The rotation-angle in degree.
        * @return this-chained.
        */
        public prependRotation(angle: number): Matrix2D {
            return this.prepend(this.makeRotation(angle, _MATRIX2D));
        }

        public compose(target: IComposition2D): Matrix2D {
            this.identity();
            if (target.scale.x != 1 || target.scale.y != 1)
                this.appendScale(target.scale);
            if (target.skew.x || target.skew.y)
                this.appendSkew(target.skew);
            if (target.rotation != 0)
                this.appendRotation(target.rotation);
            if (target.position.x || target.position.y)
                this.appendPosition(target.position);
            return this;
        }

        public decompose(ret: IComposition2D = null): IComposition2D {
            if (ret) {
                ret.position = this.getPosition(ret.position);
                ret.skew = this.getSkew(ret.skew);
                ret.scale = this.getScale(ret.scale);
                ret.rotation = this.getRotation();
                return ret;
            }
            return {
                position: this.getPosition(),
                skew: this.getSkew(),
                scale: this.getScale(),
                rotation: this.getRotation()
            };
        }

        public invert(): Matrix2D {
            var m11: number = this.m11;
            var m12: number = this.m12;
            var m21: number = this.m21;
            var m22: number = this.m22;
            var m31: number = this.m31;
            var n: number = m11 * m22 - m12 * m21;

            this.m11 = m22 / n;
            this.m12 = -m12 / n;
            this.m21 = -m21 / n;
            this.m22 = m11 / n;
            this.m31 = (m21 * this.m32 - m22 * m31) / n;
            this.m32 = -(m11 * this.m32 - m12 * m31) / n;

            this.m13 = 0;
            this.m23 = 0;
            this.m33 = 1;

            return this;
        }

        public getCSS(fractionalDigits: number = 6): string {
            return "matrix("
                + this.m11.toFixed(fractionalDigits) + ","
                + this.m12.toFixed(fractionalDigits) + ","
                + this.m21.toFixed(fractionalDigits) + ","
                + this.m22.toFixed(fractionalDigits) + ","
                + this.m31.toFixed(fractionalDigits) + ","
                + this.m32.toFixed(fractionalDigits) + ")";
        }

        public getCSS3D(fractionalDigits: number = 6): string {
            return "matrix3d("
                + this.m11.toFixed(fractionalDigits) + ","
                + this.m12.toFixed(fractionalDigits) + ","
                + 0 + ","
                + this.m13.toFixed(fractionalDigits) + ","
                + this.m21.toFixed(fractionalDigits) + ","
                + this.m22.toFixed(fractionalDigits) + ","
                + 0 + ","
                + this.m23.toFixed(fractionalDigits) + ","
                + 0 + ","
                + 0 + ","
                + 1 + ","
                + 0 + ","
                + this.m31.toFixed(fractionalDigits) + ","
                + this.m32.toFixed(fractionalDigits) + ","
                + 0 + ","
                + this.m33.toFixed(fractionalDigits) + ")";
        }

        public setCSS(cssString: string): Matrix2D {
            if (!cssString || cssString == "none")
                return this.identity();

            var trans: any[] = cssString.replace("matrix3d(", "").replace("matrix(", "").replace(")", "").split(",");
            var l = trans.length;
            if (l < 6)
                return this.identity();
            for (var i = 0; i < l; ++i)
                trans[i] = math.Number.parse(trans[i], 0);
            this.setData(trans);

            return this;
        }

        public static multiply(a: IMatrix2DValue, b: IMatrix2DValue, ret: Matrix2D = new Matrix2D()): Matrix2D {
            var data: number[] = _ARRAY;
            data[0] = b.m11 * a.m11 + b.m12 * a.m21 + b.m13 * a.m31;
            data[1] = b.m11 * a.m12 + b.m12 * a.m22 + b.m13 * a.m32;
            data[2] = b.m11 * a.m13 + b.m12 * a.m23 + b.m13 * a.m33;

            data[3] = b.m21 * a.m11 + b.m22 * a.m21 + b.m23 * a.m31;
            data[4] = b.m21 * a.m12 + b.m22 * a.m22 + b.m23 * a.m32;
            data[5] = b.m21 * a.m13 + b.m22 * a.m23 + b.m23 * a.m33;

            data[6] = b.m31 * a.m11 + b.m32 * a.m21 + b.m33 * a.m31;
            data[7] = b.m31 * a.m12 + b.m32 * a.m22 + b.m33 * a.m32;
            data[8] = b.m31 * a.m13 + b.m32 * a.m23 + b.m33 * a.m33;
            return ret.setData(data);
        }

        public static adjugate(matrix: Matrix2D, ret: Matrix2D = new Matrix2D()): Matrix2D {
            var data: number[] = _ARRAY;
            data[0] = matrix.m22 * matrix.m33 - matrix.m32 * matrix.m23;
            data[1] = matrix.m32 * matrix.m13 - matrix.m12 * matrix.m33;
            data[2] = matrix.m12 * matrix.m23 - matrix.m22 * matrix.m13;

            data[3] = matrix.m31 * matrix.m23 - matrix.m21 * matrix.m33;
            data[4] = matrix.m11 * matrix.m33 - matrix.m31 * matrix.m13;
            data[5] = matrix.m21 * matrix.m13 - matrix.m11 * matrix.m23;

            data[6] = matrix.m21 * matrix.m32 - matrix.m31 * matrix.m22;
            data[7] = matrix.m31 * matrix.m12 - matrix.m11 * matrix.m32;
            data[8] = matrix.m11 * matrix.m22 - matrix.m21 * matrix.m12;
            return ret.setData(data);
        }

        public toStringTable(fractionDigits: number = 3): string {
            return "m11=" + this.m11.toFixed(fractionDigits)
                + "\tm21=" + this.m21.toFixed(fractionDigits)
                + "\tm31=" + this.m31.toFixed(fractionDigits)
                + "\nm12=" + this.m12.toFixed(fractionDigits)
                + "\tm22=" + this.m22.toFixed(fractionDigits)
                + "\tm32=" + this.m32.toFixed(fractionDigits)
                + "\nm13=" + this.m13.toFixed(fractionDigits)
                + "\tm23=" + this.m23.toFixed(fractionDigits)
                + "\tm33=" + this.m33.toFixed(fractionDigits);
        }
    }

    var _ARRAY = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    var _MATRIX2D = new Matrix2D();
    var _POINT = new Point2D();
}