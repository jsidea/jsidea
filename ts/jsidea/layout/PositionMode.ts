module jsidea.layout {
    export interface IPositionMode {
        transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D;
        apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void;
    }
    class TransformMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            return point;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            var matrix = geom.Matrix3D.create(element);
            matrix.setPosition(point);
            //WebKit bug
            if (system.Browser.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
    }
    class TopLeftMode implements IPositionMode {
        private _sizeParent: BoxSizing = new BoxSizing();
        private _size: BoxSizing = new BoxSizing();
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            //!IMPORTANT: style needs to be an computed style not the element's style-property
            
            //TODO: its not running fine...
            if (system.Browser.isWebKit) {
                var leftAuto = style.left == "auto";
                var topAuto = style.top == "auto";
                if (leftAuto || topAuto) {
                    var node = StyleChain.create(element);
                    var pos = new geom.Point3D();
                    if (node.isRelative) {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        pos.x = node.position.x - node.parent.clientLeft;
                        pos.y = node.position.y - node.parent.clientTop;
                        pos.x -= this._sizeParent.paddingLeft;
                        pos.y -= this._sizeParent.paddingTop;
                        pos.x -= this._size.marginLeft;
                        pos.y -= this._size.marginTop;
                    }
                    else if (node.isSticked) {
                        //get the offset to body
                        pos.x = node.offset.x;
                        pos.y = node.offset.y;
                        //subtract body's margin and scroll values
                        this._size.update(node.element, node.style);
                        pos.x -= element.ownerDocument.body.scrollLeft + this._size.marginLeft;
                        pos.y -= element.ownerDocument.body.scrollTop + this._size.marginTop;
                    }
                    else if (node.isAbsolute) {
                        //get the offset to offsetParent
                        pos.x = node.offset.x - node.offsetParent.offset.x;
                        pos.y = node.offset.y - node.offsetParent.offset.y;
                        //subtract the parent's border
                        pos.x -= node.parent.clientLeft;
                        pos.y -= node.parent.clientTop;
                    }
                    else {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        pos.x = node.position.x + this._sizeParent.paddingLeft - this._size.marginLeft;
                        pos.y = node.position.y + this._sizeParent.paddingTop - this._size.marginTop;
                        this._sizeParent.point(pos, BoxModel.BORDER, BoxModel.CONTENT);
                    }
                    return point.add(
                        pos.x,
                        pos.y,
                        0);
                }
            }
            //TODO: its not running fine...
            else if (system.Browser.isInternetExplorer) {
                var leftAuto = style.left == "auto";
                var topAuto = style.top == "auto";
                if (leftAuto || topAuto) {
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
                    return point.add(
                        math.Number.parse(style.left, dx),
                        math.Number.parse(style.top, dy),
                        0);
                }
            }
            else if (system.Browser.isFirefox) {
                //nice: firefox reflects the top left in any case
                //i think this is not w3c standard but its the best solution
            }

            return point.add(
                math.Number.parse(style.left, 0),
                math.Number.parse(style.top, 0),
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply top/left to an static element.");
                return;
            }
            element.style.left = Math.round(point.x) + "px";
            element.style.top = Math.round(point.y) + "px";
        }
    }
    class BottomRightMode implements IPositionMode {
        private _size: BoxSizing = new BoxSizing();
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            PositionMode.TOP_LEFT.transform(point, element, style);

            var parentWidth = 0;
            var parentHeight = 0;
            if (element.parentElement) {
                parentWidth = element.parentElement.clientWidth;
                parentHeight = element.parentElement.clientHeight;
            }

            if (style.position == "fixed") {
                var node = layout.StyleChain.create(element);
                if (node.isSticked) {
                    parentWidth = element.ownerDocument.body.clientWidth;
                    parentHeight = element.ownerDocument.body.clientHeight;
                }
                this._size.update(element);
                point.x += this._size.marginLeft;
                point.y += this._size.marginTop;
                point.x += this._size.marginRight;
                point.y += this._size.marginBottom;
                
                point.x += element.offsetWidth;
                point.y += element.offsetHeight;
                point.x = parentWidth - point.x;
                point.y = parentHeight - point.y;
            }
            //if its relative the bottom/right are offset to "calced"/layout-position
            else if (style.position == "relative") {
                point.x = -point.x;
                point.y = -point.y;
                return point;
            }
            else {
                point.x += element.offsetWidth;
                point.y += element.offsetHeight;
                point.x = parentWidth - point.x;
                point.y = parentHeight - point.y;
            }

            return point;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply bottom/right to an static element.");
                return;
            }
            element.style.right = Math.round(point.x) + "px";
            element.style.bottom = Math.round(point.y) + "px";
        }
    }
    class BackgroundMode implements IPositionMode {
        private _box = new geom.Box2D();
        private _boxSizing = new BoxSizing();
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var box = this._box;
            this._boxSizing.update(element, style);
            this._boxSizing.getBox(BoxModel.BACKGROUND, BoxModel.PADDING, box);
            return point.add(
                box.x,
                box.y,
                0);
        }

        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            element.style.backgroundPosition = Math.round(point.x) + "px " + Math.round(point.y) + "px";
        }
    }
    class ScrollMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            return null;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            element.style.backgroundPosition = Math.round(point.x) + "px " + Math.round(point.y) + "px";
        }
    }
    export class PositionMode {
        public static TRANSFORM: IPositionMode = new TransformMode();
        public static TOP_LEFT: IPositionMode = new TopLeftMode();
        public static BOTTOM_RIGHT: IPositionMode = new BottomRightMode();
        public static BACKGROUND: IPositionMode = new BackgroundMode();
        public static SCROLL: IPositionMode = new ScrollMode();
    }
}