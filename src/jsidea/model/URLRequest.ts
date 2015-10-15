namespace jsidea.model {
    export enum URLMethod {
        GET,
        POST
    }
    export class URLRequest extends events.EventDispatcher {
        private static _parser: HTMLAnchorElement = document.createElement("a");

        public method: URLMethod = URLMethod.GET;
        public protocol: string;
        public host: string;
        public path: string;
        public port: string;
        public upload: any = null;
        public response: any = null;
        public responseText: string;
        public writer: IConverter = null;
        public errors: any[];
        public reader: IConverter = Converter.Json;

        constructor(url?: string) {
            super();
            if (url)
                this.url = url;
        }

        public set url(url: string) {
            var p = URLRequest._parser;
            p.href = url;
            this.port = p.port;
            this.protocol = p.protocol;
            this.host = p.host;
            this.path = p.pathname;
        }

        public get url(): string {
            var p = URLRequest._parser;
            p.port = this.port;
            p.protocol = this.protocol;
            p.host = this.host;
            p.pathname = this.path;
            return p.href;
        }

        public send(): void {
            URLRequest.send(this);
        }

        public static create(url: string): URLRequest {
            return new URLRequest(url);
        }

        private static send(request: URLRequest): void {
            var uploadData = request.upload;
            
            request.errors = [];
            request.response = null;
            request.responseText = "";
            
            if (uploadData && request.writer) {
                try {
                    uploadData = request.writer.write(request.upload);
                } catch (e) {
                    request.errors.push(e);
                    request.dispatchEvent(new Event("error"));
                    return;
                }
            }

            var ajax = new XMLHttpRequest();

            ajax.onreadystatechange = (e: ProgressEvent) => {
                //                console.log("PROGRESS", ajax.readyState, ajax.status);
                if (ajax.readyState == 4) {
                    if (ajax.status == 200) {
                        request.responseText = ajax.responseText;

                        var responseData = request.responseText;
                        if (request.reader) {
                            try {
                                responseData = request.reader.read(request.responseText);
                            } catch (e) {
                                request.errors.push(e);
                                request.dispatchEvent(new Event("error"));
                                return;
                            }
                        }
                        request.response = responseData;
                        request.dispatchEvent(new Event("complete"));
                    }
                    else {
                        request.errors.push(e);
                        request.dispatchEvent(new Event("error"));
                    }
                }
                else if (ajax.readyState == 0) {
                    console.log("REQUEST NOT INIT");
                }
            }

            ajax.open(URLMethod[request.method], request.url);
            ajax.send(request.upload);
        }
    }
}