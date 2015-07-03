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
            return "[" + this.qualifiedClassName()
                + " originX=" + this.origin.x
                + " originY=" + this.origin.y
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
        
        public static focalToFieldOfView(focalLength: number, origin: IPoint2DValue): number {
            return Math.atan(origin.x / focalLength) * 360 / Math.PI;
        }

        public static fieldOfViewToFocal(fieldOfView: number, origin: IPoint2DValue): number {
            return 1 / (Math.tan(fieldOfView / (360 / Math.PI)) / origin.x);
        }

        public static fieldOfViewToPerspective(fieldOfView: number, origin: IPoint2DValue): number {
            return Math.sqrt(origin.x * origin.x + origin.y * origin.y) / Math.tan((fieldOfView * 0.5) * Math.PI / 180);
        }

        public static perspectiveToFieldOfView(perspective: number, origin: IPoint2DValue): number {
            return Math.atan(Math.sqrt(origin.x * origin.x + origin.y * origin.y) / perspective) / (Math.PI / 360);
        }

        public static perspectiveToFocal(perspective: number, origin: IPoint2DValue): number {
            var fov: number = this.perspectiveToFieldOfView(perspective, origin);
            return this.fieldOfViewToFocal(fov, origin);
        }

        public static focalToPerspective(focalLength: number, origin: IPoint2DValue): number {
            var fov: number = this.focalToFieldOfView(focalLength, origin);
            return this.fieldOfViewToPerspective(fov, origin);
        }
    }
}