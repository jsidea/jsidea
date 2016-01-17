namespace jsidea.layout.BoxModel {
    class Clip implements IBoxModel {
        public name: string = "clip-box";
        private _clip: geom.Rect2D = new geom.Rect2D();
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            point.x -= clip.x;
            point.y -= clip.y;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            point.x += clip.x;
            point.y += clip.y;
        }
        public width(size: Box): number {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            return clip.width;
        }
        public height(size: Box): number {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            return clip.height;
        }
    }
    export var CLIP: IBoxModel = new Clip();
}