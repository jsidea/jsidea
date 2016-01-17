namespace jsidea.layout.MoveMode {
     class MarginTopLeft implements IMoveMode {
        public willChange: string = "auto";
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var leftAuto = style.marginLeft == "auto";
            var topAuto = style.marginTop == "auto";
            if (leftAuto || topAuto) {
                //TODO: implement retrieval of the margin values
            }
            else
                offset.translate(
                    math.Number.parse(style.marginLeft, 0),
                    math.Number.parse(style.marginTop, 0),
                    0);

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (!isNaN(point.x))
                element.style.marginLeft = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.marginTop = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
    export var MARGIN_TOP_LEFT: IMoveMode = new MarginTopLeft();
}