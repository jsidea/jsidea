namespace jsidea.layout {
    export interface ISnapMode {
        transform(snap: Snap, transform: Transform, point: geom.Point3D): void;
    }
}