namespace jsidea.model {
    export enum RequestMethod {
        GET,
        POST
    }
    export class Request<ResponseType> {
        public url: string;
        public upload: any = null;
        public method: RequestMethod = RequestMethod.GET;
        public writer: IWriter = null;
        public reader: IReader = Reader.Json;

        public onError = events.Signal.create<any>();
        public onComplete = events.Signal.create<ResponseType>();

        constructor(url: string) {
            this.url = url;
        }

        public send(): void {
            Request.send(this);
        }

        private static send(request: Request<any>): void {
            var uploadData = request.upload;

            if (uploadData && request.writer) {
                try {
                    uploadData = request.writer.write(request.upload);
                } catch (exc) {
                    request.onError.dispatch(exc);
                    return;
                }
            }

            var ajax = new XMLHttpRequest();

            ajax.onreadystatechange = (e: ProgressEvent) => {
                //                console.log("PROGRESS", ajax.readyState, ajax.status);
                if (ajax.readyState == 4) {
                    if (ajax.status == 200) {
                        var responseText = ajax.responseText;

                        var responseData = responseText;
                        if (request.reader) {
                            try {
                                responseData = request.reader.read(responseText);
                            } catch (exc) {
                                request.onError.dispatch(exc);
                                return;
                            }
                        }
                        var response = responseData;
                        request.onComplete.dispatch(response);
                    }
                    else {
                        request.onError.dispatch("404");
                    }
                }
                else if (ajax.readyState == 0) {
                    console.log("REQUEST NOT INIT");
                }
            }

            ajax.open(RequestMethod[request.method], request.url);
            ajax.send(request.upload);
        }
    }
}