namespace jsidea.layout {
    export interface IBoxModel {
        name: string;
        fromBorderBox(size: Box, point: geom.Point3D): void;
        toBorderBox(size: Box, point: geom.Point3D): void;
        width(size: Box): number;
        height(size: Box): number;
    }
}