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
            if (system.Caps.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
    }
    class TopLeftMode implements IPositionMode {
        private _sizeParent: BoxSizing = new BoxSizing();
        private _size: BoxSizing = new BoxSizing();
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            //another WebKit/IE bug: if top/left is auto the used/computed style
            //should reflect the offsetParent's border, but it returns "auto auto".
            //!IMPORTANT: style needs to be an computed style not the element's style-property
            if (system.Caps.isWebKit) {
                var leftAuto = isNaN(parseInt(style.left));
                var topAuto = isNaN(parseInt(style.top));
                if (leftAuto || topAuto) {
                    var node = StyleChain.create(element);
                    var pos = new geom.Point3D();
                    if (node.isSticked) {
                        pos.setTo(node.offset.x, node.offset.y, 0);
                        this._size.update(node.element, node.style);
                        pos.x -= element.ownerDocument.body.scrollLeft + this._size.marginLeft;
                        pos.y -= element.ownerDocument.body.scrollTop + this._size.marginTop;
                    }
                    else {
                        this._size.update(node.element, node.style);
                        this._sizeParent.update(node.parent.element, node.parent.style);
                        pos.x = node.position.x + this._sizeParent.paddingLeft - this._size.marginLeft;
                        pos.y = node.position.y + this._sizeParent.paddingTop - this._size.marginTop;
                        if (node.isAbsolute) {
                            pos.x += node.parent.clientLeft;
                            pos.y += node.parent.clientTop;
                        }
                        this._sizeParent.point(pos, BoxModel.BORDER, BoxModel.CONTENT);
                    }
                    return point.add(
                        math.Number.parse(style.left, pos.x),
                        math.Number.parse(style.top, pos.y),
                        0);
                }
            }
            else if (system.Caps.isInternetExplorer) {
                if (isNaN(parseInt(style.left)) || isNaN(parseInt(style.top))) {
                    this._size.update(element, style);
                    return point.add(
                        math.Number.parse(style.left, element.offsetLeft - this._size.marginLeft),
                        math.Number.parse(style.top, element.offsetTop - this._size.marginTop),
                        0);
                }
            }

            return point.add(
                math.Number.parse(style.left, 0),
                math.Number.parse(style.top, 0),
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply top/left to an static element");
                return;
            }
            element.style.left = Math.round(point.x) + "px";
            element.style.top = Math.round(point.y) + "px";
        }
    }
    class BottomRightMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            PositionMode.TOP_LEFT.transform(point, element, style);
            point.x += element.offsetWidth;
            point.y += element.offsetHeight;
            if (element.parentElement) {
                point.x = element.parentElement.clientWidth - point.x;
                point.y = element.parentElement.clientHeight - point.y;
            }
            else {
                console.log("WINDOW");
                point.x = window.innerWidth - point.x;
                point.y = window.innerHeight - point.y;
            }
            return point;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position === "static") {
                console.warn("You cannot apply bottom/right to an static element");
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