module jsidea.layout {
    export interface IMoveLimits {
        minX?: any;
        maxX?: any;
        minY?: any;
        maxY?: any;
        minZ?: any;
        maxZ?: any;
        boxModel?: IBoxModel;
    }
    export class Move {
        public position: geom.Point3D = new geom.Point3D();
        public limits: IMoveLimits = {};
        public mode: IMoveMode = null;
        
        public static DEFAULT: Move = new Move();

        constructor() {
        }

        public static create(): Move {
            return new Move();
        }

        public clone(): Move {
            return (new Move()).copyFrom(this);
        }

        public copyFrom(move: Move): Move {
            this.position.copyFrom(move.position);
            this.limits = move.limits;
            this.mode = move.mode;
            return this;
        }

        public static apply(options: Move, transform: Transform): void {
            if (!transform)
                return;
            options = options || Move.DEFAULT;
            
            var mode = options.mode || MoveMode.TRANSFORM;
            var point = options.position.clone();
            var style = transform.size.style;
            var size = transform.size;
            var element = transform.element;
            
            //the point in "Position"-space
            mode.transform(point, element, style);
            
            //clamp by "limits" property
            var toBox = options.limits.boxModel || BoxModel.BORDER;
            var bounds = size.bounds(toBox);
            math.Number.limits(point, options.limits, bounds.width, bounds.height);
            
            //clamp it by its "natural" limits
            mode.clamp(point, element, style);
            
            //apply the final point
            mode.apply(point, element, style);
        }

        public dispose(): void {
            this.limits = null;
            this.mode = null;
        }
    }
}