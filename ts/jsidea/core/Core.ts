//basic classes and interfaces
module jsidea.core {
    export interface IDisposable {
        dispose(): void;
    }
}

//shortcut for console.log
var trace = console.log ? console.log : function(...args) { };

//fix missing indexOf function
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start?) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

function parseNumber(value: any, defaultValue: number): number {
    value = parseFloat(value);
    if (isNaN(value))
        return defaultValue;
    return value;
}

//hook
$(window).ready(() => {
    var qualifiedClassName = $("body").attr("data-hook").split(".");
    var hookTarget = window[qualifiedClassName[0]];
    for (var i = 1; i < qualifiedClassName.length; ++i) {
        hookTarget = hookTarget[qualifiedClassName[i]];
        if (!hookTarget) {
            alert("WRONG HOOK " + $("body").attr("data-hook"));
            return;
        }
    }
    new hookTarget()
    });