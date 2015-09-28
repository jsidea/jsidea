namespace jsidea.layout.TransformMode {
    class Perspective implements ITransformMode {
        private static _matrix: geom.Matrix3D = new geom.Matrix3D();
        public extract(transform: Transform, matrix: geom.Matrix3D): void {
            var element = transform.element;
            var node = layout.StyleNode.create(element);
            
            //accumulate matrix
            while (node) {
                this.extractMatrix(node, matrix);
                if (node && node.isSticked)
                    break;
                node = node.parent;
            }
        }

        private extractMatrix(node: layout.IStyleNode, matrix: geom.Matrix3D = null): geom.Matrix3D {
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
                var originZ = math.Number.parse(origin[2], 0);

                matrix.appendPositionRaw(-originX, -originY, -originZ);
                //if the parent is flattened (not preserve-3d) 
                //then just reduce it to the 2D-plane
                matrix.appendCSS(style.transform, node.isForced2D);
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

    export var PERSPECTIVE: ITransformMode = new Perspective();
}