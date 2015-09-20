module jsidea.layout.TransformMode {
    class Box implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D[] {
            var element = transform.element;
            var globalBounds = geom.Rect2D.getBounds(element);
            var matrix = new geom.Matrix3D();
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return [matrix];
        }
    }

    export var BOX: ITransformMode = new Box();
}