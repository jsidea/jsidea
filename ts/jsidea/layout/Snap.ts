module jsidea.layout {
    export interface ISnapGrid {
        element?: HTMLElement;
        boxModel?: IBoxModel;
        x?: any;
        y?: any;
        offsetX?: any;
        offsetY?: any;
    }
    export interface ISnapTo {
        element?: HTMLElement;
        x?: any;
        y?: any;
        offsetX?: any;
        offsetY?: any;
        boxModel?: IBoxModel;
    }
    export class Snap {
        public mode: ISnapMode = SnapMode.BASIC;
        public to: ISnapTo = {};
        public grid: ISnapGrid = {};

        public static DEFAULT: Snap = new Snap();

        private static _grid: geom.Transform = new geom.Transform();

        public static element(snap: Snap, element: HTMLElement): geom.Transform {
            return Snap.transform(snap, geom.Transform.create(element));
        }

        public static transform(snap: Snap, transform: geom.Transform): geom.Transform {
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
            lc.subPoint(off);
            lc.z = 0;
            
            var matrix = new geom.Matrix3D();
            matrix.appendPosition(lc);
            transform.prepend(matrix);

            return transform;
        }
    }
}