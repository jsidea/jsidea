module jsidea.layout {
    export interface IPositionValue {
        x?: any;
        y?: any;
        px?: any;
        py?: any;
    }
    export class Position {
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        constructor(
            public my: IPositionValue = {},
            public at: IPositionValue = {},
            public of: HTMLElement = null,
            public boxModel: string = "border",
            public useTransform: boolean = true) {
        }

        public clone(): Position {
            return new Position(this.my, this.at, this.of);
        }

        public apply(visual: HTMLElement): void {
            if (!visual)
                return null;

            var visualWidth = visual.offsetWidth;//CONTENT-WIDTH + PADDING-HORZ + BORDER-HORZ
            var visualHeight = visual.offsetHeight;//CONTENT-HEIGHT + PADDING-VERT + BORDER-VERT
            
            var st = window.getComputedStyle(visual);
            if (this.boxModel == "content") {
                visualWidth -= math.Number.parse(st.paddingLeft, 0) + math.Number.parse(st.paddingRight, 0);
                visualHeight -= math.Number.parse(st.paddingTop, 0) + math.Number.parse(st.paddingBottom, 0);
            }
            if (this.boxModel == "content" || this.boxModel == "padding") {
                visualWidth -= math.Number.parse(st.borderLeftWidth, 0) + math.Number.parse(st.borderRightWidth, 0);
                visualHeight -= math.Number.parse(st.borderTopWidth, 0) + math.Number.parse(st.borderBottomWidth, 0);
            }
            if (this.boxModel == "margin") {
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

            var m = geom.Matrix3D.extract(visual);
            var pt = m.project(lc);

            if (this.useTransform) {
                m.m41 = pt.x;
                m.m42 = pt.y;
                //in firefox you can grab the matrix3D and change its position
                //and than just re-apply. But webkit and ie11 kills it.
                visual.style.transform = Position.isFirefox ? m.getCSS() : m.getCSS2D();
            }
            else {
                var oldLeft = math.Number.parse(visual.style.left, 0);//visual.offsetLeft;
                var oldTop = math.Number.parse(visual.style.top, 0);//visual.offsetTop;
                visual.style.left = Math.round(oldLeft + pt.x) + "px";
                visual.style.top = Math.round(oldTop + pt.y) + "px";
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