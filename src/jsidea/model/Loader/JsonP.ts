namespace jsidea.model.Loader {
    class JSONPLoader implements ILoader {
        private static _JSON_UID: number = 0;
        private static _URL: URL = new URL("");
        public load(request: Request<any>): void {
            var uid = JSONPLoader._JSON_UID++;
            var functionName = "JSONPCallback" + uid;
            var script = document.createElement("script");
            script.type = "text\/javascript";
            script.onerror = (e) => request.onFail.invoke(e);
            (<any>window)[functionName] = (data: string) => {
                var responseData = data;
                if (request.reader) {
                    try {
                        responseData = request.reader.read(responseData);
                    } catch (exc) {
                        request.state = RequestState.FAILED;
                        request.onFail.invoke(exc);
                        return;
                    }
                }
                request.state = RequestState.SUCCESS;
                request.onSuccess.invoke(responseData);
            }; 
            //            script.onload = () => 
            var url = request.url;
            url.addParameters({ "callback": functionName });
            script.src = url.href;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }
    export var JSONP: ILoader = new JSONPLoader();
}