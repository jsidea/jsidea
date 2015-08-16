module jsidea.layout {
    export class BoxSizing implements IDisposable {

        public element: HTMLElement = null;
        public style: CSSStyleDeclaration;
        public width: number = 0;
        public height: number = 0;

        public marginTop: number = 0;
        public marginRight: number = 0;
        public marginBottom: number = 0;
        public marginLeft: number = 0;

        public borderTop: number = 0;
        public borderRight: number = 0;
        public borderBottom: number = 0;
        public borderLeft: number = 0;

        public paddingTop: number = 0;
        public paddingRight: number = 0;
        public paddingBottom: number = 0;
        public paddingLeft: number = 0;

        constructor(element: HTMLElement = null, style?: CSSStyleDeclaration) {
            if (element)
                this.update(element, style);
        }

        public static create(element: HTMLElement = null, style?: CSSStyleDeclaration): BoxSizing {
            return new BoxSizing(element, style);
        }

        public update(element: HTMLElement, style?: CSSStyleDeclaration): BoxSizing {
            if (!element)
                return this.clear();
            style = style || window.getComputedStyle(element);

            this.style = style;
            this.element = element;

            this.width = element.offsetWidth;
            this.height = element.offsetHeight;

            this.marginTop = math.Number.parse(style.marginTop, 0);
            this.marginRight = math.Number.parse(style.marginRight, 0);
            this.marginBottom = math.Number.parse(style.marginBottom, 0);
            this.marginLeft = math.Number.parse(style.marginLeft, 0);

            this.paddingTop = math.Number.parse(style.paddingTop, 0);
            this.paddingRight = math.Number.parse(style.paddingRight, 0);
            this.paddingBottom = math.Number.parse(style.paddingBottom, 0);
            this.paddingLeft = math.Number.parse(style.paddingLeft, 0);

            this.borderTop = math.Number.parse(style.borderTopWidth, 0);
            this.borderRight = math.Number.parse(style.borderRightWidth, 0);
            this.borderBottom = math.Number.parse(style.borderBottomWidth, 0);
            this.borderLeft = math.Number.parse(style.borderLeftWidth, 0);

            return this;
        }

        public clone(): BoxSizing {
            return new BoxSizing();
        }

        public clear(): BoxSizing {
            this.element = null;
            this.style = null;
            this.width = 0;
            this.height = 0;

            this.marginTop = 0;
            this.marginRight = 0;
            this.marginBottom = 0;
            this.marginLeft = 0;

            this.paddingTop = 0;
            this.paddingRight = 0;
            this.paddingBottom = 0;
            this.paddingLeft = 0;

            this.borderTop = 0;
            this.borderRight = 0;
            this.borderBottom = 0;
            this.borderLeft = 0;

            return this;
        }

        public apply(element: HTMLElement): BoxSizing {
            var style = element.style;
            //TODO:
            //keep units here (percentage should keep percentage)
            style.marginTop = this.marginTop + "px";
            style.marginRight = this.marginRight + "px";
            style.marginBottom = this.marginBottom + "px";
            style.marginLeft = this.marginLeft + "px";

            style.paddingTop = this.paddingTop + "px";
            style.paddingRight = this.paddingRight + "px";
            style.paddingBottom = this.paddingBottom + "px";
            style.paddingLeft = this.paddingLeft + "px";

            style.borderTop = this.borderTop + "px";
            style.borderRight = this.borderRight + "px";
            style.borderBottom = this.borderBottom + "px";
            style.borderLeft = this.borderLeft + "px";

            return this;
        }

        public getBox(toBox?: IBoxModel, fromBox?: IBoxModel, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            ret.x = 0;
            ret.y = 0;
            ret.width = this.width;
            ret.height = this.height;
            return this.convert(ret, toBox, fromBox);
        }
        
        //converts sizes between different boxes
        public convert(box: geom.Box2D, toBox?: IBoxModel, fromBox?: IBoxModel): geom.Box2D {
            if (toBox === fromBox)
                return box;
            if (fromBox)
                fromBox.toBorderBox(this, box);
            if (toBox)
                toBox.fromBorderBox(this, box);
            return box;
        }

        public point(point: geom.Point3D, toBox?: IBoxModel, fromBox?: IBoxModel): geom.Point3D {
            if (toBox == fromBox)
                return point;
            //            var box = Buffer._POINT_MODEL;
            var box = new geom.Box2D();
            box.x = point.x;
            box.y = point.y;
            box.width = this.width;
            box.height = this.height;
            this.convert(box, toBox, fromBox);
            return point.setTo(box.x, box.y, 0);
        }

        public dispose(): void {
            this.clear();
        }

        public static qualifiedClassName: string = "jsidea.layout.Size";
        public toString(): string {
            return "[" + BoxSizing.qualifiedClassName + "]";
        }
    }
}