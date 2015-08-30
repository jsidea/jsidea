module jsidea.math {
    export class Number {

        public static RAD_TO_DEG: number = 180 / Math.PI;
        public static DEG_TO_RAD: number = Math.PI / 180;

        public static relation(value: any, relativeSize: number, defaultValue: number): number {
            if (typeof value == "number") {
                return value;
            }
            else if (typeof value == "string") {
                value = (<string>value).trim().toLowerCase();
                if (value.indexOf("%") > 0) {
                    return (Number.parse(value.replace("%", ""), defaultValue) / 100) * relativeSize;
                }
                else if (value.indexOf("px") > 0 || value.indexOf("pt") > 0) {
                    return Number.parse(value.replace("px", ""), defaultValue);
                }
                else if (value.indexOf("vw") > 0) {
                    return (Number.parse(value.replace("vw", ""), defaultValue) / 100) * window.innerWidth;
                }
                else if (value.indexOf("vh") > 0) {
                    return (Number.parse(value.replace("vh", ""), defaultValue) / 100) * window.innerHeight;
                }
                else if (value.indexOf("vm") > 0) {
                    return (Number.parse(value.replace("vm", ""), defaultValue) / 100) * Math.min(window.innerWidth, window.innerHeight);
                }
                else if (value.indexOf("em") > 0) {
                    return Number.parse(value.replace("em", ""), defaultValue);
                }
                else if (value == "top" || value == "left")
                    return 0;
                else if (value == "center" || value == "middle")
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