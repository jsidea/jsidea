//basic classes and interfaces
interface IDisposable {
    dispose(): void;
}

//basic classes and interfaces
interface Window {
    app: jsidea.system.Application;
}

interface HTMLElement {
    matches(selector: string): boolean;
}

interface Object {
    observe(beingObserved: any, callback: (update: any) => any, types?: string[]): void;
}

//hook
//$(window).ready(() => {
document.addEventListener("DOMContentLoaded",() => {
    var qualifiedClassName = document.body.getAttribute("data-application");
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
    if (hook.prototype instanceof jsidea.system.Application) {
    }
    else {
        console.warn("Application " + hook + " does not inherit from jsidea.system.Application");
        return;
    }
    window.app = new hook();
});

