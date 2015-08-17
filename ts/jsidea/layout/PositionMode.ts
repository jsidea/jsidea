module jsidea.layout {
    export interface IPositionMode {
        transform(point: geom.Point3D, element: HTMLElement): geom.Point3D;
        apply(point: geom.Point3D, element: HTMLElement): void;
    }
    class TransformMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement): geom.Point3D {
            return point;
        }
        public apply(point: geom.Point3D, element: HTMLElement): void {
            var matrix = geom.Matrix3D.create(element);
            matrix.setPosition(point);
            //WebKit bug
            if (system.Caps.isWebKit)
                matrix.m43 *= 1 / (window.innerWidth / window.outerWidth);
            element.style.transform = matrix.getCSS();
        }
    }
    class TopLeftMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement): geom.Point3D {
            var style: CSSStyleDeclaration = element.style;
            if (isNaN(parseInt(element.style.left)) || isNaN(parseInt(element.style.top)))
                style = layout.Style.create(element);
            return point.add(
                math.Number.parse(style.left, 0),
                math.Number.parse(style.top, 0),
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement): void {
            element.style.left = Math.round(point.x) + "px";
            element.style.top = Math.round(point.y) + "px";
        }
    }
    class BottomRightMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement): geom.Point3D {
//            PositionMode.TOP_LEFT.transform(point, element);
            var style: CSSStyleDeclaration = element.style;
            if (isNaN(parseInt(element.style.right)) || isNaN(parseInt(element.style.bottom)))
                style = layout.Style.create(element);
            
            point.x += element.offsetWidth;
            point.y += element.offsetHeight;
            if (element.parentElement) {
                point.x = element.parentElement.offsetWidth - point.x;
                point.y = element.parentElement.offsetHeight - point.y;
            }
            return point;
        }
        public apply(point: geom.Point3D, element: HTMLElement): void {
            element.style.right = Math.round(point.x) + "px";
            element.style.bottom = Math.round(point.y) + "px";
        }
    }
    class BackgroundMode implements IPositionMode {
        private _box = new geom.Box2D();
        private _boxSizing = new layout.BoxSizing();
        public transform(point: geom.Point3D, element: HTMLElement): geom.Point3D {
            var box = this._box;
            this._boxSizing.update(element);
            this._boxSizing.getBox(layout.BoxModel.BACKGROUND, layout.BoxModel.PADDING, box);
            return point.add(
                box.x,
                box.y,
                0);
        }

        public apply(point: geom.Point3D, element: HTMLElement): void {
            element.style.backgroundPosition = Math.round(point.x) + "px " + Math.round(point.y) + "px";
        }
    }
    class ScrollMode implements IPositionMode {
        public transform(point: geom.Point3D, element: HTMLElement): geom.Point3D {
            return null;
        }
        public apply(point: geom.Point3D, element: HTMLElement): void {
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