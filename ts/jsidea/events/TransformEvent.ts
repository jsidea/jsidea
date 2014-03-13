module jsidea.events {
    export interface ITransformEvent extends IEvent {
        scaled: boolean;
        skewed: boolean;
        rotated: boolean;
        translated: boolean;
        originChanged: boolean;
    }
    export class TransformEvent extends Event implements ITransformEvent {

        public static TRANSFORM: string = "transform";

        public scaled: boolean;
        public skewed: boolean;
        public rotated: boolean;
        public translated: boolean;
        public originChanged: boolean;

        constructor() {
            super();
        }

        public dispose(): void {
            super.dispose();
        }

        public qualifiedClassName(): string {
            return "jsidea.events.TransformEvent";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + 
                + " eventType='" + this.eventType + "'" +
                + " scaled=" + this.scaled +
                + " skewed=" + this.skewed +
                + " rotated=" + this.rotated +
                + " translated=" + this.translated +
                + " originChanged=" + this.originChanged +
                +"]";
        }
    }
}