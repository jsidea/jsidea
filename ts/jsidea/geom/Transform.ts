module jsidea.geom {
    export class Transform {

        public static MODE_PERSPECTIVE: string = "perspective";
        public static MODE_TRANSFORM: string = "transform";
        public static MODE_BOX: string = "box";
        public static MODE_AUTO: string = "auto";

        private static _lookup = new model.Dictonary<HTMLElement, { mode: string; bounds: geom.Box2D }>();

        public element: HTMLElement;
        public toBox: string = layout.BoxModel.BORDER;
        public fromBox: string = layout.BoxModel.BORDER;
        public matrix: geom.Matrix3D = new geom.Matrix3D();
        public sceneTransform: geom.Matrix3D[] = [];
        public inverseSceneTransform: geom.Matrix3D[] = [];
        public box: layout.BoxModel = new layout.BoxModel();
        //        public chain: layout.StyleChain;

        constructor(element: HTMLElement = null, mode: string = Transform.MODE_AUTO) {
            if (element)
                this.update(element, mode);
        }

        public static create(element: HTMLElement, mode: string = Transform.MODE_AUTO): geom.Transform {
            return new Transform(element, mode);
        }

        public update(element: HTMLElement, mode: string = Transform.MODE_AUTO): void {
            if (!element)
                return this.clear();

            this.element = element;
            
            //FORCE FOR TESTING
            mode = Transform.MODE_PERSPECTIVE;

            var globalBounds: geom.Box2D = null;
            if (mode == Transform.MODE_AUTO) {
                var lookedUpMode = Transform._lookup.getValue(element);
                globalBounds = geom.Box2D.createBoundingBox(element);

                //just use the lookup if the element does not moved
                //in chrome/webkit you can check of exact-equality,
                //in firefox not (twipsy hipsy)
                if (lookedUpMode && globalBounds.equals(lookedUpMode.bounds, 0.3))
                    mode = lookedUpMode.mode;
                else {
                    mode = Transform.getMode(element);
                    Transform._lookup.setValue(element, { mode: mode, bounds: globalBounds });
                }
            }

            if (mode == Transform.MODE_PERSPECTIVE) {
                var node = layout.StyleChain.create(element);
                this.matrix.setCSS(node.style.transform);
                this.sceneTransform = Transform.extractAccumulatedMatrices(node);
                this.box.update(element, node.style);
            }
            //runs if there is no perspective involved
            //the elements can have 3d-transformation also
            else if (mode == Transform.MODE_TRANSFORM || mode == Transform.MODE_BOX) {
                globalBounds = globalBounds ? globalBounds : geom.Box2D.createBoundingBox(element);

                var matrix = new geom.Matrix3D();

                //skip the transformation part for non accumulated transformed
                //elements.
                //the 2d mode need the transformations matrices but not the
                //wrong offsetLeft/offsetTop values
                if (mode == Transform.MODE_TRANSFORM) {
                    var tElement = element;
                    while (tElement) {
                        var ma = geom.Matrix3D.create(tElement);
                        matrix.append(ma);
                        tElement = tElement.parentElement;
                    }

                    var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
                    
                    //if perspective of preserve-3d is on the get getBoundingClientRect
                    //we need to scale it
                    var scX = globalBounds.width / localBounds.width;
                    var scY = globalBounds.height / localBounds.height;
                    matrix.appendScaleRaw(scX, scY, 1);

                    //re-offset
                    matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
                }

                matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);

                this.sceneTransform = [matrix];

                var style = layout.Style.create(element);
                this.matrix.setCSS(style.transform);
                this.box.update(element, style);
            }

            //create inverse
            this.inverseSceneTransform = this.sceneTransform.slice(0, this.sceneTransform.length);
            var l = this.inverseSceneTransform.length;
            for (var i = 0; i < l; ++i)
                this.inverseSceneTransform[i] = this.inverseSceneTransform[i].clone().invert();
            this.inverseSceneTransform.reverse();
        }

        public clear(): void {
            this.element = null;
            this.sceneTransform = [];
            this.inverseSceneTransform = [];
            this.box.clear();
        }

        public localToLocalPoint(
            to: Transform, pt: geom.Point3D,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.localToLocal(to, pt.x, pt.y, pt.z, toBox, fromBox, ret);
        }

        public localToLocalQuad(
            to: Transform,
            quad: geom.Quad,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
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
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            var gl = this.localToGlobalPoint(ret, layout.BoxModel.BORDER, fromBox, ret);
            return to.globalToLocalPoint(gl, toBox, layout.BoxModel.BORDER, ret);
        }

        public globalToLocalPoint(
            point: geom.Point3D,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            return this.globalToLocal(point.x, point.y, point.z, toBox, fromBox, ret);
        }

        public globalToLocalQuad(
            quad: geom.Quad,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
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
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply box model transformations
            this.box.point(ret, layout.BoxModel.BORDER, fromBox == layout.BoxModel.AUTO ? this.fromBox : fromBox);
            
            //project from parent to child
            for (var i = 0; i < this.inverseSceneTransform.length; ++i)
                ret = this.inverseSceneTransform[i].unproject(ret, ret);

            //apply box model transformations
            this.box.point(ret, toBox == layout.BoxModel.AUTO ? this.toBox : toBox, layout.BoxModel.BORDER);

            return ret;
        }

        public localToGlobalPoint(
            point: geom.Point3D,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {
            return this.localToGlobal(point.x, point.y, point.z, toBox, fromBox, ret);
        }

        public localToGlobalQuad(
            quad: geom.Quad,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
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
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO,
            ret: geom.Point3D = new geom.Point3D()): jsidea.geom.Point3D {

            ret.setTo(x, y, z);
            
            //apply from-box model transformations
            this.box.point(ret, layout.BoxModel.BORDER, fromBox == layout.BoxModel.AUTO ? this.fromBox : fromBox);            
            
            //unproject from child to parent
            var l = this.sceneTransform.length;
            for (var i = 0; i < l; ++i)
                ret = this.sceneTransform[i].project(ret, ret);
            
            //apply to-box model transformations
            this.box.point(ret, toBox == layout.BoxModel.AUTO ? this.toBox : toBox, layout.BoxModel.BORDER);

            return ret;
        }

        private static getMode(element: HTMLElement): string {
            var isTransformed = false;
            while (element && element != document.body.parentElement) {
                var style = layout.Style.create(element);
                if (style.perspective != "none")// || style.transform.indexOf("matrix3d") >= 0)
                    return Transform.MODE_PERSPECTIVE;
                if (style.transform != "none")
                    isTransformed = true;
                element = element.parentElement;
            }
            return isTransformed ? Transform.MODE_TRANSFORM : Transform.MODE_BOX;
        }

        private static extractMatrix(node: layout.INode, matrix: geom.Matrix3D = null): geom.Matrix3D {
            if (!matrix)
                matrix = new geom.Matrix3D();
            if (!node)
                return matrix;

            var element: HTMLElement = node.element;
            var style: CSSStyleDeclaration = node.style;
            
            //------
            //transform
            //------
            if (node.isTransformed) {
                var origin = style.transformOrigin ? style.transformOrigin.split(" ") : "0 0";
                var originX = math.Number.parseRelation(origin[0], element.offsetWidth, 0);
                var originY = math.Number.parseRelation(origin[1], element.offsetHeight, 0);
                var originZ = math.Number.parseRelation(origin[2], 0, 0);

                //not vice versa: not adding than subtracting like some docs mentioned
                matrix.appendPositionRaw(-originX, -originY, -originZ);
                matrix.appendCSS(style.transform);
                matrix.appendPositionRaw(originX, originY, originZ);
            }
            
            //------
            //offset
            //------
            //append the position to the transform-matrix
            //position is relative to the direct parent
            matrix.appendPositionRaw(node.position.x, node.position.y, 0);
            
            //-------
            //perspective
            //-------
            if (node.parent && node.parent.perspective) {
                var perspective = node.parent.perspective;
                var parentStyle: CSSStyleDeclaration = node.parent.style;
                var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
                var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
                var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

                matrix.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
                matrix.appendPerspective(perspective);
                matrix.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);
            }

            return matrix;
        }

        private static extractAccumulatedMatrices(node: layout.INode): geom.Matrix3D[] {
            //collect matrices up to root
            //accumulate if possible
            var matrices: geom.Matrix3D[] = [];
            var last: geom.Matrix3D = new geom.Matrix3D();
            while (node) {
                //if last is not null, last becomes the base for the transformation
                //its like appending the current node.transform (parent-transform) to the last transform (child-transform)
                var m: geom.Matrix3D = this.extractMatrix(node, last);
                if (node.isAccumulatable) {
                    last = m;
                }
                else {
                    last = null;
                    matrices.push(m);
                }
                if (node && node.isSticked) {
                    break;
                }
                node = node.parent;
            }
            if (last && matrices.indexOf(last) < 0)
                matrices.push(last);
            return matrices;
        }

        public static qualifiedClassName: string = "jsidea.geom.Transform";
        public toString(): string {
            return "[" + Transform.qualifiedClassName + "]";
        }
    }
}