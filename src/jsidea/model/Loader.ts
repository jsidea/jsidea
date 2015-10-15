namespace jsidea.model {
    export enum LoaderMethod {
        GET,
        POST
    }
    export class Loader extends events.EventDispatcher {
        private _stack: Request<any>[] = [];
        constructor() {
            super();
        }
        public load(request: Request<any>): void {
            var ajax = new XMLHttpRequest();
            ajax.onreadystatechange = (e: ProgressEvent) => {
                if (ajax.readyState == 4) {
                    if (ajax.status == 200) {
                        //                    this.parse(JSON.parse(this._ajax.responseText));
                    }
                    else {
                        console.log(ajax.statusText);
                    }
                }
            }
        }
    }
}