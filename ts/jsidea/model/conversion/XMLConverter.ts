module jsidea.model.conversion {
    export interface IXMLConverter {
    }
    export class XMLConverter {
        constructor() {
            $.get("test.xml", (r) => this.onComp(r));
        }
        
        private onComp(r):void{
            console.log(r);
        }

        public encode(xmlStr: string): any {

        }

        public decode(jsonObj: any): any {

        }

        public qualifiedClassName(): string {
            return "jsidea.model.conversion.XMLConverter";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}