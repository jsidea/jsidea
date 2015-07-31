module jsidea.geom {
    export interface IPoint2DValue {
        x: number;
        y: number;
    }
    export class Point2D implements IPoint2DValue {

        public static X_AXIS: Point2D = new Point2D(1, 0);
        public static Y_AXIS: Point2D = new Point2D(0, 1);

        constructor(
            public x: number = 0,
            public y: number = 0) {
        }

        public static create(
            x: number = 0,
            y: number = 0): Point2D {
            return new Point2D(x, y);
        }

        public getData(): number[] {
            return [this.x, this.y];
        }

        public setData(data: number[], offset: number = 0): Point2D {
            if (data === undefined)
                return;
            this.x = data[0 + offset];
            this.y = data[1 + offset];
            return this;
        }

        public copyFrom(pt: IPoint2DValue): Point2D {
            this.x = pt.x;
            this.y = pt.y;
            return this;
        }

        public copyTo(target: IPoint2DValue): Point2D {
            target.x = this.x;
            target.y = this.y;
            return this;
        }

        public equals(point: IPoint2DValue): boolean {
            return point.x == this.x && point.y == this.y;
        }

        public length(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        public normalize(length: number = 1): Point2D {
            var len: number = this.length();
            if (!len)
                return;
            this.scaleBy(length / len);
        }

        public clamp(length: number): Point2D {
            var len: number = this.length();
            if (!len || len <= length)
                return;
            this.scaleBy(length / len);
        }

        public scaleBy(scale: number): Point2D {
            this.x *= scale;
            this.y *= scale;
            return this;
        }

        public mul(pt: IPoint2DValue): Point2D {
            this.x *= pt.x;
            this.y *= pt.y;
            return this;
        }

        public mulRaw(x: number, y: number): Point2D {
            this.x *= x;
            this.y *= y;
            return this;
        }

        public setMul(factorA: IPoint2DValue, factorB: IPoint2DValue): Point2D {
            this.x = factorA.x * factorB.x;
            this.y = factorA.y * factorB.y;
            return this;
        }

        public div(pt: IPoint2DValue): Point2D {
            this.x /= pt.x;
            this.y /= pt.y;
            return this;
        }

        public divRaw(x: number, y: number): Point2D {
            this.x /= x;
            this.y /= y;
            return this;
        }

        public setDiv(divident: IPoint2DValue, divisor: IPoint2DValue): Point2D {
            this.x = divident.x / divisor.x;
            this.y = divident.y / divisor.y;
            return this;
        }

        public dot(pt: IPoint2DValue): number {
            return this.x * pt.x + this.y * pt.y;
        }

        public add(pt: IPoint2DValue): Point2D {
            this.x += pt.x;
            this.y += pt.y;
            return this;
        }

        public addRaw(x: number, y: number): Point2D {
            this.x += x;
            this.y += y;
            return this;
        }

        public setAdd(sumA: IPoint2DValue, sumB: IPoint2DValue): Point2D {
            this.x = sumA.x + sumB.x;
            this.y = sumA.y + sumB.y;
            return this;
        }

        public sub(pt: IPoint2DValue): Point2D {
            this.x -= pt.x;
            this.y -= pt.y;
            return this;
        }

        public subRaw(x: number, y: number): Point2D {
            this.x -= x;
            this.y -= y;
            return this;
        }

        public setSub(minuend: IPoint2DValue, subtrahend: IPoint2DValue): Point2D {
            this.x = minuend.x - subtrahend.x;
            this.y = minuend.y - subtrahend.y;
            return this;
        }

        public clone(): Point2D {
            return new Point2D(this.x, this.y);
        }

        public setTo(x: number, y: number): Point2D {
            this.x = x;
            this.y = y;
            return this;
        }

        public cross(pt: IPoint2DValue): Point2D {
            var x = this.x;
            var y = this.y;
            this.x = y * pt.x - x * pt.y;
            this.y = x * pt.y - y * pt.x;
            return this;
        }

        public static interpolate(v0: IPoint2DValue, v1: IPoint2DValue, f: number, ret: Point2D = new Point2D()): Point2D {
            return ret.setTo(
                v0.x + (v1.x - v0.x) * f,
                v0.y + (v1.y - v0.y) * f);
        }

        public static polar(angle: number, length: number, ret: Point2D = new Point2D()): Point2D {
            var angRad = angle * math.Number.DEG_TO_RAD;
            return ret.setTo(Math.cos(angRad) * length, Math.sin(angRad) * length);
        }

        public static distance(v0: IPoint2DValue, v1: IPoint2DValue): number {
            var dx: number = v0.x - v1.x;
            var dy: number = v0.y - v1.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        public static reflect(direction: IPoint2DValue, normal: IPoint2DValue, ret: Point2D = new Point2D()): Point2D {
            var dp: number = direction.x * normal.x + direction.y * normal.y;
            return ret.setTo(direction.x - 2 * dp * normal.x, direction.y - 2 * dp * normal.y);
        }

        public static intersection(p1: IPoint2DValue, p2: IPoint2DValue, p3: IPoint2DValue, p4: IPoint2DValue, ret: Point2D = new Point2D()): Point2D {
            var x1: number = p1.x;
            var y1: number = p1.y;
            var x4: number = p4.x;
            var y4: number = p4.y;

            var dx1: number = p2.x - x1;
            var dx2: number = p3.x - x4;

            if (!dx1 && !dx2)
                return null;

            var m1: number = (p2.y - y1) / dx1;
            var m2: number = (p3.y - y4) / dx2;

            if (!dx1)
                return ret.setTo(x1, m2 * (x1 - x4) + y4);// infinity
            else if (!dx2)
                return ret.setTo(x4, m1 * (x4 - x1) + y1);// infinity
            
            var xInt: number = (-m2 * x4 + y4 + m1 * x1 - y1) / (m1 - m2);
            var yInt: number = m1 * (xInt - x1) + y1;
            if (isNaN(xInt) || isNaN(yInt))
                return null;
            return ret.setTo(xInt, yInt);
        }
        
        //        public static extractPerspectiveOrigin(visual: HTMLElement, bounds: Box2D = Box2D.extract(visual), ret: Point2D = new Point2D()): Point2D {
        //            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
        //            var vals = style.perspectiveOrigin.split(" ");
        //            return ret.setTo(
        //                math.Number.parseRelation(vals[0], bounds.width, 0),
        //                math.Number.parseRelation(vals[1], bounds.height, 0));
        //        }
        //        
        //        public static extractPosition(visual: HTMLElement, ret: Point2D = new Point2D()): Point2D {
        //            return ret.setTo(
        //                visual.offsetLeft,
        //                visual.offsetTop);
        //        }
        //        
        //        public static extractBorder(visual: HTMLElement, ret: Point2D = new Point2D()): Point2D {
        //            var style: CSSStyleDeclaration = window.getComputedStyle(visual);
        //            return ret.setTo(
        //                math.Number.parse(style.borderLeftWidth, 0),
        //                math.Number.parse(style.borderTopWidth, 0));
        //        }
        
        public static qualifiedClassName: string = "jsidea.geom.Point2D";
        public toString(): string {
            return "[" + Point2D.qualifiedClassName +
                " x=" + this.x +
                " y=" + this.y + "]";
        }
    }
}