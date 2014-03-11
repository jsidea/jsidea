module jsidea.events {
    export interface ITransformEvent extends IEvent {

    }
    export class TransformEvent extends Event implements ITransformEvent {
    
        public static TRANSFORM: string = "transform";
        
        public scaled:boolean;
        public skewed:boolean;
        public rotated:boolean;
        public translated:boolean;
        public originChanged:boolean;
        
        constructor() {
            super();
        }

        public toString(): string {
            return "[jsidea.events.Event"
                + " eventType='" + this.eventType + "]";
        }
    }
}