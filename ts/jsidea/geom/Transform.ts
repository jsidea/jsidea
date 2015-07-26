module jsidea.geom {
    export class Transform {

        public static MODE_3D: string = "3d";
        public static MODE_2D: string = "2d";
        public static MODE_BOX: string = "box";
        public static MODE_AUTO: string = "auto";

        private static _lookup = new model.Dictonary<HTMLElement, { mode: string; bounds: geom.Box2D }>();

        public element: HTMLElement;
        public toBox: string = layout.BoxModel.BORDER;
        public fromBox: string = layout.BoxModel.BORDER;
        public sceneTransform: geom.Matrix3D[] = [];
        public inverseSceneTransform: geom.Matrix3D[] = [];
        public box: layout.BoxModel = new layout.BoxModel();

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
            mode = Transform.MODE_3D;

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

            if (mode == Transform.MODE_3D) {
                var styles = layout.StyleChain.create(element);
                this.sceneTransform = Transform.extractAccumulatedMatrices(styles.node);
                this.box.update(element, styles.node.style);
            }
            //runs if there is no perspective involved
            //the elements can have 3d-transformation also
            else if (mode == Transform.MODE_2D || mode == Transform.MODE_BOX) {
                var style = window.getComputedStyle(element);
                globalBounds = globalBounds ? globalBounds : geom.Box2D.createBoundingBox(element);

                var matrix = new geom.Matrix3D();

                //skip the transformation part for non accumulated transformed
                //elements.
                //the 2d mode need the transformations matrices but not the
                //wrong offsetLeft/offsetTop values
                if (mode == Transform.MODE_2D) {
                    var tElement = element;
                    while (tElement && tElement != document.body.parentElement) {
                        matrix.append(geom.Matrix3D.create(tElement));
                        tElement = tElement.parentElement;
                    }
                    var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
                    matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
                }

                matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);

                this.sceneTransform = [matrix];

                this.box.update(element, style);
            }

            //create inverse
            this.inverseSceneTransform = this.sceneTransform.slice(0, this.sceneTransform.length);
            for (var i = 0; i < this.inverseSceneTransform.length; ++i) {
                var cl = this.inverseSceneTransform[i].clone();
                cl.invert();
                this.inverseSceneTransform[i] = cl;
            }
            this.inverseSceneTransform.reverse();
        }

        public clear(): void {
            this.element = null;
            this.sceneTransform = [];
            this.inverseSceneTransform = [];
            this.box.clear();
        }

        public localToLocalElement(to: HTMLElement, x: number, y: number, z: number = 0, toBox: string = layout.BoxModel.AUTO, fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.localToLocal(Transform.create(to), x, y, z, toBox, fromBox);
        }

        public localToLocalPoint(to: Transform, pt: geom.Point3D, toBox: string = layout.BoxModel.AUTO, fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.localToLocal(to, pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public localToLocal(to: Transform, x: number, y: number, z: number = 0, toBox: string = layout.BoxModel.AUTO, fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            var gl = this.localToGlobal(x, y, z, layout.BoxModel.BORDER, fromBox);
            return to.globalToLocalPoint(gl, toBox, layout.BoxModel.BORDER);
        }

        public globalToLocalPoint(
            point: geom.Point3D,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.globalToLocal(point.x, point.y, point.z, toBox, fromBox);
        }

        public globalToLocal(
            x: number,
            y: number,
            z: number = 0,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            var pt = new geom.Point3D(x, y, z);
            
            //apply box model transformations
            this.box.point(pt, layout.BoxModel.BORDER, fromBox == layout.BoxModel.AUTO ? this.fromBox : fromBox);
            
            //project from parent to child
            for (var i = 0; i < this.inverseSceneTransform.length; ++i)
                pt = this.inverseSceneTransform[i].unproject(pt, pt);

            //apply box model transformations
            this.box.point(pt, toBox == layout.BoxModel.AUTO ? this.toBox : toBox, layout.BoxModel.BORDER);

            return pt;
        }

        public localToGlobalPoint(
            point: geom.Point3D,
            toBox: string = layout.BoxModel.AUTO,
            fromBox: string = layout.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.localToGlobal(point.x, point.y, point.z, toBox, fromBox);
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
            if (l > 1)
                console.log(l);
            
            //apply to-box model transformations
            this.box.point(ret, toBox == layout.BoxModel.AUTO ? this.toBox : toBox, layout.BoxModel.BORDER);

            return ret;
        }

        private static getMode(element: HTMLElement): string {
            var isTransformed = false;
            while (element && element != document.body.parentElement) {
                var style = window.getComputedStyle(element);
                if (style.perspective != "none")// || style.transform.indexOf("matrix3d") >= 0)
                    return Transform.MODE_3D;
                if (style.transform != "none")
                    isTransformed = true;
                element = element.parentElement;
            }
            return isTransformed ? Transform.MODE_2D : Transform.MODE_BOX;
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
            var origin = style.transformOrigin.split(" ");
            var originX = math.Number.parseRelation(origin[0], element.offsetWidth, 0);
            var originY = math.Number.parseRelation(origin[1], element.offsetHeight, 0);
            var originZ = math.Number.parseRelation(origin[2], 0, 0);

            //not vice versa: not adding than subtracting like some docs mentioned
            matrix.appendPositionRaw(-originX, -originY, -originZ);
            matrix.appendCSS(style.transform);
            matrix.appendPositionRaw(originX, originY, originZ);
            
            //------
            //offset
            //------
            //append the offset to the transform-matrix
            matrix.appendPositionRaw(node.position.x, node.position.y, 0);
            
            //-------
            //perspective
            //-------
            if (!node.parent)
                return matrix;
            var perspective = node.parent.perspective;
            if (!perspective)
                return matrix;

            var parentStyle: CSSStyleDeclaration = node.parent.style;
            var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
            var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
            var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

            matrix.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
            matrix.appendPerspective(perspective);
            matrix.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);

            return matrix;
        }

        private static extractAccumulatedMatrices(node: layout.INode): geom.Matrix3D[] {
            //collect matrices up to root
            //accumulate if possible
            var matrices: geom.Matrix3D[] = [];
            var last: geom.Matrix3D = null;
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
            if (last)
                matrices.push(last);
            return matrices;
        }

        public static qualifiedClassName: string = "jsidea.geom.Transform";
        public toString(): string {
            return "[" + Transform.qualifiedClassName + "]";
        }
    }
}