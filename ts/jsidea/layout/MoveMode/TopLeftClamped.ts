module jsidea.layout.MoveMode {
   class TopLeftClamped implements IMoveMode {
        public willChange: string = "top, left";
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var offsetX = offset.x;
            var offsetY = offset.y;
            MoveMode.TOP_LEFT.transform(offset, element, style);

            var rightAuto = style.right == "auto";
            var minWidth = math.Number.parse(style.minWidth, 0);
            if (!rightAuto) {
                var newWidth = element.clientWidth - offsetX;
                if (newWidth < minWidth)
                    offset.x += newWidth - minWidth;
            }

            var bottomAuto = style.bottom == "auto";
            var minHeight = math.Number.parse(style.minHeight, 0);
            if (!bottomAuto) {
                var newHeight = element.clientHeight - offsetY;
                if (newHeight < minHeight)
                    offset.y += newHeight - minHeight;
            }

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply TopLeftModeClamped to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.left = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.top = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }
    
   export var TOP_LEFT_CLAMPED: IMoveMode = new TopLeftClamped();
}