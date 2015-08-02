//basic classes and interfaces
module jsidea.core {
    export interface ICore {
        dispose(): void;
        qualifiedClassName(): string;
    }
}

interface Window {
    app: jsidea.core.Application;
}

interface HTMLElement {
    matches(selector: string): boolean;
}

interface Object {
    observe(beingObserved: any, callback: (update: any) => any, types?: string[]): void;
}

//shortcut for console.log
//var trace = console.log ? console.log : function(...args) { };

//fix missing indexOf function
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start?) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

//hook
//$(window).ready(() => {
document.addEventListener("DOMContentLoaded",() => {

    var qualifiedClassName = $("body").attr("data-application");
    if (!qualifiedClassName) {
        return;
    }
    var path = qualifiedClassName.split(".");
    var hook = window[path[0]];
    for (var i = 1; i < path.length; ++i) {
        hook = hook[path[i]];
        if (!hook) {
            console.warn("Application '" + qualifiedClassName + "' is undefined.");
            return;
        }
    }
    if (hook.prototype instanceof jsidea.core.Application) {
    }
    else {
        console.warn("Application " + hook + " does not inherit from jsidea.core.Application");
        return;
    }
    //    try {
    var app = new hook();
    window.app = app;
    //    }
    //    catch (e) {
    //        window.app = null;
    //        var err = new Error("Unable to instantiate application from " + qualifiedClassName + ".");
    //        err.name = "ApplicationError";
    //        err.lineNumber = e.lineNumber;
    //        err.fileName = e.fileName;
    //        throw err;
    ////        console.warn("Unable to instantiate application from " + qualifiedClassName + ". view-source:" + e.fileName + "  :" + e.lineNumber);
    ////        return;
    //    }
});

