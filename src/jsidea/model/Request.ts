namespace jsidea.model {
    export enum RequestMethod {
        GET,
        POST,
        PUT
    }
    export enum RequestState {
        UNSENT,
        LOADING,
        FAILED,
        SUCCESS
    }
    export class Request<ResponseType> {
        private _state: RequestState = RequestState.UNSENT;

        public url: URL = new URL();
        public upload: any = null;
        public method: RequestMethod = RequestMethod.GET;
        public writer: IWriter = null;
        public reader: IReader = Reader.JSON;
        public loader: ILoader = Loader.AJAX;

        public onFail = events.Signal.create<any>();
        public onSuccess = events.Signal.create<ResponseType>();
        public onStateChange = events.Signal.create<RequestState>();

        constructor(href: string) {
            this.url.href = href;
//            var p = new Promise<string>((resolve, reject) => {
//                    
//            });
        }

        public get state(): RequestState {
            return this._state;
        }

        public set state(state: RequestState) {
            if (this._state == state)
                return;
            this.onStateChange.invoke(state);
            this._state = state;
        }

        public load(): void {
            this.state = RequestState.LOADING;
            this.loader.load(this);
        }
    }
}