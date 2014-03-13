module jsidea.geom {
    export interface IPointValue {
        x: number;
        y: number;
    }
    export interface IPoint extends IPointValue, jsidea.core.ICore {
        clone(): IPoint;
        copyFrom(matrix: IPointValue): void;
        translate(dx: number, dy: number): void;
        length: number;
        normalize(): void;
        distance(x: number, y: number): number;
    }
    export class Point implements IPoint {

        constructor(
            public x: number = 0,
            public y: number = 0) {
        }

        public clone(): IPoint {
            return new Point(
                this.x,
                this.y);
        }

        public normalize(): void {
            var l = this.length;
            this.x = this.x / l;
            this.y = this.y / l;
        }

        public copyFrom(value: IPointValue): void {
            this.x = value.x;
            this.y = value.y;
        }

        public distance(x: number, y: number): number {
            var dx = this.x - x;
            var dy = this.y - y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        public translate(dx: number, dy: number): void {
            this.x += dx;
            this.y += dy;
        }

        public get length(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
            //            return parseFloat(Math.sqrt(this.x * this.x + this.y * this.y).toPrecision(10));
        }

        public dispose(): void {
        }
        
        public qualifiedClassName(): string {
            return "jsidea.geom.Point";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + 
                + " x=" + this.x
                + " y=" + this.y + "]";
        }
    }
}