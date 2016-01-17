namespace jsidea.layout.BoxModel {
    class NormalDeviceCoordinates implements IBoxModel {
        public name: string = "normal-device-coordinates-box";
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            point.x /= size.offsetWidth * 0.5;
            point.y /= size.offsetHeight * 0.5;
            point.x -= 1;
            point.y -= 1;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            point.x += 1;
            point.y += 1;
            point.x *= size.offsetWidth * 0.5;
            point.y *= size.offsetHeight * 0.5;
        }
        public width(size: Box): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight);
        }
        public height(size: Box): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom);
        }
    }
    export var NDC: IBoxModel = new NormalDeviceCoordinates();
}