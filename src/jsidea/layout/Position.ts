module jsidea.layout {
    export class Position {
        public to: IPositionTo = {};
        public from: IPositionFrom = {};
        public snap: Snap = null;
        public move: Move = new Move();

        private static _from: Transform = new Transform();
        private static _bounds: Transform = new Transform();

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
            this.move = position.move;
            return this;
        }

        public static apply(position: Position, element: HTMLElement): void {
            if (!element)
                return null;
            
            var transform = Transform.create(element);
            Position.calc(position, transform, position.move.position);
            Move.apply(position.move, transform);

            if (position.snap) {
                //maybe optional
                position.snap.move.mode = position.move.mode;
                
                Snap.apply(position.snap, element);
            }
        }

        public static calcByElement(position: Position, element: HTMLElement): geom.Point3D {
            return Position.calc(position, Transform.create(element));
        }

        public static calc(position: Position, transform: Transform, ret: geom.Point3D = new geom.Point3D()): geom.Point3D {
            if (!transform)
                return ret;

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
            lc.z = 0;

            var matrix = new geom.Matrix3D();
            matrix.appendPositionRaw(lc.x, lc.y, 0);
            matrix.append(transform.matrix);

            return matrix.getPosition(ret);
        }

        public dispose(): void {
            this.to = null;
            this.from = null;
            this.move = null;
        }
    }
}