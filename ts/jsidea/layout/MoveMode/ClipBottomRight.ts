namespace jsidea.layout.MoveMode {
    class ClipBottomRight implements IMoveMode {
        public boxModel: IBoxModel = BoxModel.CLIP;
        public willChange: string = "contents";
        private _clip: geom.Rect2D = new geom.Rect2D();
        public transform(offset: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D {
            var clip = geom.Rect2D.getClip(element, style, this._clip);
            offset.translate(
                clip.right,
                clip.bottom,
                0);
            console.log(offset.x, offset.y);
            return offset;
        }
        public apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
            if (style.position != "absolute" && style.position != "fixed")
                return console.warn("You cannot apply clipping to an " + style.position + "-positioned element");

            var clip = geom.Rect2D.getClip(element, style, this._clip);
            if (!isNaN(point.x))
                clip.right = point.x;
            if (!isNaN(point.y))
                clip.bottom = point.y;
            element.style.clip = clip.getCSS();
        }

        public clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void {
        }
    }

    export var CLIP_BOTTOM_RIGHT: IMoveMode = new ClipBottomRight();
}