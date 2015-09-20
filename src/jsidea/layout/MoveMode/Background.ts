module jsidea.layout.MoveMode {
    class Background implements IMoveMode {
        public boxModel: IBoxModel = BoxModel.BACKGROUND;
        public willChange: string = "contents";
        public invertX: boolean = false;
        public invertY: boolean = false;
        private _rect: geom.Rect2D = new geom.Rect2D();
        private _size: Box = Box.create();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var rect = this._rect;
            this._size.update(element, style);
            this._size.bounds(BoxModel.BACKGROUND, BoxModel.PADDING, rect);
            return offset.add(
                rect.x,
                rect.y,
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            element.style.backgroundPosition = Math.round(point.x) + "px " + Math.round(point.y) + "px";
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }

    export var BACKGROUND: IMoveMode = new Background();
}