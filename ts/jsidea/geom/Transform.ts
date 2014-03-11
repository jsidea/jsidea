module jsidea.geom {
    export interface ITransformOrigin extends IPointValue {
        xAbsolute: boolean;
        yAbsolute: boolean;
        valueX: number;
        valueY: number;
    }
    export interface ITransformValue extends IPointValue {
        scaleX: number;
        scaleY: number;
        skewX: number;
        skewY: number;
        rotation: number;
    }
    export interface ITransformTarget extends ITransformValue {
        element: JQuery;
    }
    export interface ITransform extends jsidea.core.IDisposable {
        target: ITransformTarget;
        matrix: IMatrix;
        sceneTransform: IMatrix;
        windowTransform: IMatrix;
        refresh(): void;
        localToGlobal(x: number, y: number): IPoint;
        globalToLocal(x: number, y: number): IPoint;
        localToLocal(x: number, y: number, target: ITransform): IPoint;
    }
    export class Transform implements ITransform {
        public target: jsidea.geom.ITransformTarget;

        constructor(target: jsidea.geom.ITransformTarget = null) {
            this.target = target;
        }

        public get matrix(): IMatrix {
            var m = new Matrix();
            if (!this.target)
                return m;
            if (this.target.scaleX != 1 || this.target.scaleY != 1)
                m.scale(this.target.scaleX, this.target.scaleY);
            if (this.target.skewX || this.target.skewY)
                m.skew(this.target.skewX, this.target.skewY);
            if (this.target.rotation != 0)
                m.rotateDegree(this.target.rotation);
            m.translate(this.target.x, this.target.y);
            return m;
        }

        public set matrix(m: IMatrix) {
            if (this.target)
                m.decompose(this.target);
        }

        public get sceneTransform(): IMatrix {
            if (!this.target)
                return null;
            return Transform.getConcatenatedMatrix(this.target.element, false);
        }

        public get windowTransform(): IMatrix {
            if (!this.target)
                return null;
            return Transform.getConcatenatedMatrix(this.target.element, true);
        }

        public localToGlobal(x: number, y: number): IPoint {
            var st = this.windowTransform;
            return st.transform(x, y);
        }

        public localToLocal(x: number, y: number, target: ITransform): IPoint {
            var gl = this.localToGlobal(x, y);
            return target.globalToLocal(gl.x, gl.y);
        }

        public globalToLocal(x: number, y: number): IPoint {
            var st = this.windowTransform;
            st.invert();
            return st.transform(x, y);
        }

        public refresh(): void {
            if (!this.target || !this.target.element)
                return;
            this.matrix = Transform.extractMatrix(this.target.element);
        }

        public dispose(): void {
            this.target = null;
        }

        public toString(): string {
            return "[jsidea.geom.Transform]";
        }

        private static getConcatenatedMatrix(element: JQuery, includeOrigin: boolean): IMatrix {
            var matrices: IMatrix[] = [];
            matrices.push(Transform.extractTransform(element, includeOrigin));
            var p = element.parent();
            while (p && p.length > 0) {
                matrices.push(Transform.extractTransform(p, includeOrigin));
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

        private static extractTransform(element: JQuery, includeOrigin: boolean): IMatrix {
            var cachedDisplayObject: jsidea.display.IDisplayObject = element.data("jsidea-display-object");
            if (cachedDisplayObject) {
                cachedDisplayObject.validate();
            }
            var matrix = this.extractMatrix(element);

            if (includeOrigin) {
                var origin = this.extractOrigin(element);
                var k = matrix.deltaTransform(origin.x, origin.y);
                matrix.x += origin.x - k.x;
                matrix.y += origin.y - k.y;
            }

            matrix.x += element.get(0).offsetLeft;
            matrix.y += element.get(0).offsetTop;
            return matrix;
        }

        public static extractMatrix(element: JQuery): IMatrix {
            var m = new Matrix();
            m.cssMatrix = element.css("transform");
            return m;
        }

        public static extractOrigin(element: JQuery): ITransformOrigin {
            var cssStr = element.css("transform-origin");
            var xStr = cssStr.split(" ")[0];
            var yStr = cssStr.split(" ")[1];
            var xVal, yVal, xValRaw, yValRaw, xAbsolute, yAbsolute;
            if (xStr.indexOf("px") >= 0) {
                xVal = parseNumber(xStr.replace("px", ""), 0);
                xValRaw = xVal;
                xAbsolute = true;
            }
            if (yStr.indexOf("px") >= 0) {
                yVal = parseNumber(yStr.replace("px", ""), 0);
                yValRaw = yVal;
                yAbsolute = true;
            }
            if (xStr.indexOf("%") >= 0) {
                xVal = parseNumber(xStr.replace("%", ""), 0);
                xValRaw = xVal;
                xVal = (xVal / 100) * element.width();
                xAbsolute = false;
            }
            if (yStr.indexOf("%") >= 0) {
                yVal = parseNumber(yStr.replace("%", ""), 0);
                yValRaw = yVal;
                yVal = (yVal / 100) * element.height();
                yAbsolute = false;
            }

            return {
                x: xVal,
                y: yVal,
                xAbsolute: xAbsolute,
                yAbsolute: yAbsolute,
                valueX: xValRaw,
                valueY: yValRaw
            };
        }
    }
}