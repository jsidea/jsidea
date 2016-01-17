namespace jsidea.system {
    export class System {
        //operating systems
        public static isWindows = /win/i.test(navigator.appVersion);
        public static isMac = /mac/i.test(navigator.appVersion);
        public static isUnix = /x11/i.test(navigator.appVersion);
        public static isLinux = /linux/i.test(navigator.appVersion);
        public static name: string = (() => {
            if (System.isWindows)
                return "Windows";
            if (System.isMac)
                return "Mac OS X";
            if (System.isUnix)
                return "Unix";
            if (System.isLinux)
                return "Linux";
            return "";
        })();
        public static version: string = (() => {
            if (System.isWindows)
                return "7";
            if (System.isMac)
                return "Yosemite";
            if (System.isUnix)
                return "Unix";
            if (System.isLinux)
                return "Linux";
            return "";
        })();        
    }
}