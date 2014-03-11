module jsidea.events {
    export interface IEvent {
        eventType: string;
        eventKey: string;
        target: any;
    }
    export class Event implements IEvent {
    
        public static INIT:string = "init";
        public static ACTIVATE:string = "activate";
        public static DEACTIVATE: string = "deactivate";
        
        public eventType: string = null;
        public eventKey: string = null;
        public target: any = null;

        constructor() {
        }

        public toString(): string {
            return "[jsidea.events.Event"
                + " eventType='" + this.eventType + "]";
        }
    }
}