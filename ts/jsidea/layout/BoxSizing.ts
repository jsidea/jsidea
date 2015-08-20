module jsidea.layout {
    export class BoxSizing implements IDisposable {

        public element: HTMLElement = null;
        public style: CSSStyleDeclaration;
        public width: number = 0;
        public height: number = 0;
        public parentWidth: number = 0;
        public parentHeight: number = 0;

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

            if (element.parentElement) {
                this.parentWidth = element.parentElement.clientWidth;
                this.parentHeight = element.parentElement.clientHeight;
            }
            else {
                this.parentWidth = window.innerWidth;
                this.parentHeight = window.innerHeight;
            }

            var w = this.parentWidth;
            var h = this.parentHeight;
            this.marginTop = math.Number.relation(style.marginTop, h, 0);
            this.marginRight = math.Number.relation(style.marginRight, w, 0);
            this.marginBottom = math.Number.relation(style.marginBottom, h, 0);
            this.marginLeft = math.Number.relation(style.marginLeft, w, 0);

            this.paddingTop = math.Number.relation(style.paddingTop, h, 0);
            this.paddingRight = math.Number.relation(style.paddingRight, w, 0);
            this.paddingBottom = math.Number.relation(style.paddingBottom, h, 0);
            this.paddingLeft = math.Number.relation(style.paddingLeft, w, 0);

            this.borderTop = math.Number.relation(style.borderTopWidth, h, 0);
            this.borderRight = math.Number.relation(style.borderRightWidth, w, 0);
            this.borderBottom = math.Number.relation(style.borderBottomWidth, h, 0);
            this.borderLeft = math.Number.relation(style.borderLeftWidth, w, 0);

            return this;
        }

        public copyFrom(size: BoxSizing): BoxSizing {
            this.element = size.element;
            this.style = size.style;
            this.width = size.width;
            this.height = size.height;
            this.parentWidth = size.parentWidth;
            this.parentHeight = size.parentHeight;

            this.marginTop = size.marginTop;
            this.marginRight = size.marginRight;
            this.marginBottom = size.marginBottom;
            this.marginLeft = size.marginLeft;

            this.paddingTop = size.paddingTop;
            this.paddingRight = size.paddingRight;
            this.paddingBottom = size.paddingBottom;
            this.paddingLeft = size.paddingLeft;

            this.borderTop = size.borderTop;
            this.borderRight = size.borderRight;
            this.borderBottom = size.borderBottom;
            this.borderLeft = size.borderLeft;

            return this;
        }

        public clone(): BoxSizing {
            return (new BoxSizing()).copyFrom(this);
        }

        public clear(): BoxSizing {
            this.element = null;
            this.style = null;
            this.width = 0;
            this.height = 0;
            this.parentWidth = 0;
            this.parentHeight = 0;

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

        public getBox(fromBox?: IBoxModel, toBox?: IBoxModel, box: geom.Box2D = new geom.Box2D()): geom.Box2D {
            box.x = 0;
            box.y = 0;
            box.width = this.width;
            box.height = this.height;
            return this.convert(box, fromBox, toBox);
        }
        
        //converts sizes between different boxes
        public convert(box: geom.Box2D, fromBox?: IBoxModel, toBox?: IBoxModel): geom.Box2D {
            if (toBox === fromBox)
                return box;
            if (fromBox)
                fromBox.toBorderBox(this, box);
            if (toBox)
                toBox.fromBorderBox(this, box);
            return box;
        }

        public point(point: geom.Point3D, fromBox?: IBoxModel, toBox?: IBoxModel): geom.Point3D {
            if (toBox == fromBox)
                return point;
            //            var box = Buffer._POINT_MODEL;
            var box = new geom.Box2D();
            box.x = point.x;
            box.y = point.y;
            box.width = this.width;
            box.height = this.height;
            this.convert(box, fromBox, toBox);
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