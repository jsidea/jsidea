module jsidea.layout.MoveMode {
    class MarginBottomRight implements IMoveMode {
        public willChange: string = "auto";
        public invertX: boolean = true;
        public invertY: boolean = true;
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var rightAuto = style.marginRight == "auto";
            var bottomAuto = style.marginBottom == "auto";

            offset.x *= -1;
            offset.y *= -1;

            if (rightAuto || bottomAuto) {
                //TODO: implement retrieval of the margin values
            }
            else
                offset.add(
                    math.Number.parse(style.marginRight, 0),
                    math.Number.parse(style.marginBottom, 0),
                    0);

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (!isNaN(point.x))
                element.style.marginRight = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.marginBottom = Math.round(point.y) + "px";
        }

        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }

    export var MARGIN_BOTTOM_RIGHT: IMoveMode = new MarginBottomRight();
}