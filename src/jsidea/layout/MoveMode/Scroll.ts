module jsidea.layout.MoveMode {
    class Scroll implements IMoveMode {
        public boxModel: IBoxModel = BoxModel.SCROLL;
        public willChange: string = "scroll-position";
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var scrollLeft = element.scrollLeft;
            var scrollTop = element.scrollTop;

            if (!system.Engine.isWebKit && element.ownerDocument.body == element) {
                scrollLeft = element.ownerDocument.documentElement.scrollLeft;
                scrollTop = element.ownerDocument.documentElement.scrollTop;
            }

            offset.x *= -1;
            offset.y *= -1;
            offset.add(
                scrollLeft,
                scrollTop,
                0);

            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (!system.Engine.isWebKit && element == element.ownerDocument.body) {
                element = element.ownerDocument.documentElement;
            }
            if (!isNaN(point.x))
                element.scrollLeft = point.x;
            if (!isNaN(point.y))
                element.scrollTop = point.y;
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            point.x = Math.max(point.x, 0);
            point.y = Math.max(point.y, 0);
            //TODO: clamp by scrollWidth ... 
        }
    }

    export var SCROLL: IMoveMode = new Scroll();
}