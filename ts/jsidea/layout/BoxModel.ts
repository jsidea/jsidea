module jsidea.layout {
    export interface IBoxModel {
        //convert from border-box to custom box
        fromBorderBox(model: BoxModel, box: geom.Box2D): void;
        //convert from custom-box to border box
        toBorderBox(model: BoxModel, box: geom.Box2D): void;
    }
    class MarginBoxModel implements IBoxModel {
        public fromBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x += model.marginLeft;
            box.y += model.marginTop;
            box.width += model.marginLeft + model.marginRight;
            box.height += model.marginTop + model.marginBottom;
        }
        public toBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x -= model.marginLeft;
            box.y -= model.marginTop;
            box.width -= model.marginLeft + model.marginRight;
            box.height -= model.marginTop + model.marginBottom;
        }
    }
    class BorderBoxModel implements IBoxModel {
        public fromBorderBox(model: BoxModel, box: geom.Box2D): void {
        }
        public toBorderBox(model: BoxModel, box: geom.Box2D): void {
        }
    }
    class PaddingBoxModel implements IBoxModel {
        public fromBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x += model.borderLeft;
            box.y += model.borderTop;
            box.width += model.borderLeft + model.borderRight;
            box.height += model.borderTop + model.borderBottom;
        }
        public toBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x -= model.marginLeft;
            box.y -= model.marginTop;
            box.width -= model.marginLeft + model.marginRight;
            box.height -= model.marginTop + model.marginBottom;
        }
    }
    class ContentBoxModel implements IBoxModel {
        public fromBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x += model.borderLeft + model.paddingLeft;
            box.y += model.borderTop + model.paddingTop;
            box.width += model.borderLeft + model.borderRight + model.paddingLeft + model.paddingRight;
            box.height += model.borderTop + model.borderBottom + model.paddingTop + model.paddingBottom;
        }
        public toBorderBox(model: BoxModel, box: geom.Box2D): void {
            box.x -= model.borderLeft + model.paddingLeft;
            box.y -= model.borderTop + model.paddingTop;
            box.width -= model.borderLeft + model.borderRight + model.paddingLeft + model.paddingRight;
            box.height -= model.borderTop + model.borderBottom + model.paddingTop + model.paddingBottom;
        }
    }
    class CanvasBoxModel implements IBoxModel {
        public fromBorderBox(model: BoxModel, box: geom.Box2D): void {
            if (model.element && model.element instanceof HTMLCanvasElement) {
                var can = <HTMLCanvasElement> model.element;
                var scX = can.width / (can.clientWidth - (model.paddingLeft + model.paddingRight));
                var scY = can.height / (can.clientHeight - (model.paddingTop + model.paddingBottom));
                box.width *= scX;
                box.height *= scY;
                box.x *= scX;
                box.y *= scY;
                box.x += model.paddingLeft + model.borderLeft;
                box.y += model.paddingTop + model.borderTop;
            }
        }
        public toBorderBox(model: BoxModel, box: geom.Box2D): void {
            if (model.element && model.element instanceof HTMLCanvasElement) {
                var can = <HTMLCanvasElement> model.element;
                box.x -= model.paddingLeft + model.borderLeft;
                box.y -= model.paddingTop + model.borderTop;
                var scX = can.width / (can.clientWidth - (model.paddingLeft + model.paddingRight));
                var scY = can.height / (can.clientHeight - (model.paddingTop + model.paddingBottom));
                box.width /= scX;
                box.height /= scY;
                box.x /= scX;
                box.y /= scY;
            }
        }
    }

    export class BoxModel {
        public static MARGIN: IBoxModel = new MarginBoxModel();
        public static BORDER: IBoxModel = new BorderBoxModel();
        public static PADDING: IBoxModel = new PaddingBoxModel();
        public static CONTENT: IBoxModel = new ContentBoxModel();
        public static CANVAS: IBoxModel = new CanvasBoxModel();

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

        constructor(element: HTMLElement = null, style: CSSStyleDeclaration = null) {
            if (element)
                this.update(element, style);
        }

        public static create(element: HTMLElement = null, style: CSSStyleDeclaration = null): BoxModel {
            return new BoxModel(element, style);
        }

        public update(element: HTMLElement, style: CSSStyleDeclaration = null): BoxModel {
            if (!element)
                return this.clear();
            if (!style) {
                style = window.getComputedStyle(element);
            }

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

        public clone(): BoxModel {
            return new BoxModel();
        }

        public clear(): BoxModel {
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
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.BoxModel";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}