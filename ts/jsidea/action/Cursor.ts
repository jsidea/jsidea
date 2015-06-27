module jsidea.action {
    export class Cursor extends jsidea.events.EventDispatcher {
    
        private _text:string = "";
        
        constructor() {
            super();
        }
    }
}