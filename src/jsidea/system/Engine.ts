module jsidea.system {
    export class Engine {
        //engines
        public static isWebKit = !Browser.isInternetExplorer && !Browser.isEdge && /webkit/i.test(navigator.userAgent);
        public static isBlink = Engine.isWebKit && ((Browser.isChrome && Browser.version >= 28) || (Browser.isOpera && Browser.version >= 15) || Browser.isYandex);
        public static isTrident = /trident/i.test(navigator.userAgent);
        public static isGecko = !Browser.isInternetExplorer && !Engine.isWebKit && /gecko/i.test(navigator.userAgent);
        public static isEdgeHTML = Browser.isEdge && Browser.version >= 12;
        public static engineName: string = (() => {
            if (Engine.isBlink)
                return "WebKit/Blink";
            if (Engine.isWebKit)
                return "WebKit";
            if (Engine.isTrident)
                return "Trident";
            if (Engine.isGecko)
                return "Gecko";
            return "";
        })();
    }
}