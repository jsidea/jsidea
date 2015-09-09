module jsidea.layout {
    export interface IBoxModel {
        fromBorderBox(size: Size, point: geom.Point3D): void;
        toBorderBox(size: Size, point: geom.Point3D): void;
        width(size: Size): number;
        height(size: Size): number;
    }
    class MarginBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            point.x += size.marginLeft;
            point.y += size.marginTop;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            point.x -= size.marginLeft;
            point.y -= size.marginTop;
        }
        public width(size: Size): number {
            return size.offsetWidth + size.marginLeft + size.marginRight;
        }
        public height(size: Size): number {
            return size.offsetHeight + size.marginTop + size.marginBottom;
        }
    }
    class BorderBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, point: geom.Point3D): void {
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
        }
        public width(size: Size): number {
            return size.offsetWidth;
        }
        public height(size: Size): number {
            return size.offsetHeight;
        }
    }
    class PaddingBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            point.x -= size.borderLeft;
            point.y -= size.borderTop;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            point.x += size.borderLeft;
            point.y += size.borderTop;
        }
        public width(size: Size): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight);
        }
        public height(size: Size): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom);
        }
    }
    class ContentBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            point.x -= size.borderLeft + size.paddingLeft;
            point.y -= size.borderTop + size.paddingTop;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            point.x += size.borderLeft + size.paddingLeft;
            point.y += size.borderTop + size.paddingTop;
        }
        public width(size: Size): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight);
        }
        public height(size: Size): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom);
        }
    }
    class NormalDeviceCoordinatesBoxModel implements IBoxModel {
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            point.x /= size.offsetWidth * 0.5;
            point.y /= size.offsetHeight * 0.5;
            point.x -= 1;
            point.y -= 1;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            point.x += 1;
            point.y += 1;
            point.x *= size.offsetWidth * 0.5;
            point.y *= size.offsetHeight * 0.5;
        }
        public width(size: Size): number {
            return size.offsetWidth - (size.borderLeft + size.borderRight + size.paddingLeft + size.paddingRight);
        }
        public height(size: Size): number {
            return size.offsetHeight - (size.borderTop + size.borderBottom + size.paddingTop + size.paddingBottom);
        }
    }
    class ClipBoxModel implements IBoxModel {
        private _clip: geom.Rect2D = new geom.Rect2D();
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            point.x -= clip.x;
            point.y -= clip.y;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            point.x += clip.x;
            point.y += clip.y;
        }
        public width(size: Size): number {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            return clip.width;
        }
        public height(size: Size): number {
            var clip = geom.Rect2D.getClip(size.element, size.style, this._clip);
            return clip.height;
        }
    }
    class ScrollBoxModel implements IBoxModel {
        private getScroll(size: Size): geom.Point2D {
            var scrollLeft = size.scrollLeft;
            var scrollTop = size.scrollTop;
            return new geom.Point2D(scrollLeft, scrollTop);
        }
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            var scroll = this.getScroll(size);
            BoxModel.PADDING.toBorderBox(size, point);
            point.x += scroll.x;
            point.y += scroll.y;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            var scroll = this.getScroll(size);
            BoxModel.PADDING.toBorderBox(size, point);
            point.x -= scroll.x;
            point.y -= scroll.y;
        }
        public width(size: Size): number {
            return size.element.scrollWidth;
        }
        public height(size: Size): number {
            return size.element.scrollHeight;
        }
    }
    class CanvasBoxModel implements IBoxModel {
        private _matrix = new geom.Matrix2D();
        private check(size: Size): boolean {
            return size.element && size.element instanceof HTMLCanvasElement;
        }
        private transform(invert: boolean, point: geom.Point3D, context: CanvasRenderingContext2D): void {
            if (!context)
                return;
            this._matrix.setData(context.getTransform());
            if (!this._matrix.isIdentity()) {
                if (invert)
                    this._matrix.invert();
                var pt = this._matrix.transform(point);
                point.x = pt.x;
                point.y = pt.y;
            }
        }
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement> size.element;
                point.x *= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y *= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                point.x += size.paddingLeft + size.borderLeft;
                point.y += size.paddingTop + size.borderTop;

                if (element.hasContext() == "2d") {
                    var ctx = element.getContext("2d");
                    this.transform(true, point, ctx);
                }
            }
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLCanvasElement> size.element;
                point.x -= size.paddingLeft + size.borderLeft;
                point.y -= size.paddingTop + size.borderTop;
                point.x /= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y /= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));

                if (element.hasContext() == "2d") {
                    var ctx = element.getContext("2d");
                    this.transform(false, point, ctx);
                }
            }
        }
        public width(size: Size): number {
            return this.check(size) ? (<HTMLCanvasElement> size.element).width : size.offsetWidth;
        }
        public height(size: Size): number {
            return this.check(size) ? (<HTMLCanvasElement> size.element).height : size.offsetWidth;
        }
    }
    class ImageBoxModel implements IBoxModel  {
        private check(size: Size): boolean {
            return size.element && size.element instanceof HTMLImageElement;
        }
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLImageElement> size.element;
                point.x *= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y *= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
                point.x += size.paddingLeft + size.borderLeft;
                point.y += size.paddingTop + size.borderTop;
            }
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            if (this.check(size)) {
                var element = <HTMLImageElement> size.element;
                point.x -= size.paddingLeft + size.borderLeft;
                point.y -= size.paddingTop + size.borderTop;
                point.x /= element.width / (element.clientWidth - (size.paddingLeft + size.paddingRight));
                point.y /= element.height / (element.clientHeight - (size.paddingTop + size.paddingBottom));
            }
        }
        public width(size: Size): number {
            return this.check(size) ? (<HTMLImageElement> size.element).width : size.offsetWidth;
        }
        public height(size: Size): number {
            return this.check(size) ? (<HTMLImageElement> size.element).height : size.offsetWidth;
        }
    }
    class BackgroundBoxModel implements IBoxModel {
        private _image = new Image();
        private _point = new geom.Point3D();
        protected _imageWidth = 0;
        protected _imageHeight = 0;
        protected getBackgroundBox(size: Size, ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            var src = size.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
            var width;
            var height;
            if (!src || src == "none") {
                width = size.offsetWidth;
                height = size.offsetHeight;
            }
            else {
                this._image.src = src;
                width = this._image.width;
                height = this._image.height;
                if (isNaN(width))
                    width = size.offsetWidth;
                if (isNaN(height))
                    height = size.offsetHeight;
            }
            //TODO: throw error or something similar
            if (!width || !height)
                return ret.setTo(0, 0, size.offsetWidth, size.offsetHeight);

            this._imageWidth = width;
            this._imageHeight = height;

            var backgroundOrigin = size.style.backgroundOrigin ? BoxModel.getModel(size.style.backgroundOrigin) : BoxModel.PADDING;
            var origin = size.bounds(backgroundOrigin);

            var x = 0;
            var y = 0;

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
            var pt = size.transform(this._point.setTo(x, y, 0), backgroundOrigin, BoxModel.BORDER);

            return ret.setTo(pt.x, pt.y, width, height);
        }
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            point.x -= bb.x;
            point.y -= bb.y;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            point.x += bb.x;
            point.y += bb.y;
        }
        public width(size: Size): number {
            return this.getBackgroundBox(size).width;
        }
        public height(size: Size): number {
            return this.getBackgroundBox(size).height;
        }
    }
    class AttachmentBoxModel extends BackgroundBoxModel {
        protected getBackgroundBox(size: Size, ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            super.getBackgroundBox(size, ret);
            //TODO: implement attachment handling corpointly
            var attachment = size.style.backgroundAttachment;
            if (attachment == "scroll")
            { }
            else if (attachment == "local") {
                ret.x -= size.scrollLeft;
                ret.y -= size.scrollTop;
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
        public fromBorderBox(size: Size, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            point.x -= bb.x;
            point.y -= bb.y;
            point.x /= scaleX;
            point.y /= scaleY;
        }
        public toBorderBox(size: Size, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            point.x *= scaleX;
            point.y *= scaleY;
            point.x += bb.x;
            point.y += bb.y;
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
        public static NDC: IBoxModel = new NormalDeviceCoordinatesBoxModel();
        public static SCROLL: IBoxModel = new ScrollBoxModel();
        public static IMAGE: IBoxModel = new ImageBoxModel();
        public static CLIP: IBoxModel = new ClipBoxModel();

        private static _lookup = {
            "margin-box": BoxModel.MARGIN,
            "border-box": BoxModel.BORDER,
            "padding-box": BoxModel.PADDING,
            "content-box": BoxModel.CONTENT,
            "canvas-box": BoxModel.CANVAS,
            "background-box": BoxModel.BACKGROUND,
            "attachment-box": BoxModel.ATTACHMENT,
            "scroll-box": BoxModel.SCROLL,
            "image-box": BoxModel.IMAGE,
            "clip-box": BoxModel.CLIP
        };
        public static getModel(boxSizing: string): IBoxModel {
            return BoxModel._lookup[boxSizing];
        }
    }
}