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
            box.x -= size.borderLeft;
            box.y -= size.borderTop;
            box.width -= size.borderLeft + size.borderRight;
            box.height -= size.borderTop + size.borderBottom;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            box.x += size.borderLeft;
            box.y += size.borderTop;
            box.width += size.borderLeft + size.borderRight;
            box.height += size.borderTop + size.borderBottom;
        }
    }
    class ContentBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            box.x -= size.borderLeft + size.paddingLeft;
            box.y -= size.borderTop + size.paddingTop;
            box.width -= size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height -= size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            box.x += size.borderLeft + size.paddingLeft;
            box.y += size.borderTop + size.paddingTop;
            box.width += size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height += size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
    }
    class ScrollBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            BoxModel.CONTENT.fromBorderBox(size, box);
            box.x -= size.element.scrollLeft;
            box.y -= size.element.scrollTop;
            box.width -=  size.width - size.element.scrollWidth;
            box.height -= size.height - size.element.scrollHeight;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            BoxModel.CONTENT.toBorderBox(size, box);
            box.x += size.element.scrollLeft;
            box.y += size.element.scrollTop;
            box.width +=  size.width - size.element.scrollWidth;
            box.height += size.height - size.element.scrollHeight;
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
    class BackgroundBoxModel implements IBoxModel {
        private _image = new Image();
        private getBackgroundBox(size: Size, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            var src = size.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
            if (!src)
                return ret.setTo(0, 0, size.width, size.height);
            this._image.src = src;

            var backgroundOrigin = size.style.backgroundOrigin ? BoxModel.getModel(size.style.backgroundOrigin) : BoxModel.PADDING;
            var origin = size.getBox(backgroundOrigin);

            var x = 0;
            var y = 0;
            var width = this._image.width;
            var height = this._image.height;
            var cssPos = size.style.backgroundPosition.split(" ");
            var xPos: string = cssPos[0] || "auto";
            var yPos: string = cssPos[1] || "auto";
            var cssSize = size.style.backgroundSize.split(" ");
            var xSize: string = cssSize[0] || "auto";
            var ySize: string = cssSize[1] || xSize;
            var scaleX = origin.width / width;
            var scaleY = origin.height / height;

            if (xSize == "auto")
            { }
            if (xSize == "cover")
                width *= Math.max(scaleX, scaleY);
            else if (xSize == "contain")
                width *= Math.min(scaleX, scaleY);
            else
                width = math.Number.relation(xSize, origin.width, origin.width);

            if (ySize == "auto")
            { }
            if (ySize == "cover")
                height *= Math.max(scaleX, scaleY);
            else if (ySize == "contain")
                height *= Math.min(scaleX, scaleY);
            else
                height = math.Number.relation(ySize, origin.height, origin.height);

            if (xPos == "auto" || xSize == "cover" || xSize == "contain")
            { }
            else if(xPos.indexOf("%") > 0)
                x = math.Number.relation(xPos, origin.width, 0) - math.Number.relation(xPos, width, 0);
            else
                x = math.Number.relation(xPos, origin.width, 0);

            if (yPos == "auto" || xSize == "cover" || xSize == "contain")
            { }
            else if(yPos.indexOf("%") > 0)
                y = math.Number.relation(yPos, origin.height, 0) - math.Number.relation(yPos, height, 0);
            else
                y = math.Number.relation(yPos, origin.height, 0);

            //back to border box
            var pt = new geom.Point3D(x, y);
            size.point(pt, BoxModel.BORDER, backgroundOrigin);

            //TODO: implement attachment handling correctly
            var attachment = size.style.backgroundAttachment;
            if (attachment == "scroll")
            { }
            else if (attachment == "local")
            { 
                pt.x -= size.element.scrollLeft;
                pt.y -= size.element.scrollTop;
            }
            else if (attachment == "fixed")
            { }

            return ret.setTo(pt.x, pt.y, width, height);
        }
        public fromBorderBox(size: Size, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            box.x -= bb.x;
            box.y -= bb.y;
            box.width -= size.width - bb.width;
            box.height -= size.height - bb.height;
        }
        public toBorderBox(size: Size, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            box.x += bb.x;
            box.y += bb.y;
            box.width += size.width - bb.width;
            box.height += size.height - bb.height;
        }
    }
    export class BoxModel {
        public static MARGIN: IBoxModel = new MarginBoxModel();
        public static BORDER: IBoxModel = new BorderBoxModel();
        public static PADDING: IBoxModel = new PaddingBoxModel();
        public static CONTENT: IBoxModel = new ContentBoxModel();
        public static CANVAS: IBoxModel = new CanvasBoxModel();
        public static BACKGROUND: IBoxModel = new BackgroundBoxModel();
        public static SCROLL: IBoxModel = new ScrollBoxModel();

        private static _lookup = {
            "margin-box": BoxModel.MARGIN,
            "border-box": BoxModel.BORDER,
            "padding-box": BoxModel.PADDING,
            "content-box": BoxModel.CONTENT,
            "canvas-box": BoxModel.CANVAS,
            "background-box": BoxModel.BACKGROUND,
            "scroll-box": BoxModel.SCROLL
        };
        public static getModel(boxSizing: string): IBoxModel {
            return BoxModel._lookup[boxSizing];
        }
    }
}