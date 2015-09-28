namespace jsidea.layout {
    export interface IStyleNode {
        //re-cast
        element: HTMLElement;
        style: CSSStyleDeclaration;
        depth: number;
        isBody: boolean;
        isHTML: boolean;
        isTransformed: boolean;
        isTransformed3D: boolean;
        isPreserved3d: boolean;
        isScrollable: boolean;
        perspective: number;
        isForced2D: boolean;
        first: IStyleNode;
        last: IStyleNode;
        child: IStyleNode;
        parent: IStyleNode;
        offsetParent: IStyleNode;
        offsetParentRaw: IStyleNode;
        parentScroll: IStyleNode;
        offset: geom.Point2D;
        offsetUnscrolled: geom.Point2D;
        position: geom.Point2D;
        scrollOffset: geom.Point2D;
        offsetLeft: number;
        offsetTop: number;
        clientLeft: number;
        clientTop: number;
        isRelative: boolean;
        isAbsolute: boolean;
        isStatic: boolean;
        isFixed: boolean;
        isFixedChild: boolean;
        isFixedZombie: boolean;
        isSticked: boolean;
        isStickedChild: boolean;
        isTransformedChild: boolean;
        isPerspectiveChild: boolean;
        isPreserved3dOrPerspective: boolean;
        isPreserved3dChild: boolean;
        isBorderBox: boolean;
    }
}