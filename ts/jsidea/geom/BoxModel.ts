module jsidea.geom {
    export class BoxModel {
        public offset

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

        constructor() {
        }

        public parse(element: HTMLElement, style: CSSStyleDeclaration = null): void {
            if (!style)
                style = window.getComputedStyle(element);

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
        }

        public clone(): BoxModel {
            return new BoxModel();
        }

        public size(size: geom.IPoint2DValue, toBox: string, fromBox: string = "border"): geom.IPoint2DValue {
            if (toBox == fromBox)
                return size;
            if (fromBox != "border")
                this.convertSize(size, fromBox, true)
            return this.convertSize(size, toBox, false);
        }

        public point(pt: geom.IPoint2DValue, toBox: string, fromBox: string = "border"): IPoint2DValue {
            if (toBox == fromBox)
                return pt;
            if (fromBox != "border")
                this.convertPoint(pt, fromBox, true)
            return this.convertPoint(pt, toBox, false);
        }
        
        //converts sizes from or to border-box
        private convertSize(size: geom.IPoint2DValue, toBox: string, convertFromBoxTo: boolean): IPoint2DValue {
            if (toBox != "border") {
                var isCanvasModelSource = toBox == "canvas" && (this._element && this._element instanceof HTMLCanvasElement);

                var px = 0;
                var py = 0;
                var sx = 1;
                var sy = 1;
                if (toBox == "content") {
                    px += this.paddingLeft + this.paddingRight + this.borderLeft + this.borderRight;
                    py += this.paddingTop + this.paddingBottom + this.borderTop + this.borderBottom;
                }
                else if (toBox == "padding") {
                    px += this.borderLeft + this.borderRight;
                    py += this.borderTop + this.borderBottom;
                }
                else if (toBox == "margin") {
                    px -= this.marginLeft + this.marginRight;
                    py -= this.marginTop + this.marginBottom;
                }
                else if (isCanvasModelSource) {
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
        private convertPoint(pt: geom.IPoint2DValue, toBox: string, convertFromBoxTo: boolean): IPoint2DValue {
            if (toBox != "border") {
                var isCanvasModelSource = toBox == "canvas" && (this._element && this._element instanceof HTMLCanvasElement);

                var px = 0;
                var py = 0;
                var sx = 1;
                var sy = 1;
                if (toBox == "content") {
                    px += this.paddingLeft + this.borderLeft;
                    py += this.paddingTop + this.borderTop;
                }
                else if (toBox == "padding") {
                    px += this.borderLeft;
                    py += this.borderTop;
                }
                else if (toBox == "margin") {
                    px -= this.marginLeft;
                    py -= this.marginTop;
                }
                else if (isCanvasModelSource) {
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