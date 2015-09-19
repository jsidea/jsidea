module jsidea.layout.BoxModel {
    class Scroll implements IBoxModel {
        public name: string = "scroll-box";
        private getScroll(size: Box): geom.Point2D {
            var scrollLeft = size.scrollLeft;
            var scrollTop = size.scrollTop;
            return new geom.Point2D(scrollLeft, scrollTop);
        }
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            var scroll = this.getScroll(size);
            BoxModel.PADDING.toBorderBox(size, point);
            point.x += scroll.x;
            point.y += scroll.y;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            var scroll = this.getScroll(size);
            BoxModel.PADDING.toBorderBox(size, point);
            point.x -= scroll.x;
            point.y -= scroll.y;
        }
        public width(size: Box): number {
            return size.element.scrollWidth;
        }
        public height(size: Box): number {
            return size.element.scrollHeight;
        }
    }
    export var SCROLL: IBoxModel = new Scroll();
}