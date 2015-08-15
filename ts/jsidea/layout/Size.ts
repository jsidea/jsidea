module jsidea.layout {
    export class Size implements IDisposable {

        public element: HTMLElement = null;
        public offsetWidth: number = 0;
        public offsetHeight: number = 0;

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

        public static create(element: HTMLElement = null, style?: CSSStyleDeclaration): Size {
            return new Size(element, style);
        }

        public update(element: HTMLElement, style?: CSSStyleDeclaration): Size {
            if (!element)
                return this.clear();
            style = style || window.getComputedStyle(element);

            this.element = element;

            this.offsetWidth = element.offsetWidth;
            this.offsetHeight = element.offsetHeight;

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

        public clone(): Size {
            return new Size();
        }

        public clear(): Size {
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

        public getBox(toBox?: IBoxModel, fromBox?: IBoxModel, ret: geom.Box2D = new geom.Box2D()): geom.Box2D {
            ret.x = 0;
            ret.y = 0;
            ret.width = this.offsetWidth;
            ret.height = this.offsetHeight;
            return this.convert(ret, toBox, fromBox);
        }
        
        //converts sizes between different boxes
        public convert(box: geom.Box2D, toBox?: IBoxModel, fromBox?: IBoxModel): geom.Box2D {
            if (toBox == fromBox)
                return box;
            if (fromBox)
                fromBox.toBorderBox(this, box);
            if (toBox)
                toBox.fromBorderBox(this, box);
            return box;
        }

        public point(point: geom.Point3D, toBox: IBoxModel = null, fromBox?: IBoxModel): geom.Point3D {
            if (toBox == fromBox)
                return point;
            var box = Buffer._POINT_MODEL;
            box.x = point.x;
            box.y = point.y;
            this.convert(box, toBox, fromBox);
            return point.setTo(box.x, box.y, 0);
        }

        public dispose(): void {
            this.element = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Size";
        public toString(): string {
            return "[" + Size.qualifiedClassName + "]";
        }
    }
}