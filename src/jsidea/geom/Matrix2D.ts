module jsidea.geom {
    export interface IMatrix2DValue {
        m11: number;
        m12: number;
        m21: number;
        m22: number;
        m31: number;
        m32: number;
    }

    export interface IComposition2D {
        position: Point2D;
        scale: Point2D;
        skew: Point2D;
        rotation: number;
    }
    
    /**
    * Matrix2D math.
    *  
    * @author Jöran Benker
    * 
    */
    export class Matrix2D implements IMatrix2DValue {

        public m11: number = 1;
        public m12: number = 0;
        public m21: number = 0;
        public m22: number = 1;
        public m31: number = 0;
        public m32: number = 0;

        constructor() {
        }

        public static create(element: HTMLElement = null, ret = new Matrix2D()): Matrix2D {
            if (element && element.ownerDocument)
                return ret.setCSS(window.getComputedStyle(element).transform);
            return ret.identity();
        }

        public static parse(cssStr: string, ret = new Matrix2D()): Matrix2D {
            return ret.setCSS(cssStr);
        }

        public getData(): number[] {
            return [this.m11, this.m12, this.m21, this.m22, this.m31, this.m32];
        }

        public setData(data: number[]): Matrix2D {
            if (data === undefined)
                return;
            this.m11 = data[0]
            this.m12 = data[1]
            this.m21 = data[2]
            this.m22 = data[3]
            this.m31 = data[4]
            this.m32 = data[5]

            return this;
        }

        public copyFrom(matrix: IMatrix2DValue): Matrix2D {
            this.m11 = matrix.m11;
            this.m12 = matrix.m12;
            this.m21 = matrix.m21;
            this.m22 = matrix.m22;
            this.m31 = matrix.m31;
            this.m32 = matrix.m32;

            return this;
        }

        public copyTo(matrix: IMatrix2DValue): Matrix2D {
            matrix.m11 = this.m11;
            matrix.m12 = this.m12;
            matrix.m21 = this.m21;
            matrix.m22 = this.m22;
            matrix.m31 = this.m31;
            matrix.m32 = this.m32;

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
            this.m21 = 0;
            this.m22 = 1;
            this.m31 = 0;
            this.m32 = 0;

            return this;
        }

        public isIdentity(): boolean {
            return this.m11 == 1 &&
                this.m12 == 0 &&
                this.m21 == 0 &&
                this.m22 == 1 &&
                this.m31 == 0 &&
                this.m32 == 0;
        }

        public scalar(scalar: number): Matrix2D {
            this.m11 *= scalar;
            this.m12 *= scalar;
            this.m21 *= scalar;
            this.m22 *= scalar;
            this.m31 *= scalar;
            this.m32 *= scalar;
            return this;
        }

        public normalize(): Matrix2D {
            var m33 = 1;
            if (m33 === 0)
                return this;
            this.scalar(1 / m33);
            return this;
        }

        public deltaTransform(x: number, y: number, ret: Point2D = new Point2D()): Point2D {
            return ret.setTo(
                this.m11 * x + this.m21 * y,
                this.m12 * x + this.m22 * y);
        }

        public transform(point: IPoint2DValue, ret: Point2D = new Point2D()): Point2D {
            return this.transformRaw(point.x, point.y, ret);
        }

        public transformRaw(x: number, y: number, ret: Point2D = new Point2D()): Point2D {
            return ret.setTo(
                this.m11 * x + this.m21 * y + this.m31,
                this.m12 * x + this.m22 * y + this.m32);
        }

        public append(matrix: IMatrix2DValue): Matrix2D {
            Matrix2D.multiply(this, matrix, this);
            return this;
        }

        public prepend(matrix: IMatrix2DValue): Matrix2D {
            Matrix2D.multiply(matrix, this, this);
            return this;
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
        * Appends position/offset.
        * @param x The x-offset.
        * @param y The y-offset.
        * @return this-chained.
        */
        public appendPositionRaw(x: number, y: number): Matrix2D {
            return this.appendPosition(_POINT.setTo(x, y));
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
        * Appends scaling-factors.
        * @param x The x-scaling factor.
        * @param y The y-scaling factor.
        * @return this-chained.
        */
        public appendScaleRaw(x: number, y: number): Matrix2D {
            return this.appendScale(_POINT.setTo(x, y));
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
        * Appends the given skewing-angles in degree.
        * @param x The x-angle.
        * @param y The y-angle.
        * @return this-chained.
        */
        public appendSkewRaw(x: number, y: number): Matrix2D {
            return this.appendSkew(_POINT.setTo(x, y));
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
        * Prepends the given skewing-angles in degree.
        * @param x The x-angle.
        * @param y The y-angle.
        * @return this-chained.
        */
        public prependSkewRaw(x: number, y: number): Matrix2D {
            return this.prependSkew(_POINT.setTo(x, y));
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

        public setCSS(cssString: string): Matrix2D {
            if (!cssString || cssString == "none") {
                return this.identity();
            }

            if (cssString.indexOf("matrix3d") >= 0) {
                var trans = cssString.replace("matrix3d(", "").replace(")", "").split(",");
                this.m11 = math.Number.parse(trans[0], 1);
                this.m12 = math.Number.parse(trans[1], 0);
                this.m21 = math.Number.parse(trans[4], 0);
                this.m22 = math.Number.parse(trans[5], 1);
                this.m31 = math.Number.parse(trans[12], 0);
                this.m32 = math.Number.parse(trans[13], 0);
                return this;
            }

            var trans = cssString.replace("matrix(", "").replace(")", "").split(",");
            this.m11 = math.Number.parse(trans[0], 1);
            this.m12 = math.Number.parse(trans[1], 0);
            this.m21 = math.Number.parse(trans[2], 0);
            this.m22 = math.Number.parse(trans[3], 1);
            this.m31 = math.Number.parse(trans[4], 0);
            this.m32 = math.Number.parse(trans[5], 0);
            return this;
        }

        public originBox(
            x: number = 0,
            y: number = 0,
            originX: number = 0,
            originY: number = 0,
            scaleX: number = 1,
            scaleY: number = 1,
            rotation: number = 0): Matrix2D {

            //pivotX/pivotY is 'lost in transformation'

            rotation *= 0.017453292519943295;
            originX *= scaleX;
            originY *= scaleY;
            var theta: number = Math.cos(rotation);
            var gamma: number = Math.sin(rotation);

            this.m11 = theta * scaleX;
            this.m12 = gamma * scaleX;
            this.m21 = -gamma * scaleY;
            this.m22 = theta * scaleY;
            this.m31 = theta * -originX + gamma * originY + x;
            this.m32 = gamma * -originX + theta * -originY + y;

            return this;
        }

        public static multiply(a: IMatrix2DValue, b: IMatrix2DValue, ret: Matrix2D = new Matrix2D()): Matrix2D {
            var data: number[] = [];
            data[0] = b.m11 * a.m11 + b.m12 * a.m21;
            data[1] = b.m11 * a.m12 + b.m12 * a.m22;
            data[2] = b.m21 * a.m11 + b.m22 * a.m21;
            data[3] = b.m21 * a.m12 + b.m22 * a.m22;
            data[4] = b.m31 * a.m11 + b.m32 * a.m21 + a.m31;
            data[5] = b.m31 * a.m12 + b.m32 * a.m22 + a.m32;
            return ret.setData(data);
        }

        public toStringTable(fractionDigits: number = 3): string {
            return "m11=" + this.m11.toFixed(fractionDigits)
                + "\tm21=" + this.m21.toFixed(fractionDigits)
                + "\tm31=" + this.m31.toFixed(fractionDigits)
                + "\nm12=" + this.m12.toFixed(fractionDigits)
                + "\tm22=" + this.m22.toFixed(fractionDigits)
                + "\tm32=" + this.m32.toFixed(fractionDigits)
                + "\nm13=" + (0).toFixed(fractionDigits)
                + "\tm23=" + (0).toFixed(fractionDigits)
                + "\tm33=" + (1).toFixed(fractionDigits);
        }

        public toString(fractionDigits: number = 3): string {
            return "[ jsidea.geom.Matrix2D \n"
                + this.toStringTable(fractionDigits)
                + "\n]";
        }
    }

    var _MATRIX2D = new Matrix2D();
    var _POINT = new Point2D();
}