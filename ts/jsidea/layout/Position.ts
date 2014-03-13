module jsidea.layout {
    export interface IPositionValue {
        x?: any;
        y?: any;
        originX?: any;
        originY?: any;
    }
    export interface IPosition extends jsidea.core.ICore {
        my: IPositionValue;
        at: IPositionValue;
        of: JQuery;
        clone(): IPosition;
        point(visual: JQuery): jsidea.geom.IPoint;
        apply(visual: JQuery): void;
        transform(t: jsidea.geom.ITransformElement): void;
    }
    export class Position implements IPosition {
        constructor(
            public my: IPositionValue = {},
            public at: IPositionValue = {},
            public of: JQuery = null) {
        }

        public clone(): Position {
            return new Position(this.my, this.at, this.of);
        }

        public point(visual: JQuery): jsidea.geom.IPoint {
            if (!visual)
                return null;

            var myW = visual.width();
            var myH = visual.height();
            var myOffsetX: number = Position.parseValue(this.my.x, myW, 0);
            var myOffsetY: number = Position.parseValue(this.my.y, myH, 0);
            var myOriginX: number = Position.parseValue(this.my.originX, myW, 0);
            var myOriginY: number = Position.parseValue(this.my.originY, myH, 0);

            var target: JQuery = this.of ? this.of : visual.parent();
            var atW = target.width();
            var atH = target.height();
            var atOffsetX: number = Position.parseValue(this.at.x, atW, 0);
            var atOffsetY: number = Position.parseValue(this.at.y, atH, 0);
            var atOriginX: number = Position.parseValue(this.at.originX, atW, 0);
            var atOriginY: number = Position.parseValue(this.at.originY, atH, 0);

            var lc = new jsidea.geom.Point(atOffsetX - atOriginX, atOffsetY - atOriginY);
            var gl = jsidea.geom.Transform.getLocalToGlobal(target, lc.x, lc.y);
            lc = jsidea.geom.Transform.getGlobalToLocal(visual, gl.x, gl.y);
            lc.x += myOffsetX - myOriginX;
            lc.y += myOffsetY - myOriginY;

            return lc;
        }

        public apply(visual: JQuery): void {
            var pt = this.point(visual);
            visual.css("left", Math.round(pt.x) + "px");
            visual.css("top", Math.round(pt.y) + "px");
        }

        public transform(t: jsidea.geom.ITransformElement): void {
            var pt = this.point(t.visual);
            t.x = pt.x;
            t.y = pt.y;
            t.validate();
        }

        public qualifiedClassName(): string {
            return "jsidea.layout.Position";
        }

        public dispose(): void {
            this.my = null;
            this.at = null;
            this.of = null;
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }

        private static parseValue(value: any, relativeSize: number, defaultValue: number): number {
            if (typeof value == "number") {
                return value;
            }
            else if (typeof value == "string") {
                value = jQuery.trim(value);
                if (value.indexOf("%") > 0) {
                    return (parseNumber(value.replace("%", ""), defaultValue) / 100) * relativeSize;
                }
                else if (value.indexOf("px") > 0) {
                    return parseNumber(value.replace("px", ""), defaultValue);
                }
                else if (value == "top" || value == "left")
                    return 0;
                else if (value == "center")
                    return relativeSize * 0.5;
                else if (value == "bottom" || value == "right")
                    return relativeSize;
                return defaultValue;
            }
            return defaultValue;
        }
    }
}