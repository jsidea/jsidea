module jsidea.events {
    export interface IEvent extends jsidea.core.ICore {
        eventType: string;
        eventKey: string;
        target: any;
        broadcast: boolean;
    }
    export class Event implements IEvent {

        public static INIT: string = "init";
        public static TICK: string = "tick";
        public static ACTIVATE: string = "activate";
        public static DEACTIVATE: string = "deactivate";

        public eventType: string = null;
        public broadcast: boolean = false;
        public eventKey: string = null;
        public target: any = null;

        constructor() {
        }

        public dispose(): void {
        }
        
        public qualifiedClassName(): string {
            return "jsidea.events.Event";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + 
                + " eventType='" + this.eventType + "]";
        }
    }
}