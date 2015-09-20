module jsidea.layout {
    export interface ITransformMode {
        extract(element: Transform, style: CSSStyleDeclaration): geom.Matrix3D;
    }
}