module jsidea.system {
    export class Caps {
        constructor() {
        }
        
        public static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        public static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
        public static isIE = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);

        public static qualifiedClassName(): string {
            return "jsidea.model.Caps";
        }

        public toString(): string {
            return "[" + Caps.qualifiedClassName() + "]";
        }
    }
}