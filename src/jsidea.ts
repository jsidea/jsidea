//jsidea.events
/// <reference path='jsidea/events/Events.ts' />
/// <reference path='jsidea/events/EventDispatcher.ts' />

//jsidea.system
/// <reference path='jsidea/system/System.ts' />
/// <reference path='jsidea/system/Browser.ts' />
/// <reference path='jsidea/system/Engine.ts' />
/// <reference path='jsidea/system/Application.ts' />

//jsidea.math
/// <reference path='jsidea/math/Number.ts' />

//jsidea.text
/// <reference path='jsidea/text/Text.ts' />

//jsidea.model
/// <reference path='jsidea/model/Dictionary.ts' />

//jsidea.geom
/// <reference path='jsidea/geom/Point2D.ts' />
/// <reference path='jsidea/geom/Point3D.ts' />
/// <reference path='jsidea/geom/Matrix3D.ts' />
/// <reference path='jsidea/geom/Matrix2D.ts' />
/// <reference path='jsidea/geom/AffineFit.ts' />
/// <reference path='jsidea/geom/Rect2D.ts' />
/// <reference path='jsidea/geom/Quad.ts' />

//jsidea.layout.BoxModel
/// <reference path='jsidea/layout/BoxModel/Margin.ts' />
/// <reference path='jsidea/layout/BoxModel/Border.ts' />
/// <reference path='jsidea/layout/BoxModel/Padding.ts' />
/// <reference path='jsidea/layout/BoxModel/Content.ts' />
/// <reference path='jsidea/layout/BoxModel/Background.ts' />
/// <reference path='jsidea/layout/BoxModel/Attachment.ts' />
/// <reference path='jsidea/layout/BoxModel/Canvas.ts' />
/// <reference path='jsidea/layout/BoxModel/Clip.ts' />
/// <reference path='jsidea/layout/BoxModel/Image.ts' />
/// <reference path='jsidea/layout/BoxModel/NormalDeviceCoordinates.ts' />
/// <reference path='jsidea/layout/BoxModel/Scroll.ts' />

//jsidea.layout
/// <reference path='jsidea/layout/Box.ts' />
/// <reference path='jsidea/layout/StyleNode.ts' />
/// <reference path='jsidea/layout/Move.ts' />
/// <reference path='jsidea/layout/Transform.ts' />
/// <reference path='jsidea/layout/Position.ts' />
/// <reference path='jsidea/layout/Snap.ts' />

//jsidea.layout.MoveMode
/// <reference path='jsidea/layout/MoveMode/Transform.ts' />
/// <reference path='jsidea/layout/MoveMode/Background.ts' />
/// <reference path='jsidea/layout/MoveMode/BorderBottomRightInner.ts' />
/// <reference path='jsidea/layout/MoveMode/BorderBottomRightOuter.ts' />
/// <reference path='jsidea/layout/MoveMode/BorderTopLeft.ts' />
/// <reference path='jsidea/layout/MoveMode/BottomRight.ts' />
/// <reference path='jsidea/layout/MoveMode/BottomLeft.ts' />
/// <reference path='jsidea/layout/MoveMode/ClipBottomRight.ts' />
/// <reference path='jsidea/layout/MoveMode/Clip.ts' />
/// <reference path='jsidea/layout/MoveMode/MarginBottomRight.ts' />
/// <reference path='jsidea/layout/MoveMode/MarginTopLeft.ts' />
/// <reference path='jsidea/layout/MoveMode/Scroll.ts' />
/// <reference path='jsidea/layout/MoveMode/TopLeft.ts' />
/// <reference path='jsidea/layout/MoveMode/TopLeftClamped.ts' />
/// <reference path='jsidea/layout/MoveMode/TopRight.ts' />

//jsidea.layout.TransformMode
/// <reference path='jsidea/layout/TransformMode/Rectangle.ts' />
/// <reference path='jsidea/layout/TransformMode/Perspective.ts' />
/// <reference path='jsidea/layout/TransformMode/Test.ts' />
/// <reference path='jsidea/layout/TransformMode/Planar.ts' />

//jsidea.layout.SnapMode
/// <reference path='jsidea/layout/SnapMode/Basic.ts' />

//jsidea.display
/// <reference path='jsidea/display/Graphics.ts' />

//jsidea.action
/// <reference path='jsidea/action/Cursor.ts' />
/// <reference path='jsidea/action/EventCircuit.ts' />

//jsidea.test
/// <reference path='jsidea/plugin/Test.ts' />
/// <reference path='jsidea/plugin/Simboxy.ts' />
/// <reference path='jsidea/plugin/Dependency.ts' />

interface HTMLElement {
    matches(selector: string): boolean;
}

interface Object {
    observe(beingObserved: any, callback: (update: any) => any, types?: string[]): void;
}

interface CanvasRenderingContext2D {
    getTransform(): number[];
}

interface CSSStyleDeclaration {
    willChange: string;
}

interface MSStyleCSSProperties {
    willChange: string;
}

interface HTMLCanvasElement {
    hasContext(): string;
}