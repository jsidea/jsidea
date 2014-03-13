module jsidea.layout {
    export interface IPosition {
    }
    export class Position {
        constructor() {
        }

        public qualifiedClassName(): string {
            return "jsidea.layout.Position";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}