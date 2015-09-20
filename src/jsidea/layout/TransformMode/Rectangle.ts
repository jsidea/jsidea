module jsidea.layout.TransformMode {
    class Rectangle implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D {
            var element = transform.element;
            var globalBounds = geom.Rect2D.getBounds(element);
            var m = new geom.Matrix3D();
            m.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return m;
        }
    }

    export var RECTANGLE: ITransformMode = new Rectangle();
}