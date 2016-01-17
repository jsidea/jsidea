namespace jsidea.layout.SnapMode {
    class BasicSnapMode implements ISnapMode {
        public transform(snap: Snap, transform: Transform, point: geom.Point3D): void {
            point.x = math.Number.roundTo(point.x, 60);
            point.y = math.Number.roundTo(point.y, 60);
        }
    }
    export var BASIC: ISnapMode = new BasicSnapMode();
}