module jsidea.events {
    interface IEventDispatcherKeyMatch {
        eventType?: string;
        key?: string
    }
    interface IEventDispatcherListener {
        listener: Function;
        once: boolean;
        eventType?: string;
        context?: any;
        key?: string;
        data?: any
    }
    export interface IEventDispatcher {
        bind(eventType: string, listener: (event: IEvent, data?: any) => void): void;
        bind(eventType: string, listener: (event: IEvent, data?: any) => void, context: any): void;
        bind(eventType: string, listener: (event: IEvent, data?: any) => void, context: any, data: any): void;
        unbind(eventType: string): void;
        trigger(eventType: string): void;
        trigger(eventType: string, event: IEvent): void;
    }
    export class EventDispatcher implements IEventDispatcher {

        private _listener: IEventDispatcherListener[] = [];
        private _target: any = null;

        constructor(target: any = null) {
            this._target = target ? target : this;
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

        public unbind(
            eventType: string): void {
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
            var l = matches.length;
            for (var i = 0; i < l; ++i) {

                event.eventType = matches[i].eventType;
                event.eventKey = matches[i].key;
                matches[i].listener.call(matches[i].context, event, matches[i].data);
                
                if(matches[i].once)
                     this._listener.splice(this._listener.indexOf(matches[i]), 1);
            }
        }

        public toString(): string {
            return "[jsidea.events.EventDispatcher]";
        }

        private static getMatches(dispatcher: EventDispatcher, entries: IEventDispatcherKeyMatch[]): IEventDispatcherListener[] {
            var matches: IEventDispatcherListener[] = [];
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
                    //if matched on key only (listener has no eventType set)
                    //                    else if (!listenerEntry.eventType && eventEntry.key == listenerEntry.key) {
                    //                    }
                    else {
                        continue;
                    }

                    matches.push(dispatcher._listener[j]);
                }
            }
            return matches;
        }

        private static parseEventType(eventType: string): IEventDispatcherKeyMatch[] {
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