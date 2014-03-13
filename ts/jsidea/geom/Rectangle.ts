module jsidea.geom {
    export interface IRectangleValue extends IPointValue {
        width: number;
        height: number;
    }
    export interface IRectangle extends IRectangleValue, jsidea.core.ICore {
        clone(): IRectangle;
        copyFrom(rectangle: IRectangleValue): void;
        contains(x: number, y: number): boolean;
        containsRect(r: IRectangleValue): boolean;
        intersects(r: IRectangleValue): boolean;
    }
    export class Rectangle implements IRectangle {

        constructor(
            public x: number = 0,
            public y: number = 0,
            public width: number = 0,
            public height: number = 0) {
        }

        public clone(): IRectangle {
            return new Rectangle(
                this.x,
                this.y,
                this.width,
                this.height);
        }

        public copyFrom(value: IRectangleValue): void {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
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

        public intersects(r: IRectangleValue): boolean {
            if (this.contains(r.x, r.y)
                || this.contains(r.x + r.width, r.y + r.height)
                || this.contains(r.x + r.width, r.y)
                || this.contains(r.x, r.y + r.height)
                )
                return true;
            return false;
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Rectangle";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() +
                + " x=" + this.x
                + " y=" + this.y
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }
    }
}