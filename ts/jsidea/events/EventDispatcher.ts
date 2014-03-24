module jsidea.events {
    interface IEventDispatcherKey {
        eventType?: string;
        key?: string
    }
    interface IEventDispatcherSlot {
        listener: Function;
        once: boolean;
        eventType?: string;
        context?: any;
        key?: string;
        data?: any
    }
    export interface IEventDispatcher extends jsidea.core.ICore {
        bind(eventType: string, listener: (event: IEvent, data?: any) => void): void;
        bind(eventType: string, listener: (event: IEvent, data?: any) => void, context: any): void;
        bind(eventType: string, listener: (event: IEvent, data?: any) => void, context: any, data: any): void;
        unbind(eventType: string): void;
        trigger(eventType: string): void;
        trigger(eventType: string, event: IEvent): void;
        broadcast(eventType: string): void;
        broadcast(eventType: string, event: IEvent): void;
        binded(eventType: string): boolean;
    }
    export class EventDispatcher implements IEventDispatcher {

        private static _dispatcher: IEventDispatcher[] = [];
        private _listener: IEventDispatcherSlot[] = [];
        private _target: any = null;

        constructor(target: any = null) {
            this._target = target ? target : this;

            EventDispatcher._dispatcher.push(this);
        }

        public once(
            eventType: string,
            listener: (event: IEvent, data?: any) => void,
            context: any = null,
            data: any = null): void {
            return this.bind(eventType, listener, context, data, true);
        }

        public bind(
            eventType: string,
            listener: (event: IEvent, data?: any) => void,
            context: any = null,
            data: any = null,
            once: boolean = false): void {
            var entries = EventDispatcher.parseEventType(eventType);
            var l = entries.length;
            for (var i = 0; i < l; ++i)
                this._listener.push({
                    once: once,
                    eventType: entries[i].eventType,
                    key: entries[i].key,
                    listener: listener,
                    context: context,
                    data: data
                });
        }

        public binded(eventType: string): boolean {
            var entries = EventDispatcher.parseEventType(eventType);
            var matches = EventDispatcher.getMatches(this, entries);
            return matches.length > 0;
        }

        public unbind(eventType: string): void {
            var entries = EventDispatcher.parseEventType(eventType);
            var matches = EventDispatcher.getMatches(this, entries);
            var l = matches.length;
            for (var i = 0; i < l; ++i) {
                var idx = this._listener.indexOf(matches[i]);
                this._listener.splice(idx, 1);
            }
        }

        public trigger(
            eventType: string,
            event: IEvent = null): void {
            var entries = EventDispatcher.parseEventType(eventType);
            var matches = EventDispatcher.getMatches(this, entries);

            event = event ? event : new Event();
            event.target = this._target;
            event.canceled = false;
            
            var l = matches.length;
            for (var i = 0; i < l; ++i) {
                event.eventType = matches[i].eventType;
                event.eventKey = matches[i].key;
                matches[i].listener.call(matches[i].context, event, matches[i].data);

                if (matches[i].once)
                    this._listener.splice(this._listener.indexOf(matches[i]), 1);

                if (event.canceled)
                    return;
            }
        }

        public broadcast(
            eventType: string,
            event: IEvent = null): void {
            event = event ? event : new Event();
            event.broadcast = true;
            var disps = EventDispatcher._dispatcher;
            var l = disps.length;
            for (var i = 0; i < l; ++i) {
                disps[i].trigger(eventType, event);
            }
        }

        public dispose(): void {
            EventDispatcher._dispatcher.splice(EventDispatcher._dispatcher.indexOf(this), 1);
            this._listener = null;
            this._target = null;
        }

        public qualifiedClassName(): string {
            return "jsidea.events.EventDispatcher";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }

        private static getMatches(dispatcher: EventDispatcher, entries: IEventDispatcherKey[]): IEventDispatcherSlot[] {
            var matches: IEventDispatcherSlot[] = [];
            var listenerCount: number = dispatcher._listener.length;
            var l: number = entries.length;
            for (var i = 0; i < l; ++i) {
                var eventEntry = entries[i];
                for (var j = 0; j < listenerCount; ++j) {
                    var listenerEntry = dispatcher._listener[j];

                    //if triggered by key and listener.key does not match ... jus skip
                    if (eventEntry.key && eventEntry.key != listenerEntry.key) {
                        continue;
                    }
                    //if matched on key only (no eventType given)
                    else if (!eventEntry.eventType && eventEntry.key) {
                    }
                    //if matched on eventType
                    else if (eventEntry.eventType == listenerEntry.eventType) {
                    }
                    else {
                        continue;
                    }

                    matches.push(dispatcher._listener[j]);
                }
            }
            return matches;
        }

        private static parseEventType(eventType: string): IEventDispatcherKey[] {
            var entries = eventType.replace(/\s{2,}/g, ' ').split(" ");
            var l = entries.length;
            var result = [];
            for (var i = 0; i < l; ++i) {
                var entry = entries[i];
                var type = entry;
                var key = null;
                var idx = entry.indexOf(".");
                if (idx >= 0) {
                    if (idx > 0) {
                        var typeAndKey = entry.split(".");
                        type = typeAndKey[0];
                        key = typeAndKey[1];
                    }
                    else {
                        type = "";
                        key = entry.substr(1);
                    }
                }
                result.push({ eventType: type, key: key });
            }
            return result;
        }
    }
}