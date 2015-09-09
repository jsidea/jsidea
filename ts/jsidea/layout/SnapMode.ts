module jsidea.layout {
    export interface ISnapMode {
        transform(snap:Snap, transform:geom.Transform, point: geom.Point3D): void;
    }
    class BasicSnapMode implements ISnapMode{
        public transform(snap:Snap, transform:geom.Transform, point: geom.Point3D): void {
            point.x = math.Number.roundTo(point.x, 60);
            point.y = math.Number.roundTo(point.y, 60);
        }
    }
    export class SnapMode{
        public static BASIC:ISnapMode = new BasicSnapMode();
    }
}