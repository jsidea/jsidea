module jsidea.system {
    export class Caps {
        //operating systems
        public static isWindows = /win/i.test(navigator.appVersion);
        public static isMac = /mac/i.test(navigator.appVersion);
        public static isUnix = /x11/i.test(navigator.appVersion);
        public static isLinux = /linux/i.test(navigator.appVersion);
        public static osName: string = (() => {
            if (Caps.isWindows)
                return "Windows";
            if (Caps.isMac)
                return "Mac OS X";
            if (Caps.isUnix)
                return "Unix";
            if (Caps.isLinux)
                return "Linux";
            return "";
        })();
        public static osVersion: string = (() => {
            if (Caps.isWindows)
                return "7";
            if (Caps.isMac)
                return "Yosemite";
            if (Caps.isUnix)
                return "Unix";
            if (Caps.isLinux)
                return "Linux";
            return "";
        })();        
        
        //browsers
        public static isOpera = /opr\//i.test(navigator.userAgent) || /opera/i.test(navigator.userAgent);
        public static isChrome = !Caps.isOpera && /chrome/i.test(navigator.userAgent);
        public static isFirefox = /firefox/i.test(navigator.userAgent);
        public static isSafari = !Caps.isChrome && !Caps.isFirefox && !Caps.isOpera && /safari/i.test(navigator.userAgent);
        public static isInternetExplorer = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
        public static isEdge = /edge\//i.test(navigator.userAgent);
        public static isYandex = /yandex/i.test(navigator.userAgent);
        public static browserName: string = (() => {
            if (Caps.isOpera)
                return "Opera";
            if (Caps.isChrome)
                return "Chrome";
            if (Caps.isFirefox)
                return "Firefox";
            if (Caps.isSafari)
                return "Safari";
            if (Caps.isInternetExplorer)
                return "Internet Explorer";
            if (Caps.isYandex)
                return "Yandex";
            return "";
        })();
        public static browserInfoDate = "2015-08-07";
        public static browserVersionCurrentFull: string = (() => {
            if (Caps.isOpera)
                return "31.0.1889.106";
            if (Caps.isChrome)
                return "44.0.2403.130";
            if (Caps.isFirefox)
                return "39.0.3";
            //apple discontinued windows-branch
            if (Caps.isSafari && !Caps.isMac)
                return "5.1.7";
            if (Caps.isSafari && Caps.isMac)
                return "8.0";
            if (Caps.isInternetExplorer)
                return "11.0.9600.17914";
            if (Caps.isEdge)
                return "12.0";
            if (Caps.isYandex)
                return "1.0";
            return "";
        })();
        public static browserVersionCurrent: number = parseInt(Caps.browserVersionCurrentFull);
        //source: http://www.javascripter.net/faq/browsern.htm
        public static browserVersionFull: string = (() => {
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
        public static browserVersion: number = parseInt(Caps.browserVersionFull);
        
        //engines
        public static isWebKit = !Caps.isInternetExplorer && !Caps.isEdge && /webkit/i.test(navigator.userAgent);
        public static isBlink = Caps.isWebKit && ((Caps.isChrome && Caps.browserVersion >= 28) || (Caps.isOpera && Caps.browserVersion >= 15) || Caps.isYandex);
        public static isTrident = /trident/i.test(navigator.userAgent);
        public static isGecko = !Caps.isInternetExplorer && !Caps.isWebKit && /gecko/i.test(navigator.userAgent);
        public static isEdgeHTML = Caps.isEdge && Caps.browserVersion >= 12;
        public static engineName: string = (() => {
            if (Caps.isBlink)
                return "WebKit/Blink";
            if (Caps.isWebKit)
                return "WebKit";
            if (Caps.isTrident)
                return "Trident";
            if (Caps.isGecko)
                return "Gecko";
            return "";
        })();

        public static qualifiedClassName: string = "jsidea.system.Caps";
        public toString(): string {
            return "[" + Caps.qualifiedClassName + "]";
        }
    }
}