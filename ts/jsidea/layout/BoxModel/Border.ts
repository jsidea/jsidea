namespace jsidea.layout.BoxModel {
    class Border implements IBoxModel {
        public name: string = "border-box";
        public fromBorderBox(size: Box, point: geom.Point3D): void {
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
        }
        public width(size: Box): number {
            return size.offsetWidth;
        }
        public height(size: Box): number {
            return size.offsetHeight;
        }
    }
    export var BORDER: IBoxModel = new Border();
}