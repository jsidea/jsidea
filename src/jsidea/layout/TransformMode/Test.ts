module jsidea.layout.TransformMode {
    class Test implements ITransformMode {
        public extract(transform: Transform, style: CSSStyleDeclaration): geom.Matrix3D {
            var element = transform.element;
            var globalBounds = geom.Rect2D.getBounds(element);
            var m = new geom.Matrix3D();
            while (element) {
                m.append(geom.Matrix3D.create(element));
                element = element.parentElement;
            }
            
            //if perspective of preserve-3d is on the get getBoundingClientRect
            //we need to scale it
            element = transform.element;
            var localBounds = m.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            var scX = globalBounds.width / localBounds.width;
            var scY = globalBounds.height / localBounds.height;
            m.appendScaleRaw(scX, scY, 1);

            //re-offset
            element = transform.element
            var localBounds = m.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            m.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
            m.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
            return m;
        }
    }
    export var TEST: ITransformMode = new Test();
}
