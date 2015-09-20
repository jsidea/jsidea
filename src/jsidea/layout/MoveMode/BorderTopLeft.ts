module jsidea.layout.MoveMode {
    class BorderTopLeft implements IMoveMode {
        public willChange: string = "contents";
        private _boxSizing: Box = Box.create();
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
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            //clamp min
            point.x = Math.max(point.x, 0);
            point.y = Math.max(point.y, 0);
        }
    }

    export var BORDER_TOP_LEFT: IMoveMode = new BorderTopLeft();
}