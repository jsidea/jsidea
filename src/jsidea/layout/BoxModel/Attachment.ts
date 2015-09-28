namespace jsidea.layout.BoxModel {
    class Attachment extends Background {
        public name: string = "attachment-box";
        protected getBackgroundBox(size: Box, ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
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
                if (system.Engine.isWebKit) {
                    ret.x += size.element.ownerDocument.body.scrollLeft;
                    ret.y += size.element.ownerDocument.body.scrollTop;
                }
                else {
                    ret.x += size.element.ownerDocument.documentElement.scrollLeft;
                    ret.y += size.element.ownerDocument.documentElement.scrollTop;
                }
                //transform to html
                var trans = Transform.create(size.element);
                var gl = trans.localToGlobal(0, 0, 0, BoxModel.PADDING, BoxModel.BORDER);
                ret.x -= gl.x;
                ret.y -= gl.y;
            }
            return ret;
        }
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            point.x -= bb.x;
            point.y -= bb.y;
            point.x /= scaleX;
            point.y /= scaleY;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            var scaleX = bb.width / this._imageWidth;
            var scaleY = bb.height / this._imageHeight;
            point.x *= scaleX;
            point.y *= scaleY;
            point.x += bb.x;
            point.y += bb.y;
        }
    }
    export var ATTACHMENT: IBoxModel = new Attachment();
}