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
        visual: JQuery;
    }
    export interface ITransform extends jsidea.core.ICore {
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
        public target: ITransformTarget;

        constructor(target: ITransformTarget = null) {
            this.target = target;
        }

        public get matrix(): IMatrix {
            var m = new Matrix();
            if (!this.target)
                return m;
            m.compose(this.target);
            return m;
        }

        public set matrix(m: IMatrix) {
            if (this.target)
                m.decompose(this.target);
        }

        public get sceneTransform(): IMatrix {
            if (!this.target)
                return null;
            return Transform.getSceneTransform(this.target.visual);
        }

        public get windowTransform(): IMatrix {
            if (!this.target)
                return null;
            return Transform.getWindowTransform(this.target.visual);
        }

        public localToGlobal(x: number, y: number): IPoint {
            return Transform.getLocalToGlobal(this.target.visual, x, y);
        }

        public localToLocal(x: number, y: number, target: ITransform): IPoint {
            var gl = this.localToGlobal(x, y);
            return target.globalToLocal(gl.x, gl.y);
        }

        public globalToLocal(x: number, y: number): IPoint {
            return Transform.getGlobalToLocal(this.target.visual, x, y);
        }

        public refresh(): void {
            if (!this.target || !this.target.visual)
                return;
            this.matrix = Transform.extractMatrix(this.target.visual);
        }

        public dispose(): void {
            this.target = null;
        }

        public qualifiedClassName(): string {
            return "jsidea.geom.Transform";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }

        public static getWindowTransform(visual: JQuery): IMatrix {
            return Transform.getConcatenatedMatrix(visual, true);
        }

        public static getSceneTransform(visual: JQuery): IMatrix {
            return Transform.getConcatenatedMatrix(visual, false);
        }

        public static getGlobalToLocal(visual: JQuery, x: number, y: number): jsidea.geom.IPoint {
            var wt = Transform.getWindowTransform(visual);
            wt.invert();
            return wt.transform(x, y);
        }

        public static getLocalToGlobal(visual: JQuery, x: number, y: number): jsidea.geom.IPoint {
            var wt = Transform.getWindowTransform(visual);
            return wt.transform(x, y);
        }

        private static getConcatenatedMatrix(visual: JQuery, includeOrigin: boolean): IMatrix {
            var matrices: IMatrix[] = [];
            matrices.push(Transform.extractTransform(visual, includeOrigin));
            var p = visual.parent();
            while (p && p.length > 0 && p.get(0) != document) {
                var m = Transform.extractTransform(p, includeOrigin);
                matrices.push(m);
                if (p.get(0) == document.body)// || p.css("display") == "fixed")
                    break;
                p = p.parent();
            }

            var l = matrices.length;
            var m = matrices[l - 1];
            for (var i = l - 2; i >= 0; --i)
                if (!matrices[i].isIdentity())
                    m.concat(matrices[i]);

            return m;
        }

        private static extractTransform(visual: JQuery, includeOrigin: boolean): IMatrix {
            var cachedTransform: ITransformElement = visual.data("jsidea-display-elementtransform");
            if (cachedTransform)
                cachedTransform.validate();

            var matrix = this.extractMatrix(visual);

            if (includeOrigin) {// && p.get(0) == document.body
                var origin = this.extractOrigin(visual);
                var k = matrix.deltaTransform(origin.x, origin.y);
                matrix.tx += origin.x - k.x;
                matrix.ty += origin.y - k.y;
            }

            var htmlElement = visual[0];
            matrix.tx += htmlElement.offsetLeft;
            matrix.ty += htmlElement.offsetTop;

            var isFixed: boolean = htmlElement.ownerDocument ? visual.css("position") == "fixed" : false;
            if (isFixed && htmlElement.parentElement && visual.children().length == 0) {
                matrix.tx -= htmlElement.parentElement.offsetLeft;
                matrix.ty -= htmlElement.parentElement.offsetTop;
            }

            return matrix;
        }

        public static extractMatrix(visual: JQuery): IMatrix {
            var m = new Matrix();
            if (visual.get(0).ownerDocument)
                m.cssMatrix = visual.css("transform");
            else
                console.log(visual);
            return m;
        }

        public static extractOrigin(visual: JQuery): ITransformOrigin {
            var cssStr = visual.get(0).ownerDocument ? visual.css("transform-origin") : "0px 0px";
            //            console.log(cssStr);
            var xStr = cssStr.split(" ")[0];
            var yStr = cssStr.split(" ")[1];
            xStr = xStr ? xStr : "px";
            yStr = yStr ? yStr : "px";

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
                xVal = (xVal / 100) * visual.width();
                xAbsolute = false;
            }
            if (yStr.indexOf("%") >= 0) {
                yVal = parseNumber(yStr.replace("%", ""), 0);
                yValRaw = yVal;
                yVal = (yVal / 100) * visual.height();
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