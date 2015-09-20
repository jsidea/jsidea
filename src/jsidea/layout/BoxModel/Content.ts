module jsidea.layout.BoxModel {
    class Content implements IBoxModel {
        public name: string = "content-box";
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            point.x -= size.borderLeft + size.paddingLeft;
            point.y -= size.borderTop + size.paddingTop;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            point.x += size.borderLeft + size.paddingLeft;
            point.y += size.borderTop + size.paddingTop;
        }
        public width(size: Box): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight);
        }
        public height(size: Box): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom);
        }
    }
    export var CONTENT: IBoxModel = new Content();
}