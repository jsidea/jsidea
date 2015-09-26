module jsidea.plugins {
    export function Runner(element: HTMLElement): void {
            var plugin: string = element.getAttribute("data-plugin")
            if (!plugin) {
                return;
            }
            var qualifiedClassName = "jsidea.plugins." + plugin;
            var path: string[] = qualifiedClassName.split(".");
            var hook: any = window[<any>path[0]];
            for (var i = 1; i < path.length; ++i) {
                if (!hook) {
                    console.warn("Plugin '" + qualifiedClassName + "' is undefined.");
                    return;
                }

                hook = hook[path[i]];
            }
            if (!hook) {
                console.warn("Plugin '" + qualifiedClassName + "' is undefined.");
                return;
            }
            var app = new hook();
        }
}
//hook
document.addEventListener("DOMContentLoaded", () => {
    jsidea.plugins.Runner(document.body);
});