module jsidea.geom {
    export class Transform {

        public static MODE_3D: string = "3d";
        public static MODE_2D: string = "2d";
        public static MODE_BOX: string = "box";
        public static MODE_AUTO: string = "auto";

        private static _lookup = new model.Dictonary<HTMLElement, { mode: string; bounds: geom.Box2D }>();

        public toBox: string = geom.BoxModel.BORDER;
        public fromBox: string = geom.BoxModel.BORDER;

        private _matrices: geom.Matrix3D[] = [];
        private _inverted: boolean = false;
        private _box: geom.BoxModel = new geom.BoxModel();

        constructor() {
        }

        public static create(element: HTMLElement): geom.Transform {
            var t = new Transform();
            t.update(element);
            return t;
        }

        public clear(): void {
            this._matrices = [];
            this._inverted = false;
            this._box.clear();
        }

        public update(element: HTMLElement, mode: string = Transform.MODE_AUTO): void {
            if (!element)
                return this.clear();

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
                this._inverted = false;
                var styles = layout.StyleChain.create(element);
                this._matrices = Transform.extractAccumulatedMatrices(styles.node);
                this._box.parse(element, styles.node.style);
            }
            //runs if there is now perspective involved
            //the elements can have 3d-transformations also
            else if (mode == Transform.MODE_2D || mode == Transform.MODE_BOX) {
                this._inverted = false;

                var style = window.getComputedStyle(element);
                globalBounds = globalBounds ? globalBounds : geom.Box2D.createBoundingBox(element);

                var matrix = new geom.Matrix3D();

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
                this._matrices = [matrix];
                this._box.parse(element, style);
            }
        }

        private invert(): void {
            this._inverted = !this._inverted;
            this._matrices.reverse();
            var l = this._matrices.length;
            for (var i = 0; i < l; ++i)
                this._matrices[i].invert();
        }

        public localToLocalPoint(to: HTMLElement, pt: geom.Point3D, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.localToLocal(to, pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public localToLocal(to: HTMLElement, x: number, y: number, z: number = 0, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            //check if to contains element
            //check if element contains to
            //if so shorten the way here
            var gl = this.localToGlobal(x, y, z, geom.BoxModel.BORDER, fromBox);
            return Transform.create(to).globalToLocalPoint(gl, toBox, geom.BoxModel.BORDER);
        }

        public globalToLocalPoint(pt: geom.Point3D, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.globalToLocal(pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public globalToLocal(x: number, y: number, z: number = 0, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            //we need the globalToLocal matrices
            if (!this._inverted)
                this.invert();
            
            //apply box model transformations
            if (toBox == geom.BoxModel.AUTO)
                toBox = this.toBox;
            if (fromBox == geom.BoxModel.AUTO)
                fromBox = this.fromBox;
            this._box.point(pt, geom.BoxModel.BORDER, fromBox);
            
            //project from parent to child
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].unproject(pt, pt);

            //apply box model transformations
            this._box.point(pt, toBox, geom.BoxModel.BORDER);

            return pt;
        }

        public localToGlobalPoint(pt: geom.Point3D, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            return this.localToGlobal(pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public localToGlobal(x: number, y: number, z: number = 0, toBox: string = geom.BoxModel.AUTO, fromBox: string = geom.BoxModel.AUTO): jsidea.geom.Point3D {
            //we need the localToGlobal matrices
            if (this._inverted)
                this.invert();

            var pt = new geom.Point3D(x, y, z);
            
            //apply box model transformations
            if (toBox == geom.BoxModel.AUTO)
                toBox = this.toBox;
            if (fromBox == geom.BoxModel.AUTO)
                fromBox = this.fromBox;
            this._box.point(pt, geom.BoxModel.BORDER, fromBox);            
            
            //unproject from child to parent
            var matrices: geom.Matrix3D[] = this._matrices;
            var l = matrices.length;
            for (var i = 0; i < l; ++i)
                pt = matrices[i].project(pt, pt);
            
            //apply box model transformations
            this._box.point(pt, toBox, geom.BoxModel.BORDER);

            return pt;
        }

        private static getMode(element: HTMLElement): string {
            var isTransformed = false;
            while (element && element != document.body.parentElement) {
                var style = window.getComputedStyle(element);
                if (style.perspective != "none")
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
            var parentStyle: CSSStyleDeclaration = node.parent.style;
            
            //------
            //transform
            //------
            var origin = style.transformOrigin.split(" ");
            var originX = math.Number.parseRelation(origin[0], element.offsetWidth, 0);
            var originY = math.Number.parseRelation(origin[1], element.offsetHeight, 0);
            var originZ = math.Number.parseRelation(origin[2], 0, 0);

            matrix.appendPositionRaw(-originX, -originY, -originZ);
            matrix.appendCSS(style.transform);
            matrix.appendPositionRaw(originX, originY, originZ);
            
            //------
            //offset
            //------
            var position = node.position;//

            //append the offset to the transform-matrix
            matrix.appendPositionRaw(position.x, position.y, 0);
            
            //-------
            //perspective
            //-------
            var perspective = node.parent.perspective;
            if (!perspective)
                return matrix;

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
            while (node.parent) {
                
                //if last is not null, last becomes the base for the transformation
                //its like appending the current node.transform (parent-transform) to the last transform (child-transform)
                var m: geom.Matrix3D = this.extractMatrix(node, last);
                if (node.parent && node.isAccumulatable) {
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
    }
}