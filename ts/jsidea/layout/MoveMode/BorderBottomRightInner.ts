namespace jsidea.layout.MoveMode {
    class BorderBottomRightInner implements IMoveMode {
        public boxModel: IBoxModel = BoxModel.BORDER;
        public willChange: string = "contents";
        private _size: Box = Box.create();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var bs = this._size;
            bs.update(element, style);

            //if horizontal border increases inside
            if (style.boxSizing == "border-box" || (style.right != "auto" && style.right != "auto")) {
                offset.x *= -1;
                offset.x += bs.borderRight;
            }
            else {
                offset.x = bs.borderRight;
            }

            //if vertical border increases inside
            if (style.boxSizing == "border-box" || (style.top != "auto" && style.bottom != "auto")) {
                offset.y *= -1;
                offset.y += bs.borderBottom;
            }
            else {
                offset.y = bs.borderBottom;
            }

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            this._size.update(element, style);
            var right = isNaN(point.x) ? this._size.borderRight : Math.round(point.x);
            var bottom = isNaN(point.y) ? this._size.borderBottom : Math.round(point.y);
            element.style.borderWidth = this._size.borderTop + "px " + right + "px " + bottom + "px " + this._size.borderLeft + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            var bs = this._size;
            bs.update(element, style);
            //if horizontal border increases inside
            if (style.boxSizing == "border-box" || (style.left != "auto" && style.right != "auto")) {
                point.x = Math.max(point.x, 0);
                var minWidth = math.Number.parse(style.minWidth, 0);
                var maxX = bs.offsetWidth - (bs.borderLeft + bs.paddingLeft + bs.paddingRight) - minWidth;
                point.x = Math.min(maxX, point.x);
            }
            else {
                point.x = bs.borderRight;
            }

            //if vertical border increases inside
            if (style.boxSizing == "border-box" || (style.top != "auto" && style.bottom != "auto")) {
                //clamp
                point.y = Math.max(point.y, 0);
                var minHeight = math.Number.parse(style.minHeight, 0);
                var maxY = bs.offsetHeight - (bs.borderTop + bs.paddingTop + bs.paddingBottom) - minHeight;
                point.y = Math.min(maxY, point.y);
            }
            else {
                point.y = bs.borderBottom;
            }
        }
    }

    export var BORDER_BOTTOM_RIGHT_INNER: IMoveMode = new BorderBottomRightInner();
}