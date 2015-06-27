module jsidea.geom {
    export interface IViewportValue {
        originX: number;
        originY: number;
        width: number;
        height: number;
    }
    export class Viewport implements IViewportValue {

        public focalLength: number = 500;

        constructor(
            public width: number = 0,
            public height: number = 0,
            public originX: number = 0,
            public originY: number = 0) {
        }

        public clone(): Viewport {
            return new Viewport(
                this.width,
                this.height,
                this.originX,
                this.originY);
        }

        public copyFrom(value: IViewportValue): void {
            this.width = value.width;
            this.height = value.height;
            this.originX = value.originX;
            this.originY = value.originY;
        }

        public focalToFieldOfView(focalLength: number): number {
            return Math.atan(this.originX / focalLength) * 360 / Math.PI;
        }

        public fieldOfViewToFocal(fieldOfView: number): number {
            return 1 / (Math.tan(fieldOfView / (360 / Math.PI)) / this.originX);
        }

        public fieldOfViewToPerspective(fieldOfView: number): number {
            return Math.sqrt(this.originX * this.originX + this.originY * this.originY) / Math.tan((fieldOfView * 0.5) * Math.PI / 180);
        }

        public perspectiveToFieldOfView(perspective: number): number {
            return Math.atan(Math.sqrt(this.originX * this.originX + this.originY * this.originY) / perspective) / (Math.PI / 360);
        }

        public perspectiveToFocal(perspective: number): number {
            var fov: number = this.perspectiveToFieldOfView(perspective);
            return this.fieldOfViewToFocal(fov);
        }

        public focalToPerspective(focalLength: number): number {
            var fov: number = this.focalToFieldOfView(focalLength);
            return this.fieldOfViewToPerspective(fov);
        }

        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Viewport";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() +
                + " originX=" + this.originX
                + " originY=" + this.originY
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }
    }
}