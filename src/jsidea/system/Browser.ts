module jsidea.system {
    export class Browser {
        //browsers
        public static isOpera = /opr\//i.test(navigator.userAgent) || /opera/i.test(navigator.userAgent);
        public static isChrome = !Browser.isOpera && /chrome/i.test(navigator.userAgent);
        public static isFirefox = /firefox/i.test(navigator.userAgent);
        public static isSafari = !Browser.isChrome && !Browser.isFirefox && !Browser.isOpera && /safari/i.test(navigator.userAgent);
        public static isInternetExplorer = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
        public static isEdge = /edge\//i.test(navigator.userAgent);
        public static isYandex = /yandex/i.test(navigator.userAgent);
        public static name: string = (() => {
            if (Browser.isOpera)
                return "Opera";
            if (Browser.isChrome)
                return "Chrome";
            if (Browser.isFirefox)
                return "Firefox";
            if (Browser.isSafari)
                return "Safari";
            if (Browser.isInternetExplorer)
                return "Internet Explorer";
            if (Browser.isYandex)
                return "Yandex";
            return "";
        })();
        //source: http://www.javascripter.net/faq/browsern.htm
        public static version: string = (() => {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent.toLowerCase();
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var nameOffset: number, verOffset: number, ix: number;
            if ((verOffset = nAgt.indexOf("opr/")) != -1) {
                fullVersion = nAgt.substring(verOffset + 4);
            }
            else if ((verOffset = nAgt.indexOf("opera")) != -1) {
                fullVersion = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf("version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            else if ((verOffset = nAgt.indexOf("msie")) != -1) {
                fullVersion = nAgt.substring(verOffset + 5);
            }
            else if ((verOffset = nAgt.indexOf("edge/")) != -1) {
                fullVersion = nAgt.substring(verOffset + 5);
            }
            else if ((verOffset = nAgt.indexOf("; rv:")) != -1) {
                fullVersion = nAgt.substring(verOffset + 5);
            }
            else if ((verOffset = nAgt.indexOf("chrome")) != -1) {
                fullVersion = nAgt.substring(verOffset + 7);
            }
            else if ((verOffset = nAgt.indexOf("safari")) != -1) {
                fullVersion = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf("version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            else if ((verOffset = nAgt.indexOf("firefox")) != -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
                (verOffset = nAgt.lastIndexOf('/'))) {
                fullVersion = nAgt.substring(verOffset + 1);
            }
            if ((ix = fullVersion.indexOf(")")) != -1)
                fullVersion = fullVersion.substring(0, ix);
            if ((ix = fullVersion.indexOf(";")) != -1)
                fullVersion = fullVersion.substring(0, ix);
            if ((ix = fullVersion.indexOf(" ")) != -1)
                fullVersion = fullVersion.substring(0, ix);
            if (isNaN(parseInt('' + fullVersion, 10)))
                fullVersion = '' + parseFloat(navigator.appVersion);
            if (isNaN(parseInt('' + fullVersion, 10)))
                fullVersion = "";
            return fullVersion;
        })();
        public static major: number = parseInt(Browser.version);
    }
}