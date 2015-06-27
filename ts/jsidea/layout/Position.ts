module jsidea.layout {
    export interface IPositionValue {
        x?: any;
        y?: any;
        px?: any;
        py?: any;
    }
    export class Position {
        private static TMP: geom.Matrix2D = new geom.Matrix2D();
        private static TMP3: geom.Point2D = new geom.Point2D();
        private static TMP4: geom.Point2D = new geom.Point2D();

        constructor(
            public my: IPositionValue = {},
            public at: IPositionValue = {},
            public of: HTMLElement | Window = null) {
        }

        public clone(): Position {
            return new Position(this.my, this.at, this.of);
        }

        public point(visual: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.IPoint2DValue {
            if (!visual)
                return null;

            var myW = visual.offsetWidth;
            var myH = visual.offsetHeight;
            var myOffsetX: number = math.Number.parseRelation(this.my.x, myW, 0);
            var myOffsetY: number = math.Number.parseRelation(this.my.y, myH, 0);
            var myOriginX: number = math.Number.parseRelation(this.my.px, myW, 0);
            var myOriginY: number = math.Number.parseRelation(this.my.py, myH, 0);

            var of: any = this.of ? this.of : visual.parentElement;
            var atW = of == window ? window.innerWidth : of.offsetWidth;
            var atH = of == window ? window.innerHeight : of.offsetHeight;
            var atOffsetX: number = math.Number.parseRelation(this.at.x, atW, 0);
            var atOffsetY: number = math.Number.parseRelation(this.at.y, atH, 0);
            var atOriginX: number = math.Number.parseRelation(this.at.px, atW, 0);
            var atOriginY: number = math.Number.parseRelation(this.at.py, atH, 0);

            var lc: geom.IPoint2DValue = Position.TMP3.setTo(atOffsetX - atOriginX, atOffsetY - atOriginY);
            var gl = of == window ? lc : geom.Transform.getLocalToGlobal(of, lc.x, lc.y, Position.TMP4);
            lc = geom.Transform.getGlobalToLocal(visual, gl.x, gl.y, Position.TMP3);
            lc.x += myOffsetX - myOriginX;
            lc.y += myOffsetY - myOriginY;

            return geom.Matrix2D.extract(visual, Position.TMP).transformRaw(lc.x, lc.y, ret);
//            return geom.Matrix3D.extract(visual).transformRaw(lc.x, lc.y, 0);
        }

        public apply(visual: HTMLElement): void {
            visual.style.left = "0px";
            visual.style.top = "0px";
            var pt = this.point(visual, Position.TMP3);
            visual.style.left = Math.round(pt.x) + "px";
            visual.style.top = Math.round(pt.y) + "px";
        }

        public transform(visual: HTMLElement): void {
            var pt = this.point(visual);
            var m = geom.Matrix2D.extract(visual, Position.TMP);
            m.m31 = pt.x;
            m.m32 = pt.y;
            visual.style.transform = m.getCSS();
        }

        public dispose(): void {
            this.my = null;
            this.at = null;
            this.of = null;
        }

        public qualifiedClassName(): string {
            return "jsidea.layout.Position";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}