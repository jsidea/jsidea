module jsidea.layout {
    export interface ISnapMode {
        transform(snap:Snap, point: geom.Point3D): void;
    }
    class BasicSnapMode implements ISnapMode{
        public transform(snap:Snap, point: geom.Point3D): void {
            point.x = math.Number.roundTo(point.x, 50);
            point.y = math.Number.roundTo(point.y, 50);
        }
    }
    export class SnapMode{
        public static BASIC:ISnapMode = new BasicSnapMode();
    }
}