interface IEventDispatcher extends EventTarget {
    removeEventListener(
        type: string,
        useCapture?: any): void;
}

module jsidea.events {
    export class EventDispatcher implements IEventDispatcher {

        private _listener: ((e: Event) => any)[] = [];

        constructor() {
        }

        public addEventListener(
            type: string,
            listener: (e: Event) => any,
            useCapture: boolean = false): void {

            var listeners = this.getListeners(type, useCapture);
            var index = listeners.indexOf(listener);
            if (index === -1)
                listeners.push(listener);
        }

        public removeEventListener(
            type: string,
            listener: (e: Event) => any,
            useCapture: boolean = false): void {

            var listeners = this.getListeners(type, useCapture);
            var index = listeners.indexOf(listener);
            if (index !== -1)
                listeners.splice(index, 1);
        }

        public dispatchEvent(
            event: Event): boolean {

            var listeners = this.getListeners(event.type, false);
            for (var i = 0; i < listeners.length; i++)
                listeners[i](event);
            return !event.defaultPrevented;
        }

        public getListeners(type: string, useCapture: boolean = false) {
            var capType = (useCapture ? '1' : '0') + type;
            if (!(capType in this._listener))
                this._listener[capType] = [];
            return this._listener[capType];
        }

        public dispose(): void {
            this._listener = null;
        }

        public static qualifiedClassName: string = "jsidea.events.EventDispatcher";
        public toString(): string {
            return "[" + EventDispatcher.qualifiedClassName + "]";
        }
    }
}