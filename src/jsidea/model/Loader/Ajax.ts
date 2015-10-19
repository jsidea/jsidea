namespace jsidea.model.Loader {
    class AjaxLoader implements ILoader {
        public load(request: Request<any>): void {
            //get the upload data
            var uploadData = request.upload;
            if (uploadData && request.writer) {
                try {
                    uploadData = request.writer.write(request.upload);
                } catch (exc) {
                    request.state = RequestState.FAILED;
                    request.onFail.invoke(exc);
                    return;
                }
            }

            //handle the ready state
            var ajax = new XMLHttpRequest();
            ajax.onreadystatechange = (e: ProgressEvent) => {
                if (ajax.readyState == 4) {
                    if (ajax.status == 200) {
                        var responseText = ajax.responseText;
                        
                        //parse/read the data
                        var responseData = <any>responseText;
                        if (request.reader) {
                            try {
                                responseData = request.reader.read(responseText);
                            } catch (exc) {
                                request.state = RequestState.FAILED;
                                request.onFail.invoke(exc);
                                return;
                            }
                        }

                        request.state = RequestState.SUCCESS;
                        request.onSuccess.invoke(responseData);
                    }
                    else {
                        request.state = RequestState.FAILED;
                        request.onFail.invoke("404");
                    }
                }
                else if (ajax.readyState == 0) {
                    console.log("REQUEST NOT INIT");
                }
            }

            ajax.open(RequestMethod[request.method], request.url.href);
            ajax.send(request.upload);
        }
    }
    export var AJAX: ILoader = new AjaxLoader();
}