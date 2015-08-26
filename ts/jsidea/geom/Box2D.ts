module jsidea.geom {
    export interface IRectangleValue extends IPoint2DValue {
        width: number;
        height: number;
    }
    export class Box2D implements IRectangleValue {

        constructor(
            public x: number = 0,
            public y: number = 0,
            public width: number = 0,
            public height: number = 0) {
        }

        public clone(): Box2D {
            return new Box2D(
                this.x,
                this.y,
                this.width,
                this.height);
        }

        public setTo(x: number, y: number, width: number, height: number): Box2D {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;

            return this;
        }

        public setCSS(clipCSS: string): Box2D {
            if (!clipCSS || clipCSS == "auto")
                return this;
            //TODO: using a regex -> performance testing
            var str = clipCSS.toLowerCase().replace("rect(", "").replace(")", "");
            var values = system.Browser.isWebKit ? str.split(" ") : str.split(",");

            this.x = math.Number.parse(values[3], 0);
            this.y = math.Number.parse(values[0], 0);
            this.width = math.Number.parse(values[1], 0) - this.x;
            this.height = math.Number.parse(values[2], 0) - this.y;

            return this;
        }

        public getCSS(): string {
            return "rect("
                + Math.round(this.y) + "px, "
                + Math.round(this.right) + "px, "
                + Math.round(this.bottom) + "px, "
                + Math.round(this.x) + "px)";
        }

        public copyFrom(value: IRectangleValue): void {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
        }

        public center(ret: geom.Point2D = new geom.Point2D()): geom.Point2D {

            return ret.setTo(this.x + this.width * 0.5, this.y + this.width * 0.5);
        }

        public equals(value: IRectangleValue, difference: number = 0): boolean {
            return Math.abs(this.x - value.x) <= difference
                && Math.abs(this.y - value.y) <= difference
                && Math.abs(this.width - value.width) <= difference
                && Math.abs(this.height - value.height) <= difference;
        }

        public contains(x: number, y: number): boolean {
            return x >= this.x
                && x <= (this.x + this.width)
                && y >= this.y
                && y <= (this.y + this.height);
        }

        public containsRect(r: IRectangleValue): boolean {
            if (!this.contains(r.x, r.y)
                || !this.contains(r.x + r.width, r.y + r.height)
                || !this.contains(r.x + r.width, r.y)
                || !this.contains(r.x, r.y + r.height)
                )
                return false;
            return true;
        }

        public copyFromClientRect(rect: ClientRect): Box2D {
            this.x = rect.left;
            this.y = rect.top;
            this.width = rect.width;
            this.height = rect.height;
            return this;
        }

        public get right(): number {
            return this.x + this.width;
        }

        public set right(value: number) {
            this.width = value - this.x;
        }
        
        public get bottom(): number {
            return this.y + this.height;
        }
        
        public set bottom(value: number) {
            this.height = value - this.y;
        }

        public intersects(r: IRectangleValue): boolean {
            if (this.contains(r.x, r.y)
                || this.contains(r.x + r.width, r.y + r.height)
                || this.contains(r.x + r.width, r.y)
                || this.contains(r.x, r.y + r.height)
                )
                return true;
            return false;
        }

        //        public static extract(visual: HTMLElement, ret: Point3D = new Point3D()): Box2D {
        //            //            
        //            return new Box2D(0, 0,
        //                visual.offsetWidth,
        //                visual.offsetHeight);
        ////            var bnds = visual.getClientRects()[0];
        ////            return new Box2D(bnds.left, bnds.top,
        ////                bnds.width,
        ////                bnds.height);
        //        }
        
        public static getBounds(element: HTMLElement, ret: Box2D = new Box2D()): Box2D {
            ret.copyFromClientRect(element.getBoundingClientRect());
            if (system.Browser.isWebKit) {
                ret.x += document.body.scrollLeft;
                ret.y += document.body.scrollTop;
            }
            else {
                ret.x += document.documentElement.scrollLeft;
                ret.y += document.documentElement.scrollTop;
            }
            return ret;
        }

        public static getClip(element: HTMLElement, style: CSSStyleDeclaration, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            if (!style.clip || style.clip == "auto") {
                ret.x = 0;
                ret.y = 0;
                ret.width = element.offsetWidth;
                ret.height = element.offsetHeight;
                return ret;
            }
            ret.setCSS(style.clip);
            return ret;
        }

        public dispose(): void {
        }

        public static qualifiedClassName: string = "jsidea.geom.Box2D";
        public toString(): string {
            return "[" + Box2D.qualifiedClassName
                + " x=" + this.x
                + " y=" + this.y
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }
    }
}