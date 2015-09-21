module jsidea.layout.MoveMode {
    class Transform implements IMoveMode {
        public willChange: string = "transform";
        protected _matrix: geom.Matrix3D = new geom.Matrix3D();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            var matrix = geom.Matrix3D.create(element, style, this._matrix);

            if (!isNaN(point.x))
                matrix.m41 = point.x;
            if (!isNaN(point.y))
                matrix.m42 = point.y;
            if (!isNaN(point.z))
                matrix.m43 = point.z;

            //WebKit bug
            if (system.Engine.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
    export var TRANSFORM:IMoveMode = new Transform();
}