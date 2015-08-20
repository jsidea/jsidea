module jsidea.layout {
    export interface IBoxModel {
        //convert from border-box to custom box
        fromBorderBox(size: BoxSizing, box: geom.Box2D): void;
        //convert from custom-box to border box
        toBorderBox(size: BoxSizing, box: geom.Box2D): void;
    }
    class MarginBoxModel implements IBoxModel {
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x += size.marginLeft;
            box.y += size.marginTop;
            box.width += size.marginLeft + size.marginRight;
            box.height += size.marginTop + size.marginBottom;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x -= size.marginLeft;
            box.y -= size.marginTop;
            box.width -= size.marginLeft + size.marginRight;
            box.height -= size.marginTop + size.marginBottom;
        }
    }
    class BorderBoxModel implements IBoxModel {
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
        }
    }
    class PaddingBoxModel implements IBoxModel {
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x -= size.borderLeft;
            box.y -= size.borderTop;
            box.width -= size.borderLeft + size.borderRight;
            box.height -= size.borderTop + size.borderBottom;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x += size.borderLeft;
            box.y += size.borderTop;
            box.width += size.borderLeft + size.borderRight;
            box.height += size.borderTop + size.borderBottom;
        }
    }
    class ContentBoxModel implements IBoxModel {
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x -= size.borderLeft + size.paddingLeft;
            box.y -= size.borderTop + size.paddingTop;
            box.width -= size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height -= size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            box.x += size.borderLeft + size.paddingLeft;
            box.y += size.borderTop + size.paddingTop;
            box.width += size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight;
            box.height += size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom;
        }
    }
    class ScrollBoxModel implements IBoxModel {
        private getScroll(element: HTMLElement): geom.Point2D {
            var scrollLeft = element.scrollLeft;
            var scrollTop = element.scrollTop;
            if (element == element.ownerDocument.body) {
                if (system.Browser.isFirefox) {
                    //                scrollLeft = element.ownerDocument.documentElement.scrollLeft;
                    //                scrollTop = element.ownerDocument.documentElement.scrollTop;
                }
                else if (system.Browser.isWebKit) {
                    scrollLeft = 0;
                    scrollTop = 0;
                }
            }
            else if (system.Browser.isWebKit && element == element.ownerDocument.documentElement) {
                scrollLeft = element.ownerDocument.body.scrollLeft;
                scrollTop = element.ownerDocument.body.scrollTop;
            }
            return new geom.Point2D(scrollLeft, scrollTop);
        }
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var scroll = this.getScroll(size.element);

            BoxModel.PADDING.toBorderBox(size, box);
            box.x += scroll.x;
            box.y += scroll.y;
            box.width += size.element.scrollWidth - size.width;
            box.height += size.element.scrollHeight - size.height;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var scroll = this.getScroll(size.element);

            BoxModel.PADDING.toBorderBox(size, box);
            box.x -= scroll.x;
            box.y -= scroll.y;
            box.width -= size.element.scrollWidth - size.width;
            box.height -= size.element.scrollHeight - size.height;
        }
    }
    class CanvasBoxModel implements IBoxModel {
        protected check(size: BoxSizing): boolean {
            return size.element && size.element instanceof HTMLCanvasElement;
        }
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement | HTMLImageElement> size.element;
                var scX = element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                var scY = element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                box.width *= scX;
                box.height *= scY;
                box.x *= scX;
                box.y *= scY;
                box.x += size.paddingLeft + size.borderLeft;
                box.y += size.paddingTop + size.borderTop;
            }
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement | HTMLImageElement> size.element;
                box.x -= size.paddingLeft + size.borderLeft;
                box.y -= size.paddingTop + size.borderTop;
                var scX = element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                var scY = element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                box.width /= scX;
                box.height /= scY;
                box.x /= scX;
                box.y /= scY;
            }
        }
    }
    class ImageBoxModel extends CanvasBoxModel {
        protected check(size: BoxSizing): boolean {
            return size.element && size.element instanceof HTMLImageElement;
        }
    }
    class BackgroundBoxModel implements IBoxModel {
        private _image = new Image();
        protected _imageWidth = 0;
        protected _imageHeight = 0;
        protected getBackgroundBox(size: BoxSizing, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            var src = size.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
            var width;
            var height;
            if (!src || src == "none") {
                width = size.width;
                height = size.height;
            }
            else {
                this._image.src = src;
                width = this._image.width;
                height = this._image.height;
                if (isNaN(width))
                    width = size.width;
                if (isNaN(height))
                    height = size.height;
            }
            this._imageWidth = width;
            this._imageHeight = height;

            var backgroundOrigin = size.style.backgroundOrigin ? BoxModel.getModel(size.style.backgroundOrigin) : BoxModel.PADDING;
            var origin = size.getBox(BoxModel.BORDER, backgroundOrigin);

            var x = 0;
            var y = 0;
            
            //TODO: throw error or something similar
            if (!width || !height)
                return ret.setTo(0, 0, size.width, size.height);

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
            else if (xSize == "cover")
                width *= Math.max(scaleX, scaleY);
            else if (xSize == "contain")
                width *= Math.min(scaleX, scaleY);
            else
                width = math.Number.relation(xSize, origin.width, origin.width);

            if (ySize == "auto") {
                //keep ratio
                if (xSize != "auto")
                    height *= width / this._imageWidth;
            }
            else if (ySize == "cover")
                height *= Math.max(scaleX, scaleY);
            else if (ySize == "contain")
                height *= Math.min(scaleX, scaleY);
            else
                height = math.Number.relation(ySize, origin.height, origin.height);

            //keep ratio
            if (xSize == "auto" && ySize != "auto")
                width *= height / this._imageHeight;

            if (xPos == "auto")
            { }
            else if (xPos.indexOf("%") > 0)
                x = math.Number.relation(xPos, origin.width, 0) - math.Number.relation(xPos, width, 0);
            else
                x = math.Number.relation(xPos, origin.width, 0);

            if (yPos == "auto")
            { }
            else if (yPos.indexOf("%") > 0)
                y = math.Number.relation(yPos, origin.height, 0) - math.Number.relation(yPos, height, 0);
            else
                y = math.Number.relation(yPos, origin.height, 0);

            //back to border box
            var pt = new geom.Point3D(x, y);
            size.point(pt, backgroundOrigin, BoxModel.BORDER);

            return ret.setTo(pt.x, pt.y, width, height);
        }
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            box.x -= bb.x;
            box.y -= bb.y;
            box.width -= size.width - bb.width;
            box.height -= size.height - bb.height;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            box.x += bb.x;
            box.y += bb.y;
            box.width += size.width - bb.width;
            box.height += size.height - bb.height;
        }
    }
    class AttachmentBoxModel extends BackgroundBoxModel {
        protected getBackgroundBox(size: BoxSizing, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            super.getBackgroundBox(size, ret);
            //TODO: implement attachment handling correctly
            var attachment = size.style.backgroundAttachment;
            if (attachment == "scroll")
            { }
            else if (attachment == "local") {
                ret.x -= size.element.scrollLeft;
                ret.y -= size.element.scrollTop;
            }
            else if (attachment == "fixed") {
                if (system.Browser.isWebKit) {
                    ret.x += size.element.ownerDocument.body.scrollLeft;
                    ret.y += size.element.ownerDocument.body.scrollTop;
                }
                else {
                    ret.x += size.element.ownerDocument.documentElement.scrollLeft;
                    ret.y += size.element.ownerDocument.documentElement.scrollTop;
                }
                //transform to html
                var trans = geom.Transform.create(size.element);
                var gl = trans.localToGlobal(0, 0, 0, BoxModel.PADDING, BoxModel.BORDER);
                ret.x -= gl.x;
                ret.y -= gl.y;
            }
            return ret;
        }
        public fromBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            box.x -= bb.x;
            box.y -= bb.y;
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            box.x /= scaleX;
            box.y /= scaleY;
            box.width -= size.width - bb.width;
            box.height -= size.height - bb.height;
        }
        public toBorderBox(size: BoxSizing, box: geom.Box2D): void {
            var bb = this.getBackgroundBox(size);
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            box.x *= scaleX;
            box.y *= scaleY;
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
        public static ATTACHMENT: IBoxModel = new AttachmentBoxModel();
        public static SCROLL: IBoxModel = new ScrollBoxModel();
        public static IMAGE: IBoxModel = new ImageBoxModel();

        private static _lookup = {
            "margin-box": BoxModel.MARGIN,
            "border-box": BoxModel.BORDER,
            "padding-box": BoxModel.PADDING,
            "content-box": BoxModel.CONTENT,
            "canvas-box": BoxModel.CANVAS,
            "background-box": BoxModel.BACKGROUND,
            "attachment-box": BoxModel.ATTACHMENT,
            "scroll-box": BoxModel.SCROLL,
            "image-box": BoxModel.IMAGE
        };
        public static getModel(boxSizing: string): IBoxModel {
            return BoxModel._lookup[boxSizing];
        }
    }
}