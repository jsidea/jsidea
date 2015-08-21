module jsidea.layout {
    export interface IPositionMode {
        transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D;
        apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void;
    }
    class TransformMode implements IPositionMode {
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            var matrix = geom.Matrix3D.create(element);

            if (!isNaN(point.x))
                matrix.m41 = point.x;
            if (!isNaN(point.y))
                matrix.m42 = point.y;
            if (!isNaN(point.z))
                matrix.m43 = point.z;

            //WebKit bug
            if (system.Browser.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
    }
    class TopLeftMode implements IPositionMode {
        private _sizeParent: BoxSizing = new BoxSizing();
        private _size: BoxSizing = new BoxSizing();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            //!IMPORTANT: style needs to be an computed style not the element's style-property
            
            var leftAuto = style.left == "auto";
            var topAuto = style.top == "auto";
            if (leftAuto || topAuto) {
                if (system.Browser.isWebKit) {
                    var node = StyleChain.create(element);
                    var position = new geom.Point3D();
                    if (node.isRelative) {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        position.x = node.position.x - node.parent.clientLeft;
                        position.y = node.position.y - node.parent.clientTop;
                        position.x -= this._sizeParent.paddingLeft;
                        position.y -= this._sizeParent.paddingTop;
                        position.x -= this._size.marginLeft;
                        position.y -= this._size.marginTop;
                    }
                    else if (node.isSticked) {
                        //get the offset to body
                        position.x = node.offset.x;
                        position.y = node.offset.y;
                        //subtract body's margin and scroll values
                        this._size.update(node.element, node.style);
                        position.x -= element.ownerDocument.body.scrollLeft + this._size.marginLeft;
                        position.y -= element.ownerDocument.body.scrollTop + this._size.marginTop;
                    }
                    else if (node.isAbsolute) {
                        //get the offset to offsetParent
                        position.x = node.offset.x - node.offsetParent.offset.x;
                        position.y = node.offset.y - node.offsetParent.offset.y;
                        //subtract the parent's border
                        position.x -= node.parent.clientLeft;
                        position.y -= node.parent.clientTop;
                    }
                    else {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        position.x = node.position.x + this._sizeParent.paddingLeft - this._size.marginLeft;
                        position.y = node.position.y + this._sizeParent.paddingTop - this._size.marginTop;
                        this._sizeParent.point(position, BoxModel.BORDER, BoxModel.CONTENT);
                    }
                    return offset.add(
                        position.x,
                        position.y,
                        0);
                }
                //TODO: its not running fine...
                else if (system.Browser.isInternetExplorer) {
                    this._size.update(element, style);
                    var dx = element.offsetLeft;
                    var dy = element.offsetTop;
                    if (style.position == "relative") {
                        this._sizeParent.update(element.parentElement);
                        if (element.parentElement == element.ownerDocument.body) {
                            dx -= this._size.marginLeft + this._sizeParent.borderLeft;
                            dy -= this._size.marginTop + this._sizeParent.borderRight;
                        }
                        else {
                            dx -= this._size.marginLeft + this._sizeParent.paddingLeft;
                            dy -= this._size.marginTop + this._sizeParent.paddingTop;
                        }
                    }
                    else if (style.position == "fixed") {
                        this._sizeParent.update(element.ownerDocument.body);
                        dx -= this._size.marginLeft + this._sizeParent.paddingLeft;
                        dy -= this._size.marginTop + this._sizeParent.paddingTop;
                    }
                    else if (style.position == "absolute") {
                        dx -= this._size.marginLeft;
                        dy -= this._size.marginTop;
                    }
                    return offset.add(
                        math.Number.parse(style.left, dx),
                        math.Number.parse(style.top, dy),
                        0);
                }
                else if (system.Browser.isFirefox) {
                    //nice: firefox reflects the top left in any case
                    //i think this is not w3c standard but its the best solution
                }
            }

            return offset.add(
                math.Number.parse(style.left, 0),
                math.Number.parse(style.top, 0),
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply TopLeftMode to an static element.");
                return;
            }
            if (!isNaN(point.x))
                element.style.left = Math.round(point.x) + "px";
            if (!isNaN(point.y))
                element.style.top = Math.round(point.y) + "px";
        }
    }
    class TopLeftClampedMode implements IPositionMode {
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var offsetX = offset.x;
            var offsetY = offset.y;
            PositionMode.TOP_LEFT.transform(offset, element, style);

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
    }
    class BottomRightMode implements IPositionMode {
        private _size: BoxSizing = new BoxSizing();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var offsetX = offset.x;
            var offsetY = offset.y;
            var rightAuto = style.right == "auto";
            var bottomAuto = style.bottom == "auto";
            if (rightAuto || bottomAuto) {
                PositionMode.TOP_LEFT.transform(offset, element, style);

                var parentWidth = 0;
                var parentHeight = 0;
                if (element.parentElement) {
                    parentWidth = element.parentElement.clientWidth;
                    parentHeight = element.parentElement.clientHeight;
                }

                if (style.position == "fixed") {
                    var node = layout.StyleChain.create(element);
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
    }
    class BottomLeftMode implements IPositionMode {
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var bottom = PositionMode.BOTTOM_RIGHT.transform(offset.clone(), element, style);
            var left = PositionMode.TOP_LEFT.transform(offset.clone(), element, style);
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
    }
    class TopRightMode implements IPositionMode {
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var top = PositionMode.TOP_LEFT.transform(offset.clone(), element, style);
            var right = PositionMode.BOTTOM_RIGHT.transform(offset.clone(), element, style);
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
    }
    class BackgroundMode implements IPositionMode {
        private _box = new geom.Box2D();
        private _boxSizing = new BoxSizing();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var box = this._box;
            this._boxSizing.update(element, style);
            this._boxSizing.getBox(BoxModel.BACKGROUND, BoxModel.PADDING, box);
            return offset.add(
                box.x,
                box.y,
                0);
        }

        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            element.style.backgroundPosition = Math.round(point.x) + "px " + Math.round(point.y) + "px";
        }
    }
    class BorderTopLeftMode implements IPositionMode {
        private _boxSizing = new BoxSizing();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            this._boxSizing.update(element, style);
            return offset.add(
                this._boxSizing.borderLeft,
                this._boxSizing.borderTop,
                0);
        }

        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            this._boxSizing.update(element, style);
            var left = isNaN(point.x) ? this._boxSizing.borderLeft : Math.round(point.x);
            var top = isNaN(point.y) ? this._boxSizing.borderTop : Math.round(point.y);
            element.style.borderWidth = top + "px " + this._boxSizing.borderRight + "px " + this._boxSizing.borderBottom + "px " + left + "px";
        }
    }
    class BorderBottomRightMode implements IPositionMode {
        private _boxSizing = new BoxSizing();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var bs = this._boxSizing;
            bs.update(element, style);
            offset.x *= -1;
            offset.y *= -1;
            offset.sub(
                bs.borderLeft,
                bs.borderTop,
                0);
            
            //clamp min
            offset.x = Math.max(offset.x, 0);
            offset.y = Math.max(offset.y, 0);
            
//            var bx = bs.getBox(BoxModel.CONTENT, BoxModel.BORDER);
            
            return offset;
        }

        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            this._boxSizing.update(element, style);
            var right = isNaN(point.x) ? this._boxSizing.borderRight : Math.round(point.x);
            var bottom = isNaN(point.y) ? this._boxSizing.borderBottom : Math.round(point.y);
            element.style.borderWidth = this._boxSizing.borderTop + "px " + right + "px " + bottom + "px " + this._boxSizing.borderLeft + "px";
        }
    }
    class ScrollMode implements IPositionMode {
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var scrollLeft = element.scrollLeft;
            var scrollTop = element.scrollTop;

            if (!system.Browser.isWebKit && element.ownerDocument.body == element) {
                scrollLeft = element.ownerDocument.documentElement.scrollLeft;
                scrollTop = element.ownerDocument.documentElement.scrollTop;
            }

            offset.x *= -1;
            offset.y *= -1;
            offset.add(
                scrollLeft,
                scrollTop,
                0);

            offset.x = Math.max(offset.x, 0);
            offset.y = Math.max(offset.y, 0);

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (!system.Browser.isWebKit && element == element.ownerDocument.body) {
                element = element.ownerDocument.documentElement;
            }
            if (!isNaN(point.x))
                element.scrollLeft = point.x;
            if (!isNaN(point.y))
                element.scrollTop = point.y;
        }
    }
    export class PositionMode {
        public static TRANSFORM: IPositionMode = new TransformMode();
        public static TOP_LEFT: IPositionMode = new TopLeftMode();
        public static BORDER_TOP_LEFT: IPositionMode = new BorderTopLeftMode();
        public static BORDER_BOTTOM_RIGHT: IPositionMode = new BorderBottomRightMode();
        public static TOP_LEFT_CLAMPED: IPositionMode = new TopLeftClampedMode();
        public static BOTTOM_RIGHT: IPositionMode = new BottomRightMode();
        public static BOTTOM_LEFT: IPositionMode = new BottomLeftMode();
        public static TOP_RIGHT: IPositionMode = new TopRightMode();
        public static BACKGROUND: IPositionMode = new BackgroundMode();
        public static SCROLL: IPositionMode = new ScrollMode();
    }
}