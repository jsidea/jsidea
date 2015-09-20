module jsidea.layout.BoxModel {
    class Canvas implements IBoxModel {
        public name: string = "canvas-box";
        private _matrix = new geom.Matrix2D();
        private check(size: Box): boolean {
            return size.element && size.element instanceof HTMLCanvasElement;
        }
        private transform(invert: boolean, point: geom.Point3D, context: CanvasRenderingContext2D): void {
            if (!context)
                return;
            this._matrix.setData(context.getTransform());
            if (!this._matrix.isIdentity()) {
                if (invert)
                    this._matrix.invert();
                var pt = this._matrix.transform(point);
                point.x = pt.x;
                point.y = pt.y;
            }
        }
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement>size.element;
                point.x *= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y *= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                point.x += size.paddingLeft + size.borderLeft;
                point.y += size.paddingTop + size.borderTop;

                if (element.hasContext() == "2d") {
                    var ctx = element.getContext("2d");
                    this.transform(true, point, ctx);
                }
            }
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement>size.element;
                point.x -= size.paddingLeft + size.borderLeft;
                point.y -= size.paddingTop + size.borderTop;
                point.x /= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y /= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));

                if (element.hasContext() == "2d") {
                    var ctx = element.getContext("2d");
                    this.transform(false, point, ctx);
                }
            }
        }
        public width(size: Box): number {
            return this.check(size) ? (<HTMLCanvasElement>size.element).width : size.offsetWidth;
        }
        public height(size: Box): number {
            return this.check(size) ? (<HTMLCanvasElement>size.element).height : size.offsetWidth;
        }
    }
    export var CANVAS: IBoxModel = new Canvas();
}