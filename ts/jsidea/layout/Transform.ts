namespace jsidea.layout {
    export class Transform {
        public element: HTMLElement = null;
        public toBox: IBoxModel = BoxModel.BORDER;
        public fromBox: IBoxModel = BoxModel.BORDER;
        public matrix: geom.Matrix3D = new geom.Matrix3D();
        public sceneTransform: geom.Matrix3D = new geom.Matrix3D();
        public inverseSceneTransform: geom.Matrix3D = new geom.Matrix3D();
        public size: Box = new Box();
        
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

            //if no mode is given, then
            //use the most lightweight mode
            mode = mode || TransformMode.RECTANGLE;
            
            //FORCE FOR TESTING
            mode = TransformMode.PERSPECTIVE;

            var style = window.getComputedStyle(element);
            this.size.update(element, style);
            this.matrix.setCSS(style.transform);
            this.sceneTransform.identity();
            mode.extract(this, this.sceneTransform);
            this.sceneTransform.invert(this.inverseSceneTransform);

            return this;
        }

        public append(matrix: geom.Matrix3D): Transform {
            matrix = matrix.clone();

            this.matrix.append(matrix);
            this.sceneTransform.append(matrix);
            this.sceneTransform.invert(this.inverseSceneTransform);

            return this;
        }

        public prepend(matrix: geom.Matrix3D): Transform {
            matrix = matrix.clone();

            this.matrix.prepend(matrix);
            this.sceneTransform.prepend(matrix);
            this.sceneTransform.invert(this.inverseSceneTransform);

            return this;
        }

        public clear(): Transform {
            this.element = null;
            this.size.clear();
            this.matrix.identity();

            return this;
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
            var gl = this.localToGlobalPoint(ret, fromBox, BoxModel.BORDER, ret);
            return to.globalToLocalPoint(gl, BoxModel.BORDER, toBox, ret);
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
            this.size.transform(ret, fromBox || this.fromBox, BoxModel.BORDER);
            
            //unproject from parent to child
            this.inverseSceneTransform.unproject(ret, ret);

            //apply box model transformations
            this.size.transform(ret, BoxModel.BORDER, toBox || this.toBox);

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
            this.size.transform(ret, fromBox || this.fromBox, BoxModel.BORDER);            
            
            //project from child to parent
            this.sceneTransform.project(ret, ret);
            
            //apply to-box model transformations
            this.size.transform(ret, BoxModel.BORDER, toBox || this.toBox);

            return ret;
        }

        public dispose(): void {
            this.element = null;
            this.toBox = null;
            this.fromBox = null;
            this.matrix = null;
            this.size = null;
            this.sceneTransform = null;
            this.inverseSceneTransform = null;
        }
    }
}