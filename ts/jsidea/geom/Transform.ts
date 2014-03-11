module jsidea.geom {
    export interface ITransformTarget extends IPointValue {
        scaleX: number;
        scaleY: number;
        skewX: number;
        skewY: number;
        rotation: number;
    }
    export interface ITransform {
        matrix: IMatrix;
        sceneTransform: IMatrix;
        refresh(): void;
    }
    export class Transform implements ITransform {

        private _target: jsidea.display.IDisplayObject;

        constructor(target: jsidea.display.IDisplayObject) {
            this._target = target;
        }

        public get matrix(): IMatrix {
            var m = new Matrix();
            if (this._target.scaleX != 1 || this._target.scaleY != 1)
                m.scale(this._target.scaleX, this._target.scaleY);
            if (this._target.skewX || this._target.skewY)
                m.skew(this._target.skewX, this._target.skewY);
            if (this._target.rotation != 0)
                m.rotateDegree(this._target.rotation);
            m.translate(this._target.x, this._target.y);

            //            m.originBox(
            //                this._target.x,
            //                this._target.y,
            //                this._target.originX,
            //                this._target.originY,
            //                this._target.scaleX,
            //                this._target.scaleY,
            //                this._target.rotation);

            return m;
        }

        public set matrix(m: IMatrix) {
            m.decompose(this._target);
        }

        public get sceneTransform(): IMatrix {
            var matrices: IMatrix[] = [];
            matrices.push(this.extractSceneTransform(this._target.element));
            var p = this._target.element.parent();
            while (p && p.length > 0) {
                matrices.push(this.extractSceneTransform(p));
                if (p.get(0) == document.body)
                    break;
                p = p.parent();
            }

            var l = matrices.length;
            var m = matrices[l - 1];
            for (var i = l - 2; i >= 0; --i) {
                m.concat(matrices[i]);
            }

            return m;
        }

        public refresh(): void {
            this.matrix = this.extractMatrix(this._target.element);
        }

        private extractSceneTransform(element: JQuery): IMatrix {
            var m = this.extractMatrix(element);
            m.x += element.get(0).offsetLeft;
            m.y += element.get(0).offsetTop;
            return m;
        }

        private extractMatrix(element: JQuery): IMatrix {
            var m = new Matrix();
            m.css = element.css("transform");
            return m;
        }

        public toString(): string {
            return "[jsidea.geom.Transform]";
        }
    }
}