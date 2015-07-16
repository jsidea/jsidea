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

        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        constructor(
            public my: IPositionValue = {},
            public at: IPositionValue = {},
            public of: HTMLElement = null,
            public boxModel: string = "border-box") {
        }

        public clone(): Position {
            return new Position(this.my, this.at, this.of);
        }

        public point(visual: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.IPoint3DValue {
            if (!visual)
                return null;

            var visualWidth = visual.offsetWidth;//CONTENT-WIDTH + PADDING-HORZ + BORDER-HORZ
            var visualHeight = visual.offsetHeight;//CONTENT-HEIGHT + PADDING-VERT + BORDER-VERT
            
            var st = window.getComputedStyle(visual);
            if (this.boxModel == "content-box") {
                visualWidth -= math.Number.parse(st.paddingLeft, 0) + math.Number.parse(st.paddingRight, 0);
                visualHeight -= math.Number.parse(st.paddingTop, 0) + math.Number.parse(st.paddingBottom, 0);
            }
            if (this.boxModel == "content-box" || this.boxModel == "padding-box") {
                visualWidth -= math.Number.parse(st.borderLeftWidth, 0) + math.Number.parse(st.borderRightWidth, 0);
                visualHeight -= math.Number.parse(st.borderTopWidth, 0) + math.Number.parse(st.borderBottomWidth, 0);
            }
            if (this.boxModel == "margin-box") {
                visualWidth += math.Number.parse(st.marginLeft, 0) + math.Number.parse(st.marginRight, 0);
                visualHeight += math.Number.parse(st.marginTop, 0) + math.Number.parse(st.marginBottom, 0);
            }

            var myOriginX: number = math.Number.parseRelation(this.my.px, visualWidth, 0);
            var myOriginY: number = math.Number.parseRelation(this.my.py, visualHeight, 0);
            var myOffsetX: number = math.Number.parseRelation(this.my.x, visualWidth, 0);
            var myOffsetY: number = math.Number.parseRelation(this.my.y, visualHeight, 0);

            var of: any = this.of ? this.of : visual.parentElement;
            var atW = of.offsetWidth;
            var atH = of.offsetHeight;
            var atOffsetX: number = math.Number.parseRelation(this.at.x, atW, 0);
            var atOffsetY: number = math.Number.parseRelation(this.at.y, atH, 0);
            var atOriginX: number = math.Number.parseRelation(this.at.px, atW, 0);
            var atOriginY: number = math.Number.parseRelation(this.at.py, atH, 0);

            var lc = geom.Transform.extract(of).localToLocal(
                visual,
                atOffsetX - atOriginX,
                atOffsetY - atOriginY,
                0,
                this.boxModel);
            lc.x += myOffsetX - myOriginX;
            lc.y += myOffsetY - myOriginY;

            return geom.Matrix3D.extract(visual).project(lc);
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

            if (Position.isFirefox) {
                var m = geom.Matrix3D.extract(visual);
                m.m41 = pt.x;
                m.m42 = pt.y;
                visual.style.transform = m.getCSS();
            }
            else {
                var m2D = geom.Matrix2D.extract(visual, Position.TMP);
                m2D.m31 = pt.x;
                m2D.m32 = pt.y;
                visual.style.transform = m2D.getCSS();
            }
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