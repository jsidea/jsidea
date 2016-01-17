namespace jsidea.layout.BoxModel {
    export class Background implements IBoxModel {
        public name: string = "background-box";
        private _image = new Image();
        private _point = new geom.Point3D();
        protected _imageWidth = 0;
        protected _imageHeight = 0;
        protected getBackgroundBox(size: Box, ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            var src = size.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
            var width: number;
            var height: number;
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

            var backgroundOrigin = size.style.backgroundOrigin ? Box.lookup(size.style.backgroundOrigin) : BoxModel.PADDING;
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
        public fromBorderBox(size: Box, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            point.x -= bb.x;
            point.y -= bb.y;
        }
        public toBorderBox(size: Box, point: geom.Point3D): void {
            var bb = this.getBackgroundBox(size);
            point.x += bb.x;
            point.y += bb.y;
        }
        public width(size: Box): number {
            return this.getBackgroundBox(size).width;
        }
        public height(size: Box): number {
            return this.getBackgroundBox(size).height;
        }
    }
    export var BACKGROUND: IBoxModel = new Background();
}