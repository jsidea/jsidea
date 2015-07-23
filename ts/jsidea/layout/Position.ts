module jsidea.layout {
    export interface IPositionValue {
        x?: any;
        y?: any;
        px?: any;
        py?: any;
    }
    export class Position {
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        private _box: geom.BoxModel = new geom.BoxModel();

        public to: IPositionValue = {};
        public from: IPositionValue = {};
        public fromElement: HTMLElement = null;
        public toBox: string = "border";
        public fromBox: string = "padding";
        public useTransform: boolean = true;

        constructor() {
        }

        public clone(): Position {
            var p = new Position();
            p.to = this.to;
            p.from = this.from;
            p.from = this.from;
            p.toBox = this.toBox;
            p.fromBox = this.fromBox;
            p.useTransform = this.useTransform;
            return p;
        }

        public apply(visual: HTMLElement): void {
            if (!visual)
                return;

            //retrieve of-element
            var fromElement = this.fromElement ? this.fromElement : document.body;
            
            //transform box-models of visual
            this._box.parse(visual);
            var sizeVisual = new geom.Point2D(visual.offsetWidth, visual.offsetHeight);
            this._box.size(sizeVisual, this.toBox, "border");

            var myOriginX: number = math.Number.parseRelation(this.to.px, sizeVisual.x, 0);
            var myOriginY: number = math.Number.parseRelation(this.to.py, sizeVisual.y, 0);
            var myOffsetX: number = math.Number.parseRelation(this.to.x, sizeVisual.x, 0);
            var myOffsetY: number = math.Number.parseRelation(this.to.y, sizeVisual.y, 0);

            //transform box-models of from
            this._box.parse(fromElement);
            var sizeOffset = new geom.Point2D(fromElement.offsetWidth, fromElement.offsetHeight);
            this._box.size(sizeOffset, this.fromBox, "border");

            var atOffsetX: number = math.Number.parseRelation(this.from.x, sizeOffset.x, 0);
            var atOffsetY: number = math.Number.parseRelation(this.from.y, sizeOffset.y, 0);
            var atOriginX: number = math.Number.parseRelation(this.from.px, sizeOffset.x, 0);
            var atOriginY: number = math.Number.parseRelation(this.from.py, sizeOffset.y, 0);

            //the pageX pageY is wrong firefox?
            if(Position.isFirefox && fromElement == document.body)
            {
                atOffsetX += fromElement.clientLeft;
                atOffsetY += fromElement.clientTop;
            }            
            
            //the transfrom from "from" to visual
            var lc = geom.Transform.extract(fromElement).localToLocal(
                visual,
                atOffsetX - atOriginX,
                atOffsetY - atOriginY,
                0,
                this.toBox,
                this.fromBox);
            lc.x += myOffsetX - myOriginX;
            lc.y += myOffsetY - myOriginY;
            

            var m = geom.Matrix3D.extract(visual);
            var pt = m.project(lc);

            if (this.useTransform) {
                m.m41 = pt.x;
                m.m42 = pt.y;
                visual.style.transform = m.getCSS();
                
                //----------->>>>>>>>>> BUG DISAPPEARED????
                //in firefox you can grab the matrix3D and change its position
                //and than just re-apply. But webkit and ie11 kills it.
                //visual.style.transform = Position.isFirefox ? m.getCSS() : m.getCSS2D();
            }
            else {
                var oldLeft = math.Number.parse(visual.style.left, 0);//visual.offsetLeft;
                var oldTop = math.Number.parse(visual.style.top, 0);//visual.offsetTop;
                visual.style.left = Math.round(oldLeft + pt.x) + "px";
                visual.style.top = Math.round(oldTop + pt.y) + "px";
            }
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.from = null;
        }

        public qualifiedClassName(): string {
            return "jsidea.layout.Position";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}