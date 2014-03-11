module jsidea {
    export class Application extends jsidea.events.EventDispatcher {

        private _version: jsidea.core.IVersion;
        private _active: boolean = false;
        private _autoActive: boolean = false;
        private _autoTick: boolean = false;
        private _frameRate: number = 60;
        private _tickInterval: number = 0;

        constructor() {
            super();

            this.autoActive = true;
            this.autoTick = true;
            //abstract create method
            this.create();
            //initial tick
            this.tick();
        }

        public create(): void {
        }

        public get active(): boolean {
            return this._active;
        }

        public set active(value: boolean) {
            if (this._active == value)
                return;
            this._active = value;

            this.broadcast(this._active ? jsidea.events.Event.ACTIVATE : jsidea.events.Event.DEACTIVATE,
                new jsidea.events.Event());
        }

        public get autoActive(): boolean {
            return this._autoActive;
        }

        public set autoActive(value: boolean) {
            if (this._autoActive == value)
                return;
            this._autoActive = value;

            if (this._autoActive) {
                this._active = document.visibilityState == "visible";
                $(document).bind("visibilitychange.jsidea_application", () => this.onVisibilityChange());
            }
            else
                $(document).unbind("visibilitychange.jsidea_application");
        }

        public get frameRate(): number {
            return this._frameRate;
        }

        public set frameRate(value: number) {
            value = value < 0 ? 0 : value;
            if (this._frameRate == value)
                return;
            this._frameRate = value;
            this.refreshTickInterval();
        }

        public tick(): void {
            this.broadcast(jsidea.events.Event.TICK);
        }

        public get autoTick(): boolean {
            return this._autoTick;
        }

        public set autoTick(value: boolean) {
            if (this._autoTick == value)
                return;
            this._autoTick = value;
            this.refreshTickInterval();
        }

        public get version(): jsidea.core.IVersion {
            return this._version;
        }

        private onVisibilityChange(): void {
            this.active = document.visibilityState == "visible";
        }

        private refreshTickInterval(): void {
            clearInterval(this._tickInterval);
            if (this._autoTick && this._frameRate > 0)
                this._tickInterval = setInterval(() => this.tick(), 1000 / this._frameRate);
        }
    }
}