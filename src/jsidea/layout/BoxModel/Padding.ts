namespace jsidea.layout.BoxModel {
    class Padding implements IBoxModel {
        public name: string = "padding-box";
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            point.x -= size.borderLeft;
            point.y -= size.borderTop;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            point.x += size.borderLeft;
            point.y += size.borderTop;
        }
        public width(size: Box): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight);
        }
        public height(size: Box): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom);
        }
    }
    export var PADDING: IBoxModel = new Padding();
}