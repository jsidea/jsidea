namespace jsidea.layout {
    export class Snap {
        public mode: ISnapMode = null;
        public to: ISnapTo = {};
        public grid: ISnapGrid = {};
        public move: Move = new Move();

        public static DEFAULT: Snap = new Snap();

        private static _grid: Transform = new Transform();

        public static apply(snap: Snap, element: HTMLElement): void {
            var transform = Transform.create(element);
            Snap.calc(snap, transform, snap.move.position);
            Move.apply(snap.move, transform);
        }

        public static calcByElement(snap: Snap, element: HTMLElement, ret?: geom.Point3D): geom.Point3D {
            return Snap.calc(snap, Transform.create(element), ret);
        }

        public static calc(snap: Snap, transform: Transform, ret: geom.Point3D = new geom.Point3D()): geom.Point3D {
            if (!transform)
                return;
            snap = snap || Snap.DEFAULT;

            var toBox = snap.to.boxModel || BoxModel.BORDER;
            var gridBox = snap.grid.boxModel || BoxModel.BORDER;
            var gridElement = snap.grid.element || transform.element.ownerDocument.documentElement;

            var grid = Snap._grid.update(gridElement);
            var mode = snap.mode || SnapMode.BASIC;

            //transform box-models of "to"
            var sizeTo = transform.size.bounds(toBox);
            var toX: number = math.Number.relation(snap.to.x, sizeTo.width, 0) + math.Number.relation(snap.to.offsetX, sizeTo.width, 0);
            var toY: number = math.Number.relation(snap.to.y, sizeTo.height, 0) + math.Number.relation(snap.to.offsetY, sizeTo.height, 0);

            var off = new geom.Point3D(toX, toY);
            var point = transform.localToLocalPoint(grid, off, toBox, gridBox);

            //snap in actual coordinate-system
            mode.transform(snap, transform, point);

            var lc = grid.localToLocalPoint(transform, point, gridBox, toBox);
            lc.sub(off);
            lc.z = 0;

            var matrix = new geom.Matrix3D();
            matrix.appendPosition(lc);
            matrix.append(transform.matrix);

            return matrix.getPosition(ret);
        }
    }
}