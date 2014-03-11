module jsidea.geom {
    export interface IPointValue {
        x: number;
        y: number;
    }
    export interface IPoint extends IPointValue {
        clone(): IPoint;
        copyFrom(matrix: IPointValue): void;
        translate(dx: number, dy: number): void;
        length: number;
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

        public copyFrom(value: IPointValue): void {
            this.x = value.x;
            this.y = value.y;
        }

        public translate(dx: number, dy: number): void {
            this.x += dx;
            this.y += dy;
        }

        public get length(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        public toString(): string {
            return "[jsidea.geom.Point"
                + " x=" + this.x
                + " y=" + this.y + "]";
        }
    }
}