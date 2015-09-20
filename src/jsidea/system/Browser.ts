module jsidea.system {
    export class Browser {
        //operating systems
        public static isWindows = /win/i.test(navigator.appVersion);
        public static isMac = /mac/i.test(navigator.appVersion);
        public static isUnix = /x11/i.test(navigator.appVersion);
        public static isLinux = /linux/i.test(navigator.appVersion);
        public static osName: string = (() => {
            if (Browser.isWindows)
                return "Windows";
            if (Browser.isMac)
                return "Mac OS X";
            if (Browser.isUnix)
                return "Unix";
            if (Browser.isLinux)
                return "Linux";
            return "";
        })();
        public static osVersion: string = (() => {
            if (Browser.isWindows)
                return "7";
            if (Browser.isMac)
                return "Yosemite";
            if (Browser.isUnix)
                return "Unix";
            if (Browser.isLinux)
                return "Linux";
            return "";
        })();        
        
        //browsers
        public static isOpera = /opr\//i.test(navigator.userAgent) || /opera/i.test(navigator.userAgent);
        public static isChrome = !Browser.isOpera && /chrome/i.test(navigator.userAgent);
        public static isFirefox = /firefox/i.test(navigator.userAgent);
        public static isSafari = !Browser.isChrome && !Browser.isFirefox && !Browser.isOpera && /safari/i.test(navigator.userAgent);
        public static isInternetExplorer = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
        public static isEdge = /edge\//i.test(navigator.userAgent);
        public static isYandex = /yandex/i.test(navigator.userAgent);
        public static browserName: string = (() => {
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
        public static infoDate = "2015-08-07";
        public static versionCurrentFull: string = (() => {
            if (Browser.isOpera)
                return "31.0.1889.106";
            if (Browser.isChrome)
                return "44.0.2403.130";
            if (Browser.isFirefox)
                return "39.0.3";
            //apple discontinued windows-branch
            if (Browser.isSafari && !Browser.isMac)
                return "5.1.7";
            if (Browser.isSafari && Browser.isMac)
                return "8.0";
            if (Browser.isInternetExplorer)
                return "11.0.9600.17914";
            if (Browser.isEdge)
                return "12.0";
            if (Browser.isYandex)
                return "1.0";
            return "";
        })();
        public static versionCurrent: number = parseInt(Browser.versionCurrentFull);
        //source: http://www.javascripter.net/faq/browsern.htm
        public static versionFull: string = (() => {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent.toLowerCase();
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var nameOffset, verOffset, ix;
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
        public static version: number = parseInt(Browser.versionFull);
        
        //engines
        public static isWebKit = !Browser.isInternetExplorer && !Browser.isEdge && /webkit/i.test(navigator.userAgent);
        public static isBlink = Browser.isWebKit && ((Browser.isChrome && Browser.version >= 28) || (Browser.isOpera && Browser.version >= 15) || Browser.isYandex);
        public static isTrident = /trident/i.test(navigator.userAgent);
        public static isGecko = !Browser.isInternetExplorer && !Browser.isWebKit && /gecko/i.test(navigator.userAgent);
        public static isEdgeHTML = Browser.isEdge && Browser.version >= 12;
        public static engineName: string = (() => {
            if (Browser.isBlink)
                return "WebKit/Blink";
            if (Browser.isWebKit)
                return "WebKit";
            if (Browser.isTrident)
                return "Trident";
            if (Browser.isGecko)
                return "Gecko";
            return "";
        })();

        public static qualifiedClassName: string = "jsidea.system.Caps";
        public toString(): string {
            return "[" + Browser.qualifiedClassName + "]";
        }
    }
}