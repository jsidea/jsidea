namespace jsidea.layout.MoveMode {
    class BorderBottomRightOuter implements IMoveMode {
        public willChange: string = "contents";
        private _size: Box = Box.create();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var bs = this._size;
            bs.update(element, style);

            //if horizontal border increases inside
            if (style.boxSizing == "border-box" || (style.left != "auto" && style.right != "auto"))
                offset.x = bs.borderRight;
            else
                offset.x += bs.borderRight;

            //if vertical border increases inside
            if (style.boxSizing == "border-box" || (style.top != "auto" && style.bottom != "auto"))
                offset.y = bs.borderBottom;
            else
                offset.y += bs.borderBottom;

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            this._size.update(element, style);
            var right = isNaN(point.x) ? this._size.borderRight : Math.round(point.x);
            var bottom = isNaN(point.y) ? this._size.borderBottom : Math.round(point.y);
            element.style.borderWidth = this._size.borderTop + "px " + right + "px " + bottom + "px " + this._size.borderLeft + "px";
        }

        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            point.x = Math.max(point.x, 0);
            point.y = Math.max(point.y, 0);
        }
    }

    export var BORDER_BOTTOM_RIGHT_OUTER: IMoveMode = new BorderBottomRightOuter();
}