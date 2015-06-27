module jsidea.math {
    export class Number {

        public static RAD_TO_DEG: number = 180 / Math.PI;
        public static DEG_TO_RAD: number = Math.PI / 180;

        public static parseRelation(value: any, relativeSize: number, defaultValue: number): number {
            if (typeof value == "number") {
                return value;
            }
            else if (typeof value == "string") {
                value = jQuery.trim(value);
                if (value.indexOf("%") > 0) {
                    return (math.Number.parse(value.replace("%", ""), defaultValue) / 100) * relativeSize;
                }
                else if (value.indexOf("px") > 0) {
                    return math.Number.parse(value.replace("px", ""), defaultValue);
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
        
        public static parse(value: any, defaultValue: number): number {
            value = parseFloat(value);
            if (isNaN(value))
                return defaultValue;
            return value;
        }

        public static clamp(value: number, min: number, max: number): number {
            if (min > max) {
                var tmp = max;
                max = min;
                min = tmp;
            }
            return (value < min) ? min : ((value > max) ? max : value);
        }

        public static roundTo(value: number, mod: number): number {
            var r: number = value % mod;
            return (r < (mod * 0.5)) ? value - r : value + (mod - r);
        }

        public shortRotation(startRotation: number, endRotation: number): number {
            var dif: number = (endRotation - startRotation) % 360;
            if (dif != dif % 180)
                dif = (dif < 0) ? dif + 360 : dif - 360;
            return dif;
        }
    }
}