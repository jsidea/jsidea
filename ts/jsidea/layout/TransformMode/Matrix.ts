module jsidea.layout.TransformMode {
    class Matrix implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var globalBounds = geom.Rect2D.getBounds(element);
            var matrix = new geom.Matrix3D();
            while (element) {
                matrix.append(geom.Matrix3D.create(element));
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
            element = transform.element
            //the new bounds
            var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return [matrix];
        }
    }

    export var MATRIX: ITransformMode = new Matrix();
}