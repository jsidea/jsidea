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

        public copyFrom(value: IRectangleValue): void {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
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

        public copyFromCientRect(rect: ClientRect): Box2D {
            this.x = rect.left;
            this.y = rect.top;
            this.width = rect.width;
            this.height = rect.height;
            return this;
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
        
        public static createBoundingBox(element: HTMLElement, ret: Box2D = new Box2D()): Box2D {
            ret.copyFromCientRect(element.getBoundingClientRect());
            if (system.Caps.isWebkit) {
                ret.x += document.body.scrollLeft;
                ret.y += document.body.scrollTop;
            }
            else {
                ret.x += document.documentElement.scrollLeft;
                ret.y += document.documentElement.scrollTop;
            }
            return ret;
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Box2D";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName()
                + " x=" + this.x
                + " y=" + this.y
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }
    }
}