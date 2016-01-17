namespace jsidea.layout {
    export interface ITransformMode {
        extract(transform: Transform, matrix: geom.Matrix3D): void;
    }
}