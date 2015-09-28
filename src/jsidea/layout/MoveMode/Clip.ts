namespace jsidea.layout.MoveMode {
    class Clip implements IMoveMode {
        public boxModel: IBoxModel = BoxModel.CLIP;
        public willChange: string = "contents";
        private _clip: geom.Rect2D = new geom.Rect2D();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var clip = geom.Rect2D.getClip(element, style, this._clip);
            return offset.add(
                clip.x,
                clip.y,
                0);
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position != "absolute" && style.position != "fixed")
                return console.warn("You cannot apply clipping to an " + style.position + "-positioned element");

            var clip = geom.Rect2D.getClip(element, style, this._clip);
            if (!isNaN(point.x))
                clip.x = point.x;
            if (!isNaN(point.y))
                clip.y = point.y;
            element.style.clip = clip.getCSS();
        }
        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }

    export var CLIP: IMoveMode = new Clip();
}