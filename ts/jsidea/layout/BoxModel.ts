module jsidea.layout {
    export class BoxModel {
        public static MARGIN: string = "margin";
        public static BORDER: string = "border";
        public static PADDING: string = "padding";
        public static CONTENT: string = "content";
        public static CANVAS: string = "canvas";
        public static AUTO: string = "auto";

        public marginTop: number = 0;
        public marginRight: number = 0;
        public marginBottom: number = 0;
        public marginLeft: number = 0;

        public borderTop: number = 0;
        public borderRight: number = 0;
        public borderBottom: number = 0;
        public borderLeft: number = 0;

        public paddingTop: number = 0;
        public paddingRight: number = 0;
        public paddingBottom: number = 0;
        public paddingLeft: number = 0;

        private _element: HTMLElement;

        constructor(element: HTMLElement = null, style: CSSStyleDeclaration = null) {
            if (element)
                this.update(element, style);
        }

        public static create(element: HTMLElement = null, style: CSSStyleDeclaration = null): BoxModel {
            return new BoxModel(element, style);
        }

        public update(element: HTMLElement, style: CSSStyleDeclaration = null): BoxModel {
            if (!element)
                return this.clear();
            if (!style) {
                style = window.getComputedStyle(element);
            }

            this._element = element;

            this.marginTop = math.Number.parse(style.marginTop, 0);
            this.marginRight = math.Number.parse(style.marginRight, 0);
            this.marginBottom = math.Number.parse(style.marginBottom, 0);
            this.marginLeft = math.Number.parse(style.marginLeft, 0);

            this.paddingTop = math.Number.parse(style.paddingTop, 0);
            this.paddingRight = math.Number.parse(style.paddingRight, 0);
            this.paddingBottom = math.Number.parse(style.paddingBottom, 0);
            this.paddingLeft = math.Number.parse(style.paddingLeft, 0);

            this.borderTop = math.Number.parse(style.borderTopWidth, 0);
            this.borderRight = math.Number.parse(style.borderRightWidth, 0);
            this.borderBottom = math.Number.parse(style.borderBottomWidth, 0);
            this.borderLeft = math.Number.parse(style.borderLeftWidth, 0);

            return this;
        }

        public clone(): BoxModel {
            return new BoxModel();
        }

        public clear(): BoxModel {
            this.marginTop = 0;
            this.marginRight = 0;
            this.marginBottom = 0;
            this.marginLeft = 0;

            this.paddingTop = 0;
            this.paddingRight = 0;
            this.paddingBottom = 0;
            this.paddingLeft = 0;

            this.borderTop = 0;
            this.borderRight = 0;
            this.borderBottom = 0;
            this.borderLeft = 0;

            return this;
        }

        public size(size: geom.IPoint2DValue, toBox: string, fromBox: string = BoxModel.BORDER): geom.IPoint2DValue {
            if (toBox == fromBox)
                return size;
            if (fromBox != BoxModel.BORDER)
                this.convertSize(size, fromBox, true)
            return this.convertSize(size, toBox, false);
        }

        public point(pt: geom.IPoint2DValue, toBox: string, fromBox: string = BoxModel.BORDER): geom.IPoint2DValue {
            if (toBox == fromBox)
                return pt;
            if (fromBox != BoxModel.BORDER)
                this.convertPoint(pt, fromBox, true)
            return this.convertPoint(pt, toBox, false);
        }
        
        //converts sizes from or to border-box
        private convertSize(size: geom.IPoint2DValue, toBox: string, convertFromBoxTo: boolean): geom.IPoint2DValue {
            if (toBox != BoxModel.BORDER) {
                var px = 0;
                var py = 0;
                var sx = 1;
                var sy = 1;
                if (toBox == BoxModel.CONTENT) {
                    px += this.paddingLeft + this.paddingRight + this.borderLeft + this.borderRight;
                    py += this.paddingTop + this.paddingBottom + this.borderTop + this.borderBottom;
                }
                else if (toBox == BoxModel.PADDING) {
                    px += this.borderLeft + this.borderRight;
                    py += this.borderTop + this.borderBottom;
                }
                else if (toBox == BoxModel.MARGIN) {
                    px -= this.marginLeft + this.marginRight;
                    py -= this.marginTop + this.marginBottom;
                }
                else if (toBox == BoxModel.CANVAS && (this._element && this._element instanceof HTMLCanvasElement)) {
                    var can = <HTMLCanvasElement> this._element;
                    px += this.paddingLeft + this.paddingRight + this.borderLeft + this.borderRight;
                    py += this.paddingTop + this.paddingBottom + this.borderTop + this.borderBottom;
                    sx = can.width / (can.clientWidth - (this.paddingLeft + this.paddingRight));
                    sy = can.height / (can.clientHeight - (this.paddingTop + this.paddingBottom));
                }

                if (convertFromBoxTo) {
                    size.x += px;
                    size.y += px;
                    size.x /= sx;
                    size.y /= sy;
                }
                else {
                    size.x -= px;
                    size.y -= px;
                    size.x *= sx;
                    size.y *= sy;
                }
            }
            return size;
        }

        //converts points from or to border-box
        private convertPoint(pt: geom.IPoint2DValue, toBox: string, convertFromBoxTo: boolean): geom.IPoint2DValue {
            if (toBox != BoxModel.BORDER) {
                var px = 0;
                var py = 0;
                var sx = 1;
                var sy = 1;
                if (toBox == BoxModel.CONTENT) {
                    px += this.paddingLeft + this.borderLeft;
                    py += this.paddingTop + this.borderTop;
                }
                else if (toBox == BoxModel.PADDING) {
                    px += this.borderLeft;
                    py += this.borderTop;
                }
                else if (toBox == BoxModel.MARGIN) {
                    px -= this.marginLeft;
                    py -= this.marginTop;
                }
                else if (toBox == BoxModel.CANVAS && (this._element && this._element instanceof HTMLCanvasElement)) {
                    var can = <HTMLCanvasElement> this._element;
                    px += this.paddingLeft + this.borderLeft;
                    py += this.paddingTop + this.borderTop;
                    sx = can.width / (can.clientWidth - (this.paddingLeft + this.paddingRight));
                    sy = can.height / (can.clientHeight - (this.paddingTop + this.paddingBottom));
                }

                if (convertFromBoxTo) {
                    pt.x /= sx;
                    pt.y /= sy;
                    pt.x += px;
                    pt.y += px;
                }
                else {
                    pt.x -= px;
                    pt.y -= px;
                    pt.x *= sx;
                    pt.y *= sy;
                }
            }
            return pt;
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.BoxModel";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}