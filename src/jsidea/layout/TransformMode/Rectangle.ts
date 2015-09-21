module jsidea.layout.TransformMode {
    class Rectangle implements ITransformMode {
        public extract(transform: Transform, matrix: geom.Matrix3D): void {
            var globalBounds = geom.Rect2D.getBounds(transform.element);
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
        }
    }

    export var RECTANGLE: ITransformMode = new Rectangle();
}