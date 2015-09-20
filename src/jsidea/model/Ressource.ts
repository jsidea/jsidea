module jsidea.model {
    export interface IRessource {
    }
    export class Ressource {
        constructor() {
        }

        public qualifiedClassName(): string {
            return "jsidea.model.Ressource";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}