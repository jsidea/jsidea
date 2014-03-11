module jsidea.geom {
    export interface IRectangleValue extends IPointValue {
        width: number;
        height: number;
    }
    export interface IRectangle extends IRectangleValue, jsidea.core.IDisposable {
        clone(): IRectangle;
        copyFrom(rectangle: IRectangleValue): void;
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

        public containsRect(rectangle: IRectangleValue): boolean {
            return false;
        }
        
        public dispose(): void {
        }

        public toString(): string {
            return "[jsidea.geom.Rectangle"
                + " x=" + this.x
                + " y=" + this.y
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }
    }
}