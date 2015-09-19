module jsidea.layout.MoveMode {
    class TopRight implements IMoveMode {
        public willChange: string = "top, right";
        public invertX: boolean = true;
        public invertY: boolean = false;
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var top = MoveMode.TOP_LEFT.transform(offset.clone(), element, style);
            var right = MoveMode.BOTTOM_RIGHT.transform(offset.clone(), element, style);
            return offset.setTo(right.x, top.y, offset.z);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply TopRightMode to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.right = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.top = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
    export var TOP_RIGHT: IMoveMode = new TopRight();
}