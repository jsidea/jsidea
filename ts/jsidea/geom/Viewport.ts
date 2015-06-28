module jsidea.geom {
    export interface IViewportValue {
        origin: Point2D;
        width: number;
        height: number;
    }
    export class Viewport implements IViewportValue {

        public focalLength: number = 500;

        constructor(
            public width: number = 0,
            public height: number = 0,
            public origin = new Point2D()) {
        }

        public clone(): Viewport {
            return new Viewport(
                this.width,
                this.height,
                this.origin.clone());
        }

        public copyFrom(value: IViewportValue): void {
            this.width = value.width;
            this.height = value.height;
            this.origin.copyFrom(value.origin);
        }

        public focalToFieldOfView(focalLength: number): number {
            return Math.atan(this.origin.x / focalLength) * 360 / Math.PI;
        }

        public fieldOfViewToFocal(fieldOfView: number): number {
            return 1 / (Math.tan(fieldOfView / (360 / Math.PI)) / this.origin.x);
        }

        public fieldOfViewToPerspective(fieldOfView: number): number {
            return Math.sqrt(this.origin.x * this.origin.x + this.origin.y * this.origin.y) / Math.tan((fieldOfView * 0.5) * Math.PI / 180);
        }

        public perspectiveToFieldOfView(perspective: number): number {
            return Math.atan(Math.sqrt(this.origin.x * this.origin.x + this.origin.y * this.origin.y) / perspective) / (Math.PI / 360);
        }

        public perspectiveToFocal(perspective: number): number {
            var fov: number = this.perspectiveToFieldOfView(perspective);
            return this.fieldOfViewToFocal(fov);
        }

        public focalToPerspective(focalLength: number): number {
            var fov: number = this.focalToFieldOfView(focalLength);
            return this.fieldOfViewToPerspective(fov);
        }

        public fromElement(visual: HTMLElement): Viewport {
            //            while (!visual.style.perspective) {
            //                if(visual.style.perspective)
            //                    break;
            //                visual = visual.parentElement;
            //                if (!visual)
            //                    return this;
            //            }
            
            //            visual = this.getPar(visual);
            var style = window.getComputedStyle(visual);
            var perspective = style.perspective;
            if (!perspective) {
                console.warn("SET DEFAULT PERSPECTIVE: 600px");
                perspective = "600px";
            }
            this.width = visual.clientWidth;
            this.height = visual.clientHeight;
            //            this.focalLength = parseFloat(style.perspective.replace("px", ""));
            this.focalLength = math.Number.parse(perspective, 0);//parseFloat(perspective.replace("px", ""));

//            console.log(perspective, this.focalLength);
            
            this.origin.copyFrom(Viewport.extractPerspectiveOrigin(visual, style.perspectiveOrigin));
            return this;
        }

        private getPar(visual: HTMLElement): HTMLElement {
            if (!visual)
                return null;
            var st = window.getComputedStyle(visual);
            if (!st.perspective || st.perspective == "none") {
                return this.getPar(visual.parentElement);
            }
            return visual;
        }

        private getPersp(visual: HTMLElement): string {
            if (!visual)
                return "";
            var st = window.getComputedStyle(visual);
            if (!st.perspective || st.perspective == "none") {
                return this.getPersp(visual.parentElement);
            }
            return st.perspective;
        }

        private getOri(visual: HTMLElement): string {
            if (!visual)
                return "";
            var st = window.getComputedStyle(visual);
            if (!st.perspectiveOrigin) {
                return this.getPersp(visual.parentElement);
            }
            return st.perspectiveOrigin;
        }


        public dispose(): void {
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Viewport";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() +
                + " origin.x=" + this.origin.x
                + " origin.y=" + this.origin.y
                + " width=" + this.width
                + " height=" + this.height
                + "]";
        }

        private static extractPerspectiveOrigin(visual: HTMLElement, cssStr: string, ret: Point3D = new Point3D()): Point3D {
            var vals = cssStr.split(" ");
            return ret.setTo(
                math.Number.parseRelation(vals[0], visual.offsetWidth, 0),
                math.Number.parseRelation(vals[1], visual.offsetHeight, 0),
                math.Number.parseRelation(vals[3], 0, 0));//2nd parama "focalLength" ?
        }
    }
}