module jsidea.layout {
    export interface IPosition {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;

    }
    export class Transform {
        public element: HTMLElement;
        public toBox: IBoxModel = BoxModel.BORDER;
        public fromBox: IBoxModel = BoxModel.BORDER;
        public matrix: geom.Matrix3D = new geom.Matrix3D();
        public size: Box = new Box();
        public position: IPosition = {};

        private _sceneTransform: geom.Matrix3D[] = [];
        private _inverseSceneTransform: geom.Matrix3D[] = [];

        constructor(element?: HTMLElement, mode?: ITransformMode) {
            if (element)
                this.update(element, mode);
        }

        public static create(element?: HTMLElement, mode?: ITransformMode): Transform {
            return new Transform(element, mode);
        }

        public update(element?: HTMLElement, mode?: ITransformMode): Transform {
            if (!element)
                return this.clear();

            this.element = element;

            //use the most lightweight mode
            //if no mode is given
            mode = mode || TransformMode.RECTANGLE;
            
            //FORCE FOR TESTING
            mode = TransformMode.PERSPECTIVE;

            var style = window.getComputedStyle(element);
            this.size.update(element, style);
            this.matrix.setCSS(style.transform);
            this._sceneTransform = mode.extract(this, style);

            //create inverse
            this._inverseSceneTransform = this._sceneTransform.slice(0, this._sceneTransform.length).reverse();
            for (var i = 0; i < this._inverseSceneTransform.length; ++i)
                this._inverseSceneTransform[i] = this._inverseSceneTransform[i].clone().invert();

            return this;
        }

        public append(matrix: geom.Matrix3D): Transform {
            matrix = matrix.clone();

            this.matrix.append(matrix);
            this._sceneTransform[0].append(matrix);
            this._inverseSceneTransform[this._sceneTransform.length - 1] = this._sceneTransform[0].clone().invert();

            return this;
        }

        public prepend(matrix: geom.Matrix3D): Transform {
            matrix = matrix.clone();

            this.matrix.prepend(matrix);
            this._sceneTransform[0].prepend(matrix);
            this._inverseSceneTransform[this._sceneTransform.length - 1] = this._sceneTransform[0].clone().invert();

            return this;
        }

        public clear(): Transform {
            this.element = null;
            this._sceneTransform = [];
            this._inverseSceneTransform = [];
            this.size.clear();
            this.matrix.identity();

            return this;
        }

        public clamp(
            to: Transform,
            pt: geom.Point3D,
            offsetX: number,
            offsetY: number,
            minX: number,
            maxX: number,
            minY: number,
            maxY: number,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            var lc = this.localToLocal(to, pt.x + offsetX, pt.y + offsetY, pt.z, toBox, fromBox, ret);
            lc.x = math.Number.clamp(lc.x, minX, maxX);
            lc.y = math.Number.clamp(lc.y, minY, maxY);
            lc = to.localToLocalPoint(this, lc, fromBox, toBox);
            lc.z = pt.z;
            lc.x -= offsetX;
            lc.y -= offsetY;
            return lc;
        }

        public localToLocalPoint(
            to: Transform,
            pt: geom.Point3D,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            return this.localToLocal(to, pt.x, pt.y, pt.z, fromBox, toBox, ret);
        }

        public localToLocalQuad(
            to: Transform,
            quad: geom.Quad,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.localToLocalPoint(to, quad.p1, fromBox, toBox, ret.p1);
            this.localToLocalPoint(to, quad.p2, fromBox, toBox, ret.p2);
            this.localToLocalPoint(to, quad.p3, fromBox, toBox, ret.p3);
            this.localToLocalPoint(to, quad.p4, fromBox, toBox, ret.p4);
            return ret;
        }

        public localToLocal(
            to: Transform,
            x: number,
            y: number,
            z: number = 0,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            ret.setTo(x, y, z);
            var gl = this.localToGlobalPoint(ret, fromBox, layout.BoxModel.BORDER, ret);
            return to.globalToLocalPoint(gl, layout.BoxModel.BORDER, toBox, ret);
        }

        public globalToLocalPoint(
            point: geom.Point3D,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            return this.globalToLocal(point.x, point.y, point.z, fromBox, toBox, ret);
        }

        public globalToLocalQuad(
            quad: geom.Quad,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.globalToLocalPoint(quad.p1, fromBox, toBox, ret.p1);
            this.globalToLocalPoint(quad.p2, fromBox, toBox, ret.p2);
            this.globalToLocalPoint(quad.p3, fromBox, toBox, ret.p3);
            this.globalToLocalPoint(quad.p4, fromBox, toBox, ret.p4);
            return ret;
        }

        public globalToLocal(
            x: number,
            y: number,
            z: number = 0,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply box model transformations
            this.size.transform(ret, fromBox || this.fromBox, layout.BoxModel.BORDER);
            
            //unproject from parent to child
            for (var i = 0; i < this._inverseSceneTransform.length; ++i)
                ret = this._inverseSceneTransform[i].unproject(ret, ret);

            //apply box model transformations
            this.size.transform(ret, layout.BoxModel.BORDER, toBox || this.toBox);

            return ret;
        }

        public localToGlobalPoint(
            point: geom.Point3D,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            return this.localToGlobal(point.x, point.y, point.z, fromBox, toBox, ret);
        }

        public localToGlobalQuad(
            quad: geom.Quad,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {
            this.localToGlobalPoint(quad.p1, fromBox, toBox, ret.p1);
            this.localToGlobalPoint(quad.p2, fromBox, toBox, ret.p2);
            this.localToGlobalPoint(quad.p3, fromBox, toBox, ret.p3);
            this.localToGlobalPoint(quad.p4, fromBox, toBox, ret.p4);
            return ret;
        }

        public localToGlobal(
            x: number,
            y: number,
            z: number = 0,
            fromBox?: IBoxModel,
            toBox?: IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply from-box model transformations
            this.size.transform(ret, fromBox || this.fromBox, layout.BoxModel.BORDER);            
            
            //project from child to parent
            var l = this._sceneTransform.length;
            for (var i = 0; i < l; ++i)
                ret = this._sceneTransform[i].project(ret, ret);
            
            //apply to-box model transformations
            this.size.transform(ret, layout.BoxModel.BORDER, toBox || this.toBox);

            return ret;
        }

        public dispose(): void {
            this.element = null;
            this.toBox = null;
            this.fromBox = null;
            this.matrix = null;
            this.size = null;
            this._sceneTransform = null;
            this._inverseSceneTransform = null;
        }

        public static qualifiedClassName: string = "jsidea.geom.Transform";
        public toString(): string {
            return "[" + Transform.qualifiedClassName + "]";
        }
    }
}