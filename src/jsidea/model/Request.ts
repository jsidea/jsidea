namespace jsidea.model {
    export enum RequestMethod {
        GET,
        POST,
        PUT
    }
    export enum RequestState {
        UNSENT = 0,
        LOADING = 2,
        FAILED = 4,
        SUCCESS = 8
    }
    export class Request<ResponseType> {
        private _state: RequestState = RequestState.UNSENT;

        public url: URL = new URL();
        public upload: any = null;
        public method: RequestMethod = RequestMethod.GET;
        public writer: IWriter = null;
        public reader: IReader = Reader.TEXT;
        public loader: ILoader = Loader.AJAX;
        public response: ResponseType;

        public onFail = events.Signal.create<any>();
        public onSuccess = events.Signal.create<ResponseType>();
        public onStateChange = events.Signal.create<RequestState>();
        public onProgress = events.Signal.create<number, number>();

        constructor(href: string) {
            this.url.href = href;
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

        public static bulk(requests: Request<any>[], onSuccess: () => void): void {
            var count = 0;
            var maxCount = requests.length;
            var onSuccessRequest = (r: any) => {
                count++;
                if (count == maxCount) {
                    for (var slot of slots)
                        slot.dispose();
                    onSuccess();
                }
            }
            var slots: events.Slot[] = [];
            for (var r of requests) {
                slots.push(r.onSuccess.add(onSuccessRequest));
                r.load();
            }
        }
    }
}