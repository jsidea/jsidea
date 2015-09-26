module jsidea.events {
    export interface IEventDispatcher extends EventTarget {
        removeEventListener(type: string, useCapture?: any): void;
    }
}