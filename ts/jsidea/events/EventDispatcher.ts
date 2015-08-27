module jsidea.events {
    export interface IEventListener extends Function {
        (e?: Event): any;
    }
    export interface IEventDispatcher extends EventTarget {
        removeEventListener(type: string, useCapture?: any): void;
    }
    export class EventDispatcher implements IEventDispatcher {

        private _listener: IEventListener[] = [];
        private _scope: any;

        constructor(scope: any = null) {
            this._scope = scope === null ? this : scope;
        }

        public addEventListener(
            type: string,
            listener: IEventListener,
            useCapture: boolean = false): void {

            var listeners = this.getListeners(type, useCapture);
            var index = listeners.indexOf(listener);
            if (index === -1)
                listeners.push(listener);
        }

        public removeEventListener(
            type: string,
            listener: IEventListener,
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
                listeners[i].apply(this._scope, event);
            return !event.defaultPrevented;
        }

        public getListeners(
            type: string,
            useCapture: boolean = false): IEventListener[] {

            var capType = type + (useCapture ? '1' : '0');
            if (!(capType in this._listener))
                this._listener[capType] = [];
            return this._listener[capType];
        }

        public dispose(): void {
            this._listener = null;
            this._scope = null;
        }

        public static qualifiedClassName: string = "jsidea.events.EventDispatcher";
        public toString(): string {
            return "[" + EventDispatcher.qualifiedClassName + "]";
        }
    }
}