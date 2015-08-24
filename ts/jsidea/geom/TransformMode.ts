module jsidea.geom {
    export interface ITransformMode {
        extract(element: Transform, style: CSSStyleDeclaration): geom.Matrix3D[];
    }
    class ModeTransformedZoom implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var globalBounds = geom.Box2D.createBoundingBox(element);
            var matrix = new geom.Matrix3D();
            while (element) {
                var ma = geom.Matrix3D.create(element);
                matrix.append(ma);
                element = element.parentElement;
            }
                    
            //if perspective of preserve-3d is on the get getBoundingClientRect
            //we need to scale it
            element = transform.element;
            var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            var scX = globalBounds.width / localBounds.width;
            var scY = globalBounds.height / localBounds.height;
            matrix.appendScaleRaw(scX, scY, 1);

            //re-offset
            matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return [matrix];
        }
    }
    class ModeTransformed implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var globalBounds = geom.Box2D.createBoundingBox(element);
            var matrix = new geom.Matrix3D();
            while (element) {
                matrix.append(geom.Matrix3D.create(element));
                element = element.parentElement;
            }

            //re-offset
            element = transform.element
            var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return [matrix];
        }
    }
    class ModeBox implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var globalBounds = geom.Box2D.createBoundingBox(element);
            var matrix = new geom.Matrix3D();
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return [matrix];
        }
    }
    class ModePerspective implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var node = layout.StyleChain.create(element);
            return ModePerspective.extractAccumulatedMatrices(node);
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

        private static extractMatrix(node: layout.INode, matrix: geom.Matrix3D = null): geom.Matrix3D {
            if (!matrix)
                matrix = new geom.Matrix3D();
            if (!node)
                return matrix;

            var element: HTMLElement = node.element;
            var style: CSSStyleDeclaration = node.style;
            
            //------
            //transform (including transformOrigin)
            //------
            if (node.isTransformed) {
                var origin = style.transformOrigin ? style.transformOrigin.split(" ") : [];
                var originX = math.Number.relation(origin[0], element.offsetWidth, element.offsetWidth * 0.5);
                var originY = math.Number.relation(origin[1], element.offsetHeight, element.offsetHeight * 0.5);
                var originZ = math.Number.relation(origin[2], 0, 0);

                //not vice versa: not adding than subtracting like some docs mentioned
                matrix.appendPositionRaw(-originX, -originY, -originZ);
                matrix.appendCSS(style.transform);
                matrix.appendPositionRaw(originX, originY, originZ);
            }
            
            //------
            //local position
            //------
            //append the position to the transform-matrix
            //position is relative to the direct parent
            //not the offsetParent
            matrix.appendPositionRaw(node.position.x, node.position.y, 0);
            
            //-------
            //perspective/focalLength/nearFarDistance/frustumLength or whatever you wanna call it
            //-------
            if (node.parent && node.parent.perspective) {
                var perspective = node.parent.perspective;
                var parentStyle: CSSStyleDeclaration = node.parent.style;
                var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
                var perspectiveOriginX = math.Number.relation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
                var perspectiveOriginY = math.Number.relation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

                matrix.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
                matrix.appendPerspective(perspective);
                matrix.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);
            }

            return matrix;
        }
    }
    export class TransformMode {
        public static PERSPECTIVE: ITransformMode = new ModePerspective();
        public static TRANSFORM: ITransformMode = new ModeTransformed();
        public static TRANSFORM_ZOOM: ITransformMode = new ModeTransformedZoom();
        public static BOX: ITransformMode = new ModeBox();
    }
}