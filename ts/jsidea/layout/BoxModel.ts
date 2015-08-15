module jsidea.layout {
    export interface IBoxModel {
        //convert from border-box to custom box
        fromBorderBox(size: Size, box: geom.Box2D): void;
        //convert from custom-box to border box
        toBorderBox(size: Size, box: geom.Box2D): void;
    }
    class MarginBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            box.x += size.marginLeft;
            box.y += size.marginTop;
            box.width += size.marginLeft + size.marginRight;
            box.height += size.marginTop + size.marginBottom;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            box.x -= size.marginLeft;
            box.y -= size.marginTop;
            box.width -= size.marginLeft + size.marginRight;
            box.height -= size.marginTop + size.marginBottom;
        }
    }
    class BorderBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
        }
    }
    class PaddingBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            box.x += size.borderLeft;
            box.y += size.borderTop;
            box.width += size.borderLeft + size.borderRight;
            box.height += size.borderTop + size.borderBottom;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            box.x -= size.borderLeft;
            box.y -= size.borderTop;
            box.width -= size.borderLeft + size.borderRight;
            box.height -= size.borderTop + size.borderBottom;
        }
    }
    class ContentBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            box.x += size.borderLeft + size.paddingLeft;
            box.y += size.borderTop + size.paddingTop;
            box.width += size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height += size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            box.x -= size.borderLeft + size.paddingLeft;
            box.y -= size.borderTop + size.paddingTop;
            box.width -= size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height -= size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
    }
    class CanvasBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            if (size.element && size.element instanceof HTMLCanvasElement) {
                var can = <HTMLCanvasElement> size.element;
                var scX = can.width / (can.clientWidth - (size.paddingLeft + size.paddingRight));
                var scY = can.height / (can.clientHeight - (size.paddingTop + size.paddingBottom));
                box.width *= scX;
                box.height *= scY;
                box.x *= scX;
                box.y *= scY;
                box.x += size.paddingLeft + size.borderLeft;
                box.y += size.paddingTop + size.borderTop;
            }
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            if (size.element && size.element instanceof HTMLCanvasElement) {
                var can = <HTMLCanvasElement> size.element;
                box.x -= size.paddingLeft + size.borderLeft;
                box.y -= size.paddingTop + size.borderTop;
                var scX = can.width / (can.clientWidth - (size.paddingLeft + size.paddingRight));
                var scY = can.height / (can.clientHeight - (size.paddingTop + size.paddingBottom));
                box.width /= scX;
                box.height /= scY;
                box.x /= scX;
                box.y /= scY;
            }
        }
    }
    export class BoxModel {
        public static MARGIN: IBoxModel = new MarginBoxModel();
        public static BORDER: IBoxModel = new BorderBoxModel();
        public static PADDING: IBoxModel = new PaddingBoxModel();
        public static CONTENT: IBoxModel = new ContentBoxModel();
        public static CANVAS: IBoxModel = new CanvasBoxModel();
    }
}