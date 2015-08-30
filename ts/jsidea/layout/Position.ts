module jsidea.layout {
    export interface IPositionTo {
        x?: any;
        y?: any;
        offsetX?: any;
        offsetY?: any;
        boxModel?: IBoxModel;
    }
    export interface IPositionFrom extends IPositionTo, math.ILimit {
        element?: HTMLElement;
    }
    export interface IPositionBounds extends math.ILimit {
        element?: HTMLElement;
        boxModel?: IBoxModel;
        toBoxModel?: IBoxModel;
    }
    export class Position {
        public to: IPositionTo = {};
        public from: IPositionFrom = {};
        public bounds: IPositionBounds = {};
        public snap: Snap = null;
        public move: Move = new Move();

        private static _from: geom.Transform = new geom.Transform();
        private static _bounds: geom.Transform = new geom.Transform();

        constructor() {
        }

        public static create(): Position {
            return new Position();
        }

        public clone(): Position {
            return (new Position()).copyFrom(this);
        }

        public copyFrom(position: Position): Position {
            this.to = position.to;
            this.from = position.from;
            this.bounds = position.bounds;
            this.move = position.move;
            return this;
        }

        public static apply(position: Position, element: HTMLElement): geom.Transform {
            if (!element)
                return null;
            var transform = geom.Transform.create(element);
            Position.transform(position, transform);
            transform.matrix.getPosition(position.move.position);
            Move.apply(position.move, transform);
            return transform;
        }
        
        public static element(position: Position, element: HTMLElement): geom.Transform {
            return Position.transform(position, geom.Transform.create(element));
        }

        public static transform(position: Position, transform: geom.Transform): geom.Transform {
            if (!transform)
                return null;

            //retrieve "of"-element
            var fromElement = position.from.element || transform.element.ownerDocument.documentElement;

            Position._from.update(fromElement);

            var toBox = position.to.boxModel || BoxModel.BORDER;
            var fromBox = position.from.boxModel || BoxModel.BORDER;
            
            //transform box-models of "to"
            var sizeTo = transform.size.bounds(toBox);
            var toX: number = math.Number.relation(position.to.x, sizeTo.width, 0) + math.Number.relation(position.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(position.to.y, sizeTo.height, 0) + math.Number.relation(position.to.offsetY, sizeTo.height, 0);
            
            //transform box-models of "from"
            var sizeFrom = Position._from.size.bounds(fromBox);
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
            var lc = Position._from.localToLocal(transform, fromX, fromY, 0, fromBox, toBox);
            lc.x -= toX;
            lc.y -= toY;

            var matrix = new geom.Matrix3D();
            matrix.appendPositionRaw(lc.x, lc.y, 0);
            transform.prepend(matrix);

            if (position.snap)
                Snap.transform(position.snap, transform);

            return transform;
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.bounds = null;
            this.move = null;
        }

        public static qualifiedClassName: string = "jsidea.layout.Position";
        public toString(): string {
            return "[" + Position.qualifiedClassName + "]";
        }
    }
}