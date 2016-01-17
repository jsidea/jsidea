namespace jsidea.layout {
    export interface IMoveMode {
        willChange?: string;
        boxModel?: IBoxModel;
        invertX?: boolean;
        invertY?: boolean;
        transform(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): geom.Point3D;
        clamp(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void;
        apply(point: geom.Point3D, element: HTMLElement, style: CSSStyleDeclaration): void;
    }
}