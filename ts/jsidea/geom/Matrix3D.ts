module jsidea.geom {
    export interface IMatrix3DValue {
        m11: number;
        m12: number;
        m13: number;
        m14: number;
        m21: number;
        m22: number;
        m23: number;
        m24: number;
        m31: number;
        m32: number;
        m33: number;
        m34: number;
        m41: number;
        m42: number;
        m43: number;
        m44: number;
    }

    export interface IComposition3D {
        position: Point3D;
        scale: Point3D;
        skew: Point3D;
        rotation: Point3D;
    }
    
    /**
    * Matrix3D math.
    *  
    * @author Jöran Benker
    * 
    */
    export class Matrix3D implements IMatrix3DValue {
        private static tempAxeX: Point3D = new Point3D();
        private static tempAxeY: Point3D = new Point3D();
        private static tempAxeZ: Point3D = new Point3D();

        public m11: number = 1;
        public m12: number = 0;
        public m13: number = 0;
        public m14: number = 0;
        public m21: number = 0;
        public m22: number = 1;
        public m23: number = 0;
        public m24: number = 0;
        public m31: number = 0;
        public m32: number = 0;
        public m33: number = 1;
        public m34: number = 0;
        public m41: number = 0;
        public m42: number = 0;
        public m43: number = 0;
        public m44: number = 1;

        constructor(data: number[] = null) {
            if (data)
                this.setData(data);
        }

        public getData(): number[] {
            return [
                this.m11, this.m12, this.m13, this.m14,//column 1
                this.m21, this.m22, this.m23, this.m24,//column 2
                this.m31, this.m32, this.m33, this.m34,//column 3
                this.m41, this.m42, this.m43, this.m44 //column 4
            ];
        }

        public setData(data: number[]): Matrix3D {
            if (data === undefined)
                return;
            this.m11 = data[0];
            this.m12 = data[1];
            this.m13 = data[2];
            this.m14 = data[3];
            this.m21 = data[4];
            this.m22 = data[5];
            this.m23 = data[6];
            this.m24 = data[7];
            this.m31 = data[8];
            this.m32 = data[9];
            this.m33 = data[10];
            this.m34 = data[11];
            this.m41 = data[12];
            this.m42 = data[13];
            this.m43 = data[14];
            this.m44 = data[15];

            return this;
        }

        public copyFrom(matrix: IMatrix3DValue): Matrix3D {
            this.m11 = matrix.m11;
            this.m12 = matrix.m12;
            this.m13 = matrix.m13;
            this.m14 = matrix.m14;
            this.m21 = matrix.m21;
            this.m22 = matrix.m22;
            this.m23 = matrix.m23;
            this.m24 = matrix.m24;
            this.m31 = matrix.m31;
            this.m32 = matrix.m32;
            this.m33 = matrix.m33;
            this.m34 = matrix.m34;
            this.m41 = matrix.m41;
            this.m42 = matrix.m42;
            this.m43 = matrix.m43;
            this.m44 = matrix.m44;
            return this;
        }

        public copyTo(matrix: IMatrix3DValue): Matrix3D {
            matrix.m11 = this.m11;
            matrix.m12 = this.m12;
            matrix.m13 = this.m13;
            matrix.m14 = this.m14;
            matrix.m21 = this.m21;
            matrix.m22 = this.m22;
            matrix.m23 = this.m23;
            matrix.m24 = this.m24;
            matrix.m31 = this.m31;
            matrix.m32 = this.m32;
            matrix.m33 = this.m33;
            matrix.m34 = this.m34;
            matrix.m41 = this.m41;
            matrix.m42 = this.m42;
            matrix.m43 = this.m43;
            matrix.m44 = this.m44;
            return this;
        }

        public clone(): Matrix3D {
            var cl = new Matrix3D();
            cl.copyFrom(this);
            return cl;
        }

        public identity(): Matrix3D {
            this.m11 = 1;
            this.m12 = 0;
            this.m13 = 0;
            this.m14 = 0;
            this.m21 = 0;
            this.m22 = 1;
            this.m23 = 0;
            this.m24 = 0;
            this.m31 = 0;
            this.m32 = 0;
            this.m33 = 1;
            this.m34 = 0;
            this.m41 = 0;
            this.m42 = 0;
            this.m43 = 0;
            this.m44 = 1;
            return this;
        }

        public isIdentity(): boolean {
            return this.m11 == 1 &&
                this.m12 == 0 &&
                this.m13 == 0 &&
                this.m14 == 0 &&
                this.m21 == 0 &&
                this.m22 == 1 &&
                this.m23 == 0 &&
                this.m24 == 0 &&
                this.m31 == 0 &&
                this.m32 == 0 &&
                this.m33 == 1 &&
                this.m34 == 0 &&
                this.m41 == 0 &&
                this.m42 == 0 &&
                this.m43 == 0 &&
                this.m44 == 1;
        }

        public scalar(scalar: number): Matrix3D {
            this.m11 *= scalar;
            this.m12 *= scalar;
            this.m13 *= scalar;
            this.m14 *= scalar;
            this.m21 *= scalar;
            this.m22 *= scalar;
            this.m23 *= scalar;
            this.m24 *= scalar;
            this.m31 *= scalar;
            this.m32 *= scalar;
            this.m33 *= scalar;
            this.m34 *= scalar;
            this.m41 *= scalar;
            this.m42 *= scalar;
            this.m43 *= scalar;
            this.m44 *= scalar;

            return this;
        }

        public normalize(): Matrix3D {
            if (this.m44 === 0)
                return this;
            this.scalar(1 / this.m44);
            return this;
        }

        public deltaTransform(point: IPoint3DValue, ret: Point3D = new Point3D()): Point3D {
            var x = point.x * this.m11 + point.y * this.m21 + point.z * this.m31;
            var y = point.x * this.m12 + point.y * this.m22 + point.z * this.m32;
            var z = point.x * this.m13 + point.y * this.m23 + point.z * this.m33;
            var w = point.x * this.m14 + point.y * this.m24 + point.z * this.m34;

            x /= w;
            y /= w;
            z /= w;

            return ret.setTo(x, y, z, w);
        }

        public deltaTransformRaw(x: number, y: number, z: number, ret: Point3D = new Point3D()): Point3D {
            return this.deltaTransform(Buffer._DELTA_TRANSFORM_RAW_3D.setTo(x, y, z), ret);
        }

        public invertProject(point: IPoint2DValue, ret: Point3D = new Point3D()): Point3D {
            return Buffer._INVERT_PROJECT_3D.copyFrom(this).invert().project(point, ret);
        }
        
        //SOURCE: http://code.metager.de/source/xref/mozilla/B2G/gecko/gfx/thebes/gfx3DMatrix.cpp#651
        public project(point: IPoint2DValue, ret: Point3D = new Point3D()): Point3D {
            var x = point.x * this.m11 + point.y * this.m21 + this.m41;
            var y = point.x * this.m12 + point.y * this.m22 + this.m42;
            var z = point.x * this.m13 + point.y * this.m23 + this.m43;
            var w = point.x * this.m14 + point.y * this.m24 + this.m44;

            var qx = x + this.m31;
            var qy = y + this.m32;
            var qz = z + this.m33;
            var qw = w + this.m34;

            x /= w;
            y /= w;
            z /= w;

            qx /= qw;
            qy /= qw;
            qz /= qw;

            var t = -z / (qz - z);
            return ret.setTo(
                x + t * (qx - x),
                y + t * (qy - y),
                0,
                1);
        }

        //from homegeneous (euclid) to cartesian FLATTENED!!!! like a projection
        public unproject(point: IPoint3DValue, ret: Point3D = new Point3D()): Point3D {
            var x = point.x * this.m11 + point.y * this.m21 + point.z * this.m31 + this.m41;
            var y = point.x * this.m12 + point.y * this.m22 + point.z * this.m32 + this.m42;
            var w = point.x * this.m14 + point.y * this.m24 + point.z * this.m34 + this.m44;

            x /= w;
            y /= w;

            return ret.setTo(x, y, point.z, w);
//            return ret.setTo(x, y, 0, 0);
        }
        
        //from homegeneous (euclid) to cartesian
        public transform3D(point: IPoint3DValue, ret: Point3D = new Point3D()): Point3D {
            var x = point.x * this.m11 + point.y * this.m21 + point.z * this.m31 + this.m41;
            var y = point.x * this.m12 + point.y * this.m22 + point.z * this.m32 + this.m42;
            var z = point.x * this.m13 + point.y * this.m23 + point.z * this.m33 + this.m43;
            var w = point.x * this.m14 + point.y * this.m24 + point.z * this.m34 + this.m44;

            x /= w;
            y /= w;
            z /= w;

            return ret.setTo(x, y, z, w);
        }

        public transform(point: IPoint3DValue, ret: Point3D = new Point3D()): Point3D {
            var x = point.x * this.m11 + point.y * this.m21 + point.z * this.m31 + point.w * this.m41;
            var y = point.x * this.m12 + point.y * this.m22 + point.z * this.m32 + point.w * this.m42;
            var z = point.x * this.m13 + point.y * this.m23 + point.z * this.m33 + point.w * this.m43;
            var w = point.x * this.m14 + point.y * this.m24 + point.z * this.m34 + point.w * this.m44;
            
            //            ret.x = point.x * this.m11 + point.y * this.m21 + point.z * this.m31 + this.m41;
            //            ret.y = point.x * this.m12 + point.y * this.m22 + point.z * this.m32 + this.m42;
            //            ret.z = point.x * this.m13 + point.y * this.m23 + point.z * this.m33 + this.m43;
            //            ret.w = point.x * this.m14 + point.y * this.m24 + point.z * this.m34 + this.m44;
            
            return ret.setTo(x, y, z, w);
        }

        public transformRaw(x: number, y: number, z: number, ret: Point3D = new Point3D()): Point3D {
            return this.transform(Buffer._TRANSFORM_RAW_3D.setTo(x, y, z), ret);
        }

        public append(b: IMatrix3DValue): Matrix3D {
            return Matrix3D.multiply(b, this, this);
        }

        public prepend(b: IMatrix3DValue): Matrix3D {
            return Matrix3D.multiply(this, b, this);
        }
        
        /**
        * Get the decomposed position.
        * @param ret Optional buffer.
        * @return The position.
        */
        public getPosition(ret: Point3D = new Point3D()): Point3D {
            ret.x = this.m41;
            ret.y = this.m42;
            ret.z = this.m43;
            return ret;
        }

        /**
        * Sets the given position.
        * @param position The new position.
        * @return this-chained.
        */
        public setPosition(position: IPoint3DValue): Matrix3D {
            this.m41 = position.x;
            this.m42 = position.y;
            this.m43 = position.z;
            return this;
        }

        /**
        * Creates a new position/translation-matrix.
        * @param position The config object.
        * @return The new translation-matrix.
        */
        public makePosition(position: IPoint3DValue, ret = new Matrix3D()): Matrix3D {
            ret.identity();
            ret.setPosition(position);
            return ret;
        }

        
        /**
        * Appends position/offset.
        * @param position The offset.
        * @return this-chained.
        */
        public appendPosition(position: IPoint3DValue): Matrix3D {
            return this.append(this.makePosition(position, Buffer._APPEND_POSITION_3D));
        }
        
        /**
        * Appends position/offset.
        * @param x The x-offset.
        * @param y The y-offset.
        * @param y The z-offset.
        * @return this-chained.
        */
        public appendPositionRaw(x: number, y: number, z: number): Matrix3D {
            return this.appendPosition(Buffer._APPEND_POSITION_RAW_3D.setTo(x, y, z));
        }

        /**
        * Prepends position/offset.
        * @param position The offset.
        * @return this-chained.
        */
        public prependPosition(position: IPoint3DValue): Matrix3D {
            return this.prepend(this.makePosition(position, Buffer._PREPEND_POSITION_3D));
        }   
        
        /**
        * Prepends position/offset.
        * @param x The x-offset.
        * @param y The y-offset.
        * @param y The z-offset.
        * @return this-chained.
        */

        public prependPositionRaw(x: number, y: number, z: number): Matrix3D {
            return this.prependPosition(Buffer._PREPEND_POSITION_RAW_3D.setTo(x, y, z, 0));
        }
        
        /**
        * Get the decomposed scaling-factors.
        * @param ret Optional buffer.
        * @return The scaling-point.
        */
        public getScale(ret: Point3D = new Point3D()): Point3D {
            ret.x = Math.sqrt(this.m11 * this.m11 + this.m12 * this.m12 + this.m13 * this.m13);
            ret.y = Math.sqrt(this.m21 * this.m21 + this.m22 * this.m22 + this.m23 * this.m23);
            ret.z = Math.sqrt(this.m31 * this.m31 + this.m32 * this.m32 + this.m33 * this.m33);
            return ret;
        }

        /**
        * Sets the given scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public setScale(scale: IPoint3DValue): Matrix3D {
            this.m11 = scale.x;
            this.m22 = scale.y;
            this.m33 = scale.z;
            return this;
        }

        /**
        * Creates a new scaling-matrix.
        * @param scale The scaling-factor.
        * @return The new scaling-matrix.
        */
        public makeScale(scale: IPoint3DValue, ret = new Matrix3D()): Matrix3D {
            ret.identity();
            ret.setScale(scale);
            return ret;
        }

        /**
        * Appends scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public appendScale(scale: IPoint3DValue): Matrix3D {
            return this.append(this.makeScale(scale, Buffer._APPEND_SCALE_3D));
        }
        
        /**
        * Appends scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public appendScaleRaw(x: number, y: number, z: number): Matrix3D {
            return this.appendScale(Buffer._APPEND_SCALE_RAW_3D.setTo(x, y, z));
        }

        /**
        * Prepends scaling-factors.
        * @param scale The scaling-factor.
        * @return this-chained.
        */
        public prependScale(scale: IPoint3DValue): Matrix3D {
            return this.prepend(this.makeScale(scale, Buffer._PREPEND_SCALE_3D));
        }
        
        /**
        * Prepends scaling-factors.
        * @param x The x scaling-factor.
        * @param y The y scaling-factor.
        * @param z The z scaling-factor.
        * @return this-chained.
        */
        public prependScaleRaw(x: number, y: number, z: number): Matrix3D {
            return this.prependScale(Buffer._APPEND_SCALE_RAW_3D.setTo(x, y, z));
        }
        
        /**
        * Get the decomposed skewing-angles in degree.
        * @param ret Optional buffer.
        * @return The skewing-point.
        */
        public getSkew(ret: Point3D = new Point3D()): Point3D {
            ret.x = this.m14 * math.Number.RAD_TO_DEG;
            ret.y = this.m24 * math.Number.RAD_TO_DEG;
            ret.z = this.m34 * math.Number.RAD_TO_DEG;
            ret.w = this.m44;
            return ret;
        }
        
        /**
        * Sets the given skewing angles in degree.
        * @param scale The scaling factors.
        * @return this-chained.
        */
        public setSkew(skew: IPoint3DValue): Matrix3D {
            this.m14 = skew.x * math.Number.DEG_TO_RAD;
            this.m24 = skew.y * math.Number.DEG_TO_RAD;
            this.m34 = skew.z * math.Number.DEG_TO_RAD;
            this.m44 = skew.w;
            return this;
        }
        
        /**
        * Sets the given skewing angles in degree.
        * @param x The x-skewing angle.
        * @param y The y-skewing angle.
        * @param z The z-skewing angle.
        * @return this-chained.
        */

        public setSkewRaw(x: number, y: number, z: number): Matrix3D {
            return this.setSkew(Buffer._SET_SKEW_RAW_3D.setTo(x, y, z));
        }

        /**
        * Create a new skewing-matrix.
        * @param skew The skewing angles.
        * @return The skewing-matrix.
        */
        public makeSkew(skew: IPoint3DValue, ret: Matrix3D = new Matrix3D()): Matrix3D {
            ret.identity();
            ret.setSkew(skew);
            return ret;
        }

        /**
        * Appends the given skewing-angles in degree.
        * @param skew The skewing-angles.
        * @return this-chained.
        */
        public appendSkew(skew: IPoint3DValue): Matrix3D {
            return this.append(this.makeSkew(skew, Buffer._APPEND_SCALE_3D));
        }

        /**
        * Prepends the given skewing-angles in degree.
        * @param skew The skewing-angles.
        * @return this-chained.
        */
        public prependSkew(skew: IPoint3DValue): Matrix3D {
            return this.prepend(this.makeSkew(skew, Buffer._PREPEND_SKEW_3D));
        }
        
        /**
        * Get the decomposed rotation-angles in degree (xyz-order).
        * @param ret Optional buffer.
        * @return The rotation-point.
        */
        public getRotation(ret: Point3D = new Point3D()): Point3D {
            var m = this.getRotationMatrix(Buffer._GET_ROTATION_3D);
            ret.y = -Math.asin(math.Number.clamp(m.m13, -1, 1)) * math.Number.RAD_TO_DEG;
            if (Math.abs(this.m13) < 0.99999) {
                ret.x = Math.atan2(-m.m23, m.m33) * math.Number.RAD_TO_DEG;
                ret.z = Math.atan2(-m.m12, m.m11) * math.Number.RAD_TO_DEG;
            } else {
                ret.x = Math.atan2(m.m32, m.m22) * math.Number.RAD_TO_DEG;
                ret.z = 0;
            }
            return ret;
        }
        
        /**
        * Sets the given rotation-angles in degree (xyz-order).
        * SOURCE: https://github.com/kamicane/matrix3d/blob/master/lib/Matrix3d.js
        * @param scale The rotation-angles.
        * @return this-chained.
        */
        public setRotation(euler: IPoint3DValue): Matrix3D {
            var x = euler.x * math.Number.DEG_TO_RAD;
            var y = euler.y * math.Number.DEG_TO_RAD;
            var z = euler.z * math.Number.DEG_TO_RAD;
            var a = Math.cos(x), b = Math.sin(x);
            var c = Math.cos(y), d = Math.sin(y);
            var e = Math.cos(z), f = Math.sin(z);

            var ae = a * e;
            var af = a * f;
            var be = b * e;
            var bf = b * f;

            this.m11 = c * e;
            this.m21 = - c * f;
            this.m31 = d;
            this.m12 = af + be * d;
            this.m22 = ae - bf * d;
            this.m32 = - b * c;
            this.m13 = bf - ae * d;
            this.m23 = be + af * d;
            this.m33 = a * c;

            return this;
        }

        public makeRotation(euler: IPoint3DValue): Matrix3D {
            var ret = new Matrix3D();
            ret.setRotation(euler);
            return ret;
        }

        public appendRotation(euler: IPoint3DValue): Matrix3D {
            return this.append(this.makeRotation(euler));
        }

        public prependRotation(euler: IPoint3DValue): Matrix3D {
            return this.prepend(this.makeRotation(euler));
        }

        public getRotationMatrix(ret: Matrix3D = new Matrix3D()): Matrix3D {
            ret.identity();

            var tmp = new Point3D();
            var scaleX = 1 / tmp.setTo(this.m11, this.m12, this.m13).length();
            var scaleY = 1 / tmp.setTo(this.m21, this.m22, this.m23).length();
            var scaleZ = 1 / tmp.setTo(this.m31, this.m32, this.m33).length();

            ret.m11 = this.m11 * scaleX;
            ret.m12 = this.m12 * scaleX;
            ret.m13 = this.m13 * scaleX;
            ret.m21 = this.m21 * scaleY;
            ret.m22 = this.m22 * scaleY;
            ret.m23 = this.m23 * scaleY;
            ret.m31 = this.m31 * scaleZ;
            ret.m32 = this.m32 * scaleZ;
            ret.m33 = this.m33 * scaleZ;
            return ret;
        }
        
        /**
       * Creates a new perspective-matrix.
       * @param perspective The perspective.
       * @return The new perspective-matrix.
       */
        public makePerspective(perspective: number, ret = new Matrix3D()): Matrix3D {
            ret.identity();
            ret.m34 = perspective ? -(1 / perspective) : 0;
            return ret;
        }

        /**
        * Appends perspective.
        * @param perspective The perspective (focal length).
        * @return this-chained.
        */
        public appendPerspective(perspective: number): Matrix3D {
            return this.append(this.makePerspective(perspective, Buffer._APPEND_PERSPECTIVE_3D));
        }

        /**
        * Prepends perspective.
        * @param perspective The perspective (focal length).
        * @return this-chained.
        */
        public prependPerspective(perspective: number): Matrix3D {
            return this.prepend(this.makePerspective(perspective, Buffer._PREPEND_PERSPECTIVE_3D));
        }

        public getPerspective(): number {
            return this.m34 ? - (1 / this.m34) : 0;
        }

        public setPerspective(perspective: number): Matrix3D {
            this.m34 = perspective ? -(1 / perspective) : 0;
            return this;
        }

        public compose(trans: IComposition3D): Matrix3D {
            this.identity();
            if (trans.scale.x != 1 || trans.scale.y != 1 || trans.scale.z != 1)
                this.appendScale(trans.scale);
            if (trans.skew.x || trans.skew.y || trans.skew.z)
                this.appendSkew(trans.skew);
            if (trans.rotation.x != 0 || trans.rotation.y != 0 || trans.rotation.z != 0)
                this.appendRotation(trans.rotation);
            if (trans.position.x || trans.position.y || trans.position.z)
                this.appendPosition(trans.position);
            return this;
        }

        public decompose(ret: IComposition3D = null): IComposition3D {
            if (ret) {
                ret.position = this.getPosition(ret.position);
                ret.skew = this.getSkew(ret.skew);
                ret.scale = this.getScale(ret.scale);
                ret.rotation = this.getRotation(ret.rotation);
                return ret;
            }
            return {
                position: this.getPosition(),
                skew: this.getSkew(),
                scale: this.getScale(),
                rotation: this.getRotation()
            };
        }

        public invert(): Matrix3D {
            // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
            // based on https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js
            var data = [];

            var n11 = this.m11, n12 = this.m12, n13 = this.m13, n14 = this.m14;
            var n21 = this.m21, n22 = this.m22, n23 = this.m23, n24 = this.m24;
            var n31 = this.m31, n32 = this.m32, n33 = this.m33, n34 = this.m34;
            var n41 = this.m41, n42 = this.m42, n43 = this.m43, n44 = this.m44;

            data[0] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
            data[1] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
            data[2] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
            data[3] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
            
            var det = n11 * data[0] + n21 * data[1] + n31 * data[2] + n41 * data[3];
            if (det == 0) {
                console.warn("Can't invert matrix, determinant is 0");
                return this;
            }
            
            data[4] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
            data[5] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
            data[6] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
            data[7] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
            data[8] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
            data[9] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
            data[10] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
            data[11] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
            data[12] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
            data[13] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
            data[14] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
            data[15] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;

            this.setData(data);
            this.scalar(1 / det);
            return this;
        }

        public getCSS(fractionalDigits: number = 6): string {
            return "matrix3d("
                + this.m11.toFixed(fractionalDigits) + ","
                + this.m12.toFixed(fractionalDigits) + ","
                + this.m13.toFixed(fractionalDigits) + ","
                + this.m14.toFixed(fractionalDigits) + ","
                + this.m21.toFixed(fractionalDigits) + ","
                + this.m22.toFixed(fractionalDigits) + ","
                + this.m23.toFixed(fractionalDigits) + ","
                + this.m24.toFixed(fractionalDigits) + ","
                + this.m31.toFixed(fractionalDigits) + ","
                + this.m32.toFixed(fractionalDigits) + ","
                + this.m33.toFixed(fractionalDigits) + ","
                + this.m34.toFixed(fractionalDigits) + ","
                + this.m41.toFixed(fractionalDigits) + ","
                + this.m42.toFixed(fractionalDigits) + ","
                + this.m43.toFixed(fractionalDigits) + ","
                + this.m44.toFixed(fractionalDigits) + ")";
        }

        public setCSS(cssString: string): Matrix3D {
            if (!cssString || cssString == "none") {
                return this.identity();
            }

            if (cssString.indexOf("matrix3d") < 0)
                return this.setMatrix2D(Buffer._SET_CSS_3D.setCSS(cssString));

            var trans = cssString.replace("matrix3d(", "").replace(")", "").split(",");
            this.m11 = math.Number.parse(trans[0], 1);
            this.m12 = math.Number.parse(trans[1], 0);
            this.m13 = math.Number.parse(trans[2], 0);
            this.m14 = math.Number.parse(trans[3], 0);
            this.m21 = math.Number.parse(trans[4], 0);
            this.m22 = math.Number.parse(trans[5], 1);
            this.m23 = math.Number.parse(trans[6], 0);
            this.m24 = math.Number.parse(trans[7], 0);
            this.m31 = math.Number.parse(trans[8], 0);
            this.m32 = math.Number.parse(trans[9], 0);
            this.m33 = math.Number.parse(trans[10], 1);
            this.m34 = math.Number.parse(trans[11], 0);
            this.m41 = math.Number.parse(trans[12], 0);
            this.m42 = math.Number.parse(trans[13], 0);
            this.m43 = math.Number.parse(trans[14], 0);
            this.m44 = math.Number.parse(trans[15], 1);
            return this;
        }

        public appendCSS(cssString: string): Matrix3D {
            return this.append(Buffer._APPEND_CSS_3D.setCSS(cssString));
        }

        public prependCSS(cssString: string): Matrix3D {
            return this.prepend(Buffer._PREPEND_CSS_3D.setCSS(cssString));
        }

        public getMatrix2D(ret: Matrix2D = new Matrix2D()): Matrix2D {
            ret.identity();
            ret.m11 = this.m11;//a = 0
            ret.m12 = this.m12;//b = 1
            ret.m21 = this.m21;//c = 4 
            ret.m22 = this.m22;//d = 4
            ret.m31 = this.m41;//tx = 11
            ret.m32 = this.m42;//ty = 12
            return ret;
        }

        public setMatrix2D(target: IMatrix2DValue): Matrix3D {
            this.identity();
            this.m11 = target.m11;
            this.m21 = target.m21;
            this.m12 = target.m12;
            this.m22 = target.m22;
            this.m41 = target.m31;
            this.m42 = target.m32;

            return this;
        }

        public is2D(): boolean {
            if (this.isIdentity())
                return true;
            return (this.m31 == 0 && this.m32 == 0 && this.m33 == 1 && this.m34 == 0 && this.m43 == 0 && this.m44 == 1);
        }

        public is3D(): boolean {
            return !this.is2D();
        }
        
        
        
        //        //SOURCE: http://code.metager.de/source/xref/mozilla/B2G/gecko/gfx/thebes/gfx3DMatrix.cpp#651
        //        public project(point: IPoint2DValue): Point3D {
        //            var p = new Point3D(point.x, point.y, 0);
        //            var q = new Point3D(point.x, point.y, 1);
        //
        //            var pBack = this.transform3D(p);
        //            var qBack = this.transform3D(q);
        //            var uBack = qBack.sub(pBack);
        //            var t = -pBack.z / uBack.z;
        //            return new Point3D(pBack.x + t * uBack.x, pBack.y + t * uBack.y, 0, 1);
        //        }
        
        //source: http://code.metager.de/source/xref/mozilla/firefox/gfx/thebes/gfx3DMatrix.cpp#Transform4D
        //        public project(point: IPoint2DValue): Point3D {
        //            // Solving for z when z' = 0 gives us:
        //            var z = -(point.x * this.m13 + point.y * this.m23 + this.m43) / this.m33;
        //
        //            // Compute the transformed point
        //            return this.transform(new Point3D(point.x, point.y, z, 1));
        //        }

        //        public changeBasis(origin: IPoint2DValue): Matrix3D {
        //            this.prependPositionRaw(-origin.x, -origin.y, 0);
        //            return this.appendPositionRaw(origin.x, origin.y, 0);
        //            //            this.prependPositionRaw(origin.x, origin.y, 0);
        //            //            return this.appendPositionRaw(-origin.x, -origin.y, 0);
        //        }

        //        public getNormalVector(): Point3D {
        //            // Define a plane in transformed space as the transformations
        //            // of 3 points on the z=0 screen plane.
        //            var a = this.transform3D(new Point3D(0, 0, 0));
        //            var b = this.transform3D(new Point3D(0, 1, 0));
        //            var c = this.transform3D(new Point3D(1, 0, 0));
        //
        //            // Convert to two vectors on the surface of the plane.
        //            var ab = b.sub(a);
        //            var ac = c.sub(a);
        //            return ac.cross(ab);
        //        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Matrix3D";
        }

        public toString(fractionDigits: number = 3): string {
            return "[Matrix3D \n"
                + this.toStringTable(fractionDigits)
                + "\n]";
        }

        public toStringTable(fractionDigits: number = 3): string {
            return "m11=" + this.m11.toFixed(fractionDigits)
                + "\tm21=" + this.m21.toFixed(fractionDigits)
                + "\tm31=" + this.m31.toFixed(fractionDigits)
                + "\tm41=" + this.m41.toFixed(fractionDigits)
                + "\nm12=" + this.m12.toFixed(fractionDigits)
                + "\tm22=" + this.m22.toFixed(fractionDigits)
                + "\tm32=" + this.m32.toFixed(fractionDigits)
                + "\tm42=" + this.m42.toFixed(fractionDigits)
                + "\nm13=" + this.m13.toFixed(fractionDigits)
                + "\tm23=" + this.m23.toFixed(fractionDigits)
                + "\tm33=" + this.m33.toFixed(fractionDigits)
                + "\tm43=" + this.m43.toFixed(fractionDigits)
                + "\nm14=" + this.m14.toFixed(fractionDigits)
                + "\tm24=" + this.m24.toFixed(fractionDigits)
                + "\tm34=" + this.m34.toFixed(fractionDigits)
                + "\tm44=" + this.m44.toFixed(fractionDigits);
        }

        public lookAt(eye: Point3D, target: Point3D, up: Point3D): Matrix3D {
            var x: Point3D = Matrix3D.tempAxeX;
            var y: Point3D = Matrix3D.tempAxeY;
            var z: Point3D = Matrix3D.tempAxeZ;

            z.setSub(eye, target).normalize();
            if (z.length() === 0) {
                z.z = 1;
            }
            x.setCross(up, z).normalize();
            if (x.length() === 0) {
                z.x += 0.0001;
                x.setCross(up, z).normalize();
            }
            y.setCross(z, x);

            this.m11 = x.x;
            this.m12 = x.y;
            this.m13 = x.z;
            this.m21 = y.x;
            this.m22 = y.y;
            this.m23 = y.z;
            this.m31 = z.x;
            this.m32 = z.y;
            this.m33 = z.z;

            return this;
        }
        
        //        public static lookAt(
        //            position: Point3D,
        //            scale: Point3D,
        //            target: Point3D,
        //            upAxis: Point3D = Point3D.Y_AXIS,
        //            ret: Matrix3D = new Matrix3D()): Matrix3D {
        //
        //            var xAxis: Point3D = Matrix3D.tempAxeX;
        //            var yAxis: Point3D = Matrix3D.tempAxeY;
        //            var zAxis: Point3D = Matrix3D.tempAxeZ;
        //
        //            zAxis.x = target.x - position.x;
        //            zAxis.y = target.y - position.y;
        //            zAxis.z = target.z - position.z;
        //            zAxis.normalize();
        //
        //            xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
        //            xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
        //            xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
        //            xAxis.normalize();
        //
        //            if (xAxis.length() < .05) {
        //                xAxis.x = upAxis.y;
        //                xAxis.y = upAxis.x;
        //                xAxis.z = 0;
        //                xAxis.normalize();
        //            }
        //
        //            yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
        //            yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
        //            yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;
        //
        //            var data: number[];
        //
        //            data[0] = scale.x * xAxis.x;
        //            data[1] = scale.x * xAxis.y;
        //            data[2] = scale.x * xAxis.z;
        //            data[3] = 0;
        //
        //            data[4] = scale.y * yAxis.x;
        //            data[5] = scale.y * yAxis.y;
        //            data[6] = scale.y * yAxis.z;
        //            data[7] = 0;
        //
        //            data[8] = scale.z * zAxis.x;
        //            data[9] = scale.z * zAxis.y;
        //            data[10] = scale.z * zAxis.z;
        //            data[11] = 0;
        //
        //            data[12] = position.x;
        //            data[13] = position.y;
        //            data[14] = position.z;
        //            data[15] = 1;
        //
        //            ret.setData(data);
        //
        //            if (zAxis.z < 0) {
        //                var r = ret.getRotation();
        //                r.y = (180 - r.y);
        //                r.x -= 180;
        //                r.z -= 180;
        //                ret.setRotation(r);
        //            }
        //
        //            return ret;
        //        }

        public static parse(cssStr: string, ret = new Matrix3D()): Matrix3D {
            return ret.setCSS(cssStr);
        }

        public static multiply(a: IMatrix3DValue, b: IMatrix3DValue, ret: Matrix3D = new Matrix3D()): Matrix3D {
//            var data: number[] = [];
//            data[0] = b.m11 * a.m11 + b.m12 * a.m21 + b.m13 * a.m31 + b.m14 * a.m41;
//            data[1] = b.m11 * a.m12 + b.m12 * a.m22 + b.m13 * a.m32 + b.m14 * a.m42;
//            data[2] = b.m11 * a.m13 + b.m12 * a.m23 + b.m13 * a.m33 + b.m14 * a.m43;
//            data[3] = b.m11 * a.m14 + b.m12 * a.m24 + b.m13 * a.m34 + b.m14 * a.m44;
//            data[4] = b.m21 * a.m11 + b.m22 * a.m21 + b.m23 * a.m31 + b.m24 * a.m41;
//            data[5] = b.m21 * a.m12 + b.m22 * a.m22 + b.m23 * a.m32 + b.m24 * a.m42;
//            data[6] = b.m21 * a.m13 + b.m22 * a.m23 + b.m23 * a.m33 + b.m24 * a.m43;
//            data[7] = b.m21 * a.m14 + b.m22 * a.m24 + b.m23 * a.m34 + b.m24 * a.m44;
//            data[8] = b.m31 * a.m11 + b.m32 * a.m21 + b.m33 * a.m31 + b.m34 * a.m41;
//            data[9] = b.m31 * a.m12 + b.m32 * a.m22 + b.m33 * a.m32 + b.m34 * a.m42;
//            data[10] = b.m31 * a.m13 + b.m32 * a.m23 + b.m33 * a.m33 + b.m34 * a.m43;
//            data[11] = b.m31 * a.m14 + b.m32 * a.m24 + b.m33 * a.m34 + b.m34 * a.m44;
//            data[12] = b.m41 * a.m11 + b.m42 * a.m21 + b.m43 * a.m31 + b.m44 * a.m41;
//            data[13] = b.m41 * a.m12 + b.m42 * a.m22 + b.m43 * a.m32 + b.m44 * a.m42;
//            data[14] = b.m41 * a.m13 + b.m42 * a.m23 + b.m43 * a.m33 + b.m44 * a.m43;
//            data[15] = b.m41 * a.m14 + b.m42 * a.m24 + b.m43 * a.m34 + b.m44 * a.m44;
//            return ret.setData(data);
            
            var m11 = b.m11 * a.m11 + b.m12 * a.m21 + b.m13 * a.m31 + b.m14 * a.m41;
            var m12 = b.m11 * a.m12 + b.m12 * a.m22 + b.m13 * a.m32 + b.m14 * a.m42;
            var m13 = b.m11 * a.m13 + b.m12 * a.m23 + b.m13 * a.m33 + b.m14 * a.m43;
            var m14 = b.m11 * a.m14 + b.m12 * a.m24 + b.m13 * a.m34 + b.m14 * a.m44;
            var m21 = b.m21 * a.m11 + b.m22 * a.m21 + b.m23 * a.m31 + b.m24 * a.m41;
            var m22 = b.m21 * a.m12 + b.m22 * a.m22 + b.m23 * a.m32 + b.m24 * a.m42;
            var m23 = b.m21 * a.m13 + b.m22 * a.m23 + b.m23 * a.m33 + b.m24 * a.m43;
            var m24 = b.m21 * a.m14 + b.m22 * a.m24 + b.m23 * a.m34 + b.m24 * a.m44;
            var m31 = b.m31 * a.m11 + b.m32 * a.m21 + b.m33 * a.m31 + b.m34 * a.m41;
            var m32 = b.m31 * a.m12 + b.m32 * a.m22 + b.m33 * a.m32 + b.m34 * a.m42;
            var m33 = b.m31 * a.m13 + b.m32 * a.m23 + b.m33 * a.m33 + b.m34 * a.m43;
            var m34 = b.m31 * a.m14 + b.m32 * a.m24 + b.m33 * a.m34 + b.m34 * a.m44;
            var m41 = b.m41 * a.m11 + b.m42 * a.m21 + b.m43 * a.m31 + b.m44 * a.m41;
            var m42 = b.m41 * a.m12 + b.m42 * a.m22 + b.m43 * a.m32 + b.m44 * a.m42;
            var m43 = b.m41 * a.m13 + b.m42 * a.m23 + b.m43 * a.m33 + b.m44 * a.m43;
            var m44 = b.m41 * a.m14 + b.m42 * a.m24 + b.m43 * a.m34 + b.m44 * a.m44;
            
            ret.m11 = m11;
            ret.m12 = m12;
            ret.m13 = m13;
            ret.m14 = m14;
            ret.m21 = m21;
            ret.m22 = m22;
            ret.m23 = m23;
            ret.m24 = m24;
            ret.m31 = m31;
            ret.m32 = m32;
            ret.m33 = m33;
            ret.m34 = m34;
            ret.m41 = m41;
            ret.m42 = m42;
            ret.m43 = m43;
            ret.m44 = m44;
            
            return ret;
        }
    }
}