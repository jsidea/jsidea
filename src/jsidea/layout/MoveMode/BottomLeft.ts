namespace jsidea.layout.MoveMode {
    class BottomLeft implements IMoveMode {
        public willChange: string = "bottom, left";
        public invertX: boolean = false;
        public invertY: boolean = true;
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var bottom = MoveMode.BOTTOM_RIGHT.transform(offset.clone(), element, style);
            var left = MoveMode.TOP_LEFT.transform(offset.clone(), element, style);
            return offset.setTo(left.x, bottom.y, offset.z);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply BottomLeftMode to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.left = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.bottom = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
    export var BOTTOM_LEFT: IMoveMode = new BottomLeft();
}