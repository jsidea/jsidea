module jsidea {
    export var version:Version;
    
    export class Application {
        constructor() {
            jsidea.version = new Version();
            console.log("jsidea - " + jsidea.version.toString());
        }
    }
}
$(window).ready(() => new jsidea.Application());