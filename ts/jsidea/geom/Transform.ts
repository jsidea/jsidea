module jsidea.geom {
    export class Transform {
        public element: HTMLElement;
        public toBox: layout.IBoxModel = layout.BoxModel.BORDER;
        public fromBox: layout.IBoxModel = layout.BoxModel.BORDER;
        public matrix: geom.Matrix3D = new geom.Matrix3D();
        public sceneTransform: geom.Matrix3D[] = [];
        public inverseSceneTransform: geom.Matrix3D[] = [];
        public boxSizing: layout.BoxSizing = new layout.BoxSizing();

        constructor(element?: HTMLElement, mode?: ITransformMode) {
            if (element)
                this.update(element, mode);
        }

        public static create(element?: HTMLElement, mode?: ITransformMode): geom.Transform {
            return new Transform(element, mode);
        }

        public update(element?: HTMLElement, mode?: ITransformMode): void {
            if (!element)
                return this.clear();

            this.element = element;

            //use the most lightweight mode
            //if no mode is given
            mode = mode || TransformMode.BOX;
            
            //FORCE FOR TESTING
            mode = TransformMode.PERSPECTIVE;

            var style = layout.Style.create(element);
            this.boxSizing.update(element, style);
            this.matrix.setCSS(style.transform);
            this.sceneTransform = mode.extract(this, style);

            //create inverse
            this.inverseSceneTransform = this.sceneTransform.slice(0, this.sceneTransform.length).reverse();
            for (var i = 0; i < this.inverseSceneTransform.length; ++i)
                this.inverseSceneTransform[i] = this.inverseSceneTransform[i].clone().invert();
        }

        public clear(): void {
            this.element = null;
            this.sceneTransform = [];
            this.inverseSceneTransform = [];
            this.boxSizing.clear();
            this.matrix.identity();
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
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            var lc = this.localToLocal(to, pt.x + offsetX, pt.y + offsetY, pt.z, fromBox, toBox, ret);
            lc.x = math.Number.clamp(lc.x, minX, maxX);
            lc.y = math.Number.clamp(lc.y, minY, maxY);
            lc = to.localToLocalPoint(this, lc, toBox, fromBox);
            lc.z = pt.z;
            lc.x -= offsetX;
            lc.y -= offsetY;
            return lc;
        }

        public localToLocalPoint(
            to: Transform,
            pt: geom.Point3D,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.localToLocal(to, pt.x, pt.y, pt.z, toBox, fromBox, ret);
        }

        public localToLocalQuad(
            to: Transform,
            quad: geom.Quad,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.localToLocalPoint(to, quad.a, toBox, fromBox, ret.a);
            this.localToLocalPoint(to, quad.b, toBox, fromBox, ret.b);
            this.localToLocalPoint(to, quad.c, toBox, fromBox, ret.c);
            this.localToLocalPoint(to, quad.d, toBox, fromBox, ret.d);
            return ret;
        }

        public localToLocal(
            to: Transform,
            x: number,
            y: number,
            z: number = 0,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            var gl = this.localToGlobalPoint(ret, layout.BoxModel.BORDER, fromBox, ret);
            return to.globalToLocalPoint(gl, toBox, layout.BoxModel.BORDER, ret);
        }

        public globalToLocalPoint(
            point: geom.Point3D,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.globalToLocal(point.x, point.y, point.z, toBox, fromBox, ret);
        }

        public globalToLocalQuad(
            quad: geom.Quad,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.globalToLocalPoint(quad.a, toBox, fromBox, ret.a);
            this.globalToLocalPoint(quad.b, toBox, fromBox, ret.b);
            this.globalToLocalPoint(quad.c, toBox, fromBox, ret.c);
            this.globalToLocalPoint(quad.d, toBox, fromBox, ret.d);
            return ret;
        }

        public globalToLocal(
            x: number,
            y: number,
            z: number = 0,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply box model transformations
            this.boxSizing.point(ret, layout.BoxModel.BORDER, fromBox || this.fromBox);
            
            //unproject from parent to child
            for (var i = 0; i < this.inverseSceneTransform.length; ++i)
                ret = this.inverseSceneTransform[i].unproject(ret, ret);

            //apply box model transformations
            this.boxSizing.point(ret, toBox || this.toBox, layout.BoxModel.BORDER);

            return ret;
        }

        public localToGlobalPoint(
            point: geom.Point3D,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.localToGlobal(point.x, point.y, point.z, toBox, fromBox, ret);
        }

        public localToGlobalQuad(
            quad: geom.Quad,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {
            this.localToGlobalPoint(quad.a, toBox, fromBox, ret.a);
            this.localToGlobalPoint(quad.b, toBox, fromBox, ret.b);
            this.localToGlobalPoint(quad.c, toBox, fromBox, ret.c);
            this.localToGlobalPoint(quad.d, toBox, fromBox, ret.d);
            return ret;
        }

        public localToGlobal(
            x: number,
            y: number,
            z: number = 0,
            toBox?: layout.IBoxModel,
            fromBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply from-box model transformations
            this.boxSizing.point(ret, layout.BoxModel.BORDER, fromBox || this.fromBox);            
            
            //project from child to parent
            var l = this.sceneTransform.length;
            for (var i = 0; i < l; ++i)
                ret = this.sceneTransform[i].project(ret, ret);
            
            //apply to-box model transformations
            this.boxSizing.point(ret, toBox || this.toBox, layout.BoxModel.BORDER);

            return ret;
        }

        public static qualifiedClassName: string = "jsidea.geom.Transform";
        public toString(): string {
            return "[" + Transform.qualifiedClassName + "]";
        }
    }
}