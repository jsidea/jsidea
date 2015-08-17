module jsidea.geom {
    export class Transform {
        public element: HTMLElement;
        public toBox: layout.IBoxModel = layout.BoxModel.BORDER;
        public fromBox: layout.IBoxModel = layout.BoxModel.BORDER;
        public matrix: geom.Matrix3D = new geom.Matrix3D();
        public boxSizing: layout.BoxSizing = new layout.BoxSizing();
        
        private _sceneTransform: geom.Matrix3D[] = [];
        private _inverseSceneTransform: geom.Matrix3D[] = [];

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
            this._sceneTransform = mode.extract(this, style);

            //create inverse
            this._inverseSceneTransform = this._sceneTransform.slice(0, this._sceneTransform.length).reverse();
            for (var i = 0; i < this._inverseSceneTransform.length; ++i)
                this._inverseSceneTransform[i] = this._inverseSceneTransform[i].clone().invert();
        }

        public clear(): void {
            this.element = null;
            this._sceneTransform = [];
            this._inverseSceneTransform = [];
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
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

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
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.localToLocal(to, pt.x, pt.y, pt.z, fromBox, toBox, ret);
        }

        public localToLocalQuadY(
            to: Transform,
            quad: geom.Quad,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.localToLocalPoint(to, quad.a, fromBox, toBox, ret.a);
            this.localToLocalPoint(to, quad.b, fromBox, toBox, ret.b);
            this.localToLocalPoint(to, quad.c, fromBox, toBox, ret.c);
            this.localToLocalPoint(to, quad.d, fromBox, toBox, ret.d);
            return ret;
        }

        public localToLocal(
            to: Transform,
            x: number,
            y: number,
            z: number = 0,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            var gl = this.localToGlobalPoint(ret, fromBox, layout.BoxModel.BORDER, ret);
            return to.globalToLocalPoint(gl, layout.BoxModel.BORDER, toBox, ret);
        }

        public globalToLocalPoint(
            point: geom.Point3D,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.globalToLocal(point.x, point.y, point.z, fromBox, toBox, ret);
        }

        public globalToLocalQuad(
            quad: geom.Quad,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {

            this.globalToLocalPoint(quad.a, fromBox, toBox, ret.a);
            this.globalToLocalPoint(quad.b, fromBox, toBox, ret.b);
            this.globalToLocalPoint(quad.c, fromBox, toBox, ret.c);
            this.globalToLocalPoint(quad.d, fromBox, toBox, ret.d);
            return ret;
        }

        public globalToLocal(
            x: number,
            y: number,
            z: number = 0,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply box model transformations
            this.boxSizing.point(ret, fromBox || this.fromBox, layout.BoxModel.BORDER);
            
            //unproject from parent to child
            for (var i = 0; i < this._inverseSceneTransform.length; ++i)
                ret = this._inverseSceneTransform[i].unproject(ret, ret);

            //apply box model transformations
            this.boxSizing.point(ret, layout.BoxModel.BORDER, toBox || this.toBox);

            return ret;
        }

        public localToGlobalPoint(
            point: geom.Point3D,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.localToGlobal(point.x, point.y, point.z, fromBox, toBox, ret);
        }

        public localToGlobalQuad(
            quad: geom.Quad,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Quad = new geom.Quad()): geom.Quad {
            this.localToGlobalPoint(quad.a, fromBox, toBox, ret.a);
            this.localToGlobalPoint(quad.b, fromBox, toBox, ret.b);
            this.localToGlobalPoint(quad.c, fromBox, toBox, ret.c);
            this.localToGlobalPoint(quad.d, fromBox, toBox, ret.d);
            return ret;
        }

        public localToGlobal(
            x: number,
            y: number,
            z: number = 0,
            fromBox?: layout.IBoxModel,
            toBox?: layout.IBoxModel,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply from-box model transformations
            this.boxSizing.point(ret, fromBox || this.fromBox, layout.BoxModel.BORDER);            
            
            //project from child to parent
            var l = this._sceneTransform.length;
            for (var i = 0; i < l; ++i)
                ret = this._sceneTransform[i].project(ret, ret);
            
            //apply to-box model transformations
            this.boxSizing.point(ret, layout.BoxModel.BORDER, toBox || this.toBox);

            return ret;
        }

        public static qualifiedClassName: string = "jsidea.geom.Transform";
        public toString(): string {
            return "[" + Transform.qualifiedClassName + "]";
        }
    }
}