module jsidea.layout.MoveMode {
    class BottomRight implements IMoveMode {
        public willChange: string = "bottom, right";
        public invertX: boolean = true;
        public invertY: boolean = true;
        private _size: Box = Box.create();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var offsetX = offset.x;
            var offsetY = offset.y;
            var rightAuto = style.right == "auto";
            var bottomAuto = style.bottom == "auto";
            if (rightAuto || bottomAuto) {
                MoveMode.TOP_LEFT.transform(offset, element, style);

                var parentWidth = 0;
                var parentHeight = 0;
                if (element.parentElement) {
                    parentWidth = element.parentElement.clientWidth;
                    parentHeight = element.parentElement.clientHeight;
                }

                if (style.position == "fixed") {
                    var node = layout.StyleNode.create(element);
                    if (node.isSticked) {
                        var body = element.ownerDocument.body;
                        parentWidth = body.clientWidth;
                        parentHeight = body.clientHeight;
                    }
                    this._size.update(element);
                    offset.x += this._size.marginLeft;
                    offset.y += this._size.marginTop;
                    offset.x += this._size.marginRight;
                    offset.y += this._size.marginBottom;

                    offset.x += element.offsetWidth;
                    offset.y += element.offsetHeight;
                    offset.x = parentWidth - offset.x;
                    offset.y = parentHeight - offset.y;
                }
                //if its relative the bottom/right are offset to "calced"/layout-position
                else if (style.position == "relative") {
                    offset.x = -offset.x;
                    offset.y = -offset.y;
                    return offset;
                }
                else {
                    offset.x += element.offsetWidth;
                    offset.y += element.offsetHeight;
                    offset.x = parentWidth - offset.x;
                    offset.y = parentHeight - offset.y;
                }
            }
            else {
                offset.setTo(
                    math.Number.parse(style.right, 0) - offset.x,
                    math.Number.parse(style.bottom, 0) - offset.y,
                    offset.z);
            }

            var leftAuto = style.left == "auto";
            var minWidth = math.Number.parse(style.minWidth, 0);
            if (!leftAuto) {
                var newWidth = element.clientWidth + offsetX;
                if (newWidth < minWidth)
                    offset.x += newWidth - minWidth;
            }

            var topAuto = style.top == "auto";
            var minHeight = math.Number.parse(style.minHeight, 0);
            if (!topAuto) {
                var newHeight = element.clientHeight + offsetY;
                if (newHeight < minHeight)
                    offset.y += newHeight - minHeight;
            }

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply BottomRightMode to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.right = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.bottom = Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            //            var leftAuto = style.left == "auto";
            //            var minWidth = math.Number.parse(style.minWidth, 0);
            //            if (!leftAuto) {
            //                var newWidth = element.clientWidth + offsetX;
            //                if (newWidth < minWidth)
            //                    point.x += newWidth - minWidth;
            //            }
            //
            //            var topAuto = style.top == "auto";
            //            var minHeight = math.Number.parse(style.minHeight, 0);
            //            if (!topAuto) {
            //                var newHeight = element.clientHeight + offsetY;
            //                if (newHeight < minHeight)
            //                    point.y += newHeight - minHeight;
            //            }
        }
    }
    
    export var BOTTOM_RIGHT: IMoveMode = new BottomRight();
}