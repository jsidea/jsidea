module jsidea.layout.BoxModel {
    class Margin implements IBoxModel {
        public name: string = "margin-box";
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            point.x += size.marginLeft;
            point.y += size.marginTop;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            point.x -= size.marginLeft;
            point.y -= size.marginTop;
        }
        public width(size: Box): number {
            return size.offsetWidth + size.marginLeft + size.marginRight;
        }
        public height(size: Box): number {
            return size.offsetHeight + size.marginTop + size.marginBottom;
        }
    }
    export var MARGIN: IBoxModel = new Margin();
}