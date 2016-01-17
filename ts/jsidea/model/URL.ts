namespace jsidea.model {
    type URLParameters = {
        [key: string]: string | number;
    };
    export class URL {
        private static _parser: HTMLAnchorElement = document.createElement("a");

        public host: string = "";
        public protocol: string = "";
        public path: string = "";
        public hash: string = "";

        constructor(href?: string) {
            if (href)
                this.href = href;
        }

        public set href(url: string) {
            var p = URL._parser;
            p.href = url;
            this.host = p.host;
            this.protocol = p.protocol;
            this.path = p.pathname;
            this.hash = p.hash;
        }

        public get href(): string {
            var p = URL._parser;
            p.host = this.host;
            p.protocol = this.protocol;
            p.pathname = this.path;
            p.hash = this.hash;
            return p.href;
        }

        public addParameters(params: URLParameters) {
            var merged = this.parameters;
            for (var p in params)
                merged[p] = params[p];
            this.parameters = merged;
        }

        public removeParameters(params: URLParameters) {
            var merged = this.parameters;
            for (var p in params)
                delete merged[p];
            this.parameters = merged;
        }

        public set parameters(params: URLParameters) {
            var href = this.href;
            
            //build the url parameter string
            var pairs: string[] = [];
            for (var key in params) {
                var value = params[key];
                pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value.toString()));
            }
            var paramsStr = "?" + pairs.join("&");
            
            //replace the existing params-string
            var idx = href.indexOf("?");
            if (idx === -1)
                idx = href.length;
            this.href = href.substr(0, idx) + paramsStr;
        }

        public get parameters(): URLParameters {
            var href = this.href;
            var params: URLParameters = {};
            //SOURCE: http://papermashup.com/read-url-get-variables-withjavascript/
            var parts = href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                (m, key, value) => {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                    return "";
                });
            return params;
        }
    }
}