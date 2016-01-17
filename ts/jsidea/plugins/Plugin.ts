namespace jsidea.plugins {
    export class Plugin extends jsidea.events.EventDispatcher {
        private _active: boolean = false;
        private _autoActive: boolean = false;
        private _autoTick: boolean = false;
        private _frameRate: number = 60;
        private _tickInterval: number = 0;

        constructor() {
            super();

            this.autoActive = true;
            this.autoTick = true;
            this.tick();
        }

        public get active(): boolean {
            return this._active;
        }

        public set active(value: boolean) {
            if (this._active == value)
                return;
            this._active = value;
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
                document.addEventListener("visibilitychange", () => this.onVisibilityChange());
            }
            else
                document.removeEventListener("visibilitychange", null);
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
            //            this.broadcast(jsidea.events.Event.TICK);
            var evt = document.createEvent("Event");
            evt.initEvent("tick", true, true);
            document.dispatchEvent(evt);
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

        private onVisibilityChange(): void {
            this.active = document.visibilityState == "visible";
        }

        private refreshTickInterval(): void {
            clearInterval(this._tickInterval);
            if (this._autoTick && this._frameRate > 0)
                this._tickInterval = <any> setInterval(() => this.tick(), 1000 / this._frameRate);
        }

        public dispose(): void {
            super.dispose();
        }
    }
}