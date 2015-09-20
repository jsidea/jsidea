module jsidea.layout {
    export class Box {

        public element: HTMLElement = null;
        public style: CSSStyleDeclaration;

        public offsetWidth: number = 0;
        public offsetHeight: number = 0;
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

        public scrollLeft: number = 0;
        public scrollTop: number = 0;

        constructor(element?: HTMLElement, style?: CSSStyleDeclaration) {
            if (element)
                this.update(element, style);
        }

        public static create(element?: HTMLElement, style?: CSSStyleDeclaration): Box {
            return new Box(element, style);
        }

        public update(element: HTMLElement, style?: CSSStyleDeclaration): Box {
            if (!element)
                return this.clear();
            style = style || window.getComputedStyle(element);

            this.style = style;
            this.element = element;

            this.offsetWidth = element.offsetWidth;
            this.offsetHeight = element.offsetHeight;
            this.scrollLeft = element.scrollLeft;
            this.scrollTop = element.scrollTop;

            if (system.Browser.isWebKit) {
                if (element == element.ownerDocument.body) {
                    this.scrollLeft = 0;
                    this.scrollTop = 0;
                }
                else if (system.Browser.isWebKit && element == element.ownerDocument.documentElement) {
                    this.scrollLeft = element.ownerDocument.body.scrollLeft;
                    this.scrollTop = element.ownerDocument.body.scrollTop;
                }
            }

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

            this.borderTop = math.Number.parse(style.borderTopWidth, 0);
            this.borderRight = math.Number.parse(style.borderRightWidth, 0);
            this.borderBottom = math.Number.parse(style.borderBottomWidth, 0);
            this.borderLeft = math.Number.parse(style.borderLeftWidth, 0);

            return this;
        }

        public copyFrom(size: Box): Box {
            this.element = size.element;
            this.style = size.style;
            this.offsetWidth = size.offsetWidth;
            this.offsetHeight = size.offsetHeight;
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

        public clone(): Box {
            return (new Box()).copyFrom(this);
        }

        public clear(): Box {
            this.element = null;
            this.style = null;

            this.scrollLeft = 0;
            this.scrollTop = 0;

            this.offsetWidth = 0;
            this.offsetHeight = 0;
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

        public apply(element: HTMLElement): Box {
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

        /**
        * Calculates the bounds of the box-model relative to the toBox-model.
        * @param boxModel The size/bounds-boxModel.
        * @param toBox Where the bounds should be relative to.
        * @return The bounds of the box-model relative to the toBox.
        */
        public bounds(boxModel?: IBoxModel, toBox?: IBoxModel, ret: geom.Rect2D = new geom.Rect2D()): geom.Rect2D {
            boxModel = boxModel || BoxModel.BORDER;
            toBox = toBox || BoxModel.BORDER;

            var pt = new geom.Point3D(0, 0);
            this.transform(pt, boxModel, toBox);

            ret.x = pt.x;
            ret.y = pt.y;
            ret.width = boxModel.width(this);
            ret.height = boxModel.height(this);

            return ret;
        }
        
        /**
        * Transforms a point from one box-model to another. It does not clone the point, it will change it.
        * @param point The point to transform. The coordinate system should be the fromBox-model.
        * @param fromBox Where the point coordinates coming from.
        * @param toBox The target coordinate-system/box-model.
        * @return The transformed point.
        */
        public transform(point: geom.Point3D, fromBox?: IBoxModel, toBox?: IBoxModel): geom.Point3D {
            if (toBox == fromBox)
                return point;
            if (fromBox)
                fromBox.toBorderBox(this, point);
            if (toBox)
                toBox.fromBorderBox(this, point);
            return point;
        }

        public width(boxModel?: IBoxModel): number {
            return (boxModel || BoxModel.BORDER).width(this);
        }

        public height(boxModel?: IBoxModel): number {
            return (boxModel || BoxModel.BORDER).height(this);
        }

        public dispose(): void {
            this.clear();
        }

        public static lookup(boxSizing: string): IBoxModel {
            for (var model in BoxModel) {
                if ((<IBoxModel>model).name == boxSizing)//v != this && 
                    return model;
            }
            return null;
        }
    }
}