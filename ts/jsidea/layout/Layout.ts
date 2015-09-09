module jsidea.layout {
    export interface ILayoutTo {
        x?: any;
        y?: any;
        offsetX?: any;
        offsetY?: any;
        boxModel?: IBoxModel;
    }
    export interface ILayoutFrom extends ILayoutTo, math.ILimit {
        element?: HTMLElement;
    }
    export interface ILayoutBounds extends math.ILimit {
        element?: HTMLElement;
        boxModel?: IBoxModel;
        toBoxModel?: IBoxModel;
    }
    export class Layout {
        public to: ILayoutTo = {};
        public from: ILayoutFrom = {};
        public bounds: ILayoutBounds = {};
        public snap: Snap = null;
        public move: Move = new Move();

        private static _from: geom.Transform = new geom.Transform();
        private static _bounds: geom.Transform = new geom.Transform();

        constructor() {
        }

        public static create(): Layout {
            return new Layout();
        }

        public clone(): Layout {
            return (new Layout()).copyFrom(this);
        }

        public copyFrom(position: Layout): Layout {
            this.to = position.to;
            this.from = position.from;
            this.bounds = position.bounds;
            this.move = position.move;
            return this;
        }

        public static apply(position: Layout, element: HTMLElement): geom.Transform {
            if (!element)
                return null;
            var transform = geom.Transform.create(element);
            Layout.transform(position, transform);
            transform.matrix.getPosition(position.move.position);
            Move.apply(position.move, transform);
            return transform;
        }

        public static element(position: Layout, element: HTMLElement): geom.Transform {
            return Layout.transform(position, geom.Transform.create(element));
        }

        public static transform(position: Layout, transform: geom.Transform): geom.Transform {
            if (!transform)
                return null;

            //retrieve "of"-element
            var fromElement = position.from.element || transform.element.ownerDocument.documentElement;

            Layout._from.update(fromElement);

            var toBox = position.to.boxModel || BoxModel.BORDER;
            var fromBox = position.from.boxModel || BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = transform.size.bounds(toBox);
            var toX: number = math.Number.relation(position.to.x, sizeTo.width, 0) + math.Number.relation(position.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(position.to.y, sizeTo.height, 0) + math.Number.relation(position.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = Layout._from.size.bounds(fromBox);
            var fromX: number = math.Number.relation(position.from.x, sizeFrom.width, 0) + math.Number.relation(position.from.offsetX, sizeFrom.width, 0);
            var fromY: number = math.Number.relation(position.from.y, sizeFrom.height, 0) + math.Number.relation(position.from.offsetY, sizeFrom.height, 0);
            
            //clamp from
            if (position.from.minX !== undefined)
                fromX = Math.max(fromX, math.Number.relation(position.from.minX, sizeFrom.width, fromX));
            if (position.from.maxX !== undefined)
                fromX = Math.min(fromX, math.Number.relation(position.from.maxX, sizeFrom.width, fromX));
            if (position.from.minY !== undefined)
                fromY = Math.max(fromY, math.Number.relation(position.from.minY, sizeFrom.height, fromY));
            if (position.from.maxY !== undefined)
                fromY = Math.min(fromY, math.Number.relation(position.from.maxY, sizeFrom.height, fromY)); 

            //calc local position
            var lc = Layout._from.localToLocal(transform, fromX, fromY, 0, fromBox, toBox);
            lc.x -= toX;
            lc.y -= toY;

            //            transform.size.scrollLeft -= lc.x;
            //            transform.size.scrollTop -= lc.y;
            
            var matrix = new geom.Matrix3D();
            matrix.appendPositionRaw(lc.x, lc.y, 0);
            transform.prepend(matrix);

            if (position.snap)
                Snap.transform(position.snap, transform);

            //            var matrix = new geom.Matrix3D();
            //            matrix.appendPositionRaw(lc.x, lc.y, 0);
            //            transform.prepend(matrix);

            return transform;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.bounds = null;
            this.move = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Layout";
        public toString(): string {
            return "[" + Layout.qualifiedClassName + "]";
        }
    }
}