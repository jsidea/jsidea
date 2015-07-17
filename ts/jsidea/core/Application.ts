module jsidea.core {
    export class Application extends jsidea.events.EventDispatcher {

        private _version: jsidea.core.IVersion;
        private _active: boolean = false;
        private _autoActive: boolean = false;
        private _autoTick: boolean = false;
        private _frameRate: number = 60;
        private _tickInterval: number = 0;
        private _pageX: number = 0;
        private _pageY: number = 0;
        private _lastScrollLeft: number = 0;
        private _lastScrollTop: number = 0;
        
        private _pageOffsetIncludesScroll: boolean = true;

        constructor() {
            super();

            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            this._pageOffsetIncludesScroll = !isChrome;
            
            this.autoActive = true;
            this.autoTick = true;
            //abstract create method
            this.create();
            //initial tick
            this.tick();

            $(document).bind("mousemove.jsdea-application", (e) => this.onMouseMove(e));
            $(window).bind("scroll.jsdea-application", (e) => this.onScroll(e));
        }

        private onMouseMove(e: JQueryEventObject): void {
            this._pageX = e.pageX;
            this._pageY = e.pageY;
        }

        private onScroll(e: JQueryEventObject): void {
            if (this._lastScrollLeft != $(document).scrollLeft()) {
                this._pageX -= this._lastScrollLeft;
                this._lastScrollLeft = $(document).scrollLeft();
                this._pageX += this._lastScrollLeft;
            }
            if (this._lastScrollTop != $(document).scrollTop()) {
                this._pageY -= this._lastScrollTop;
                this._lastScrollTop = $(document).scrollTop();
                this._pageY += this._lastScrollTop;
            }
        }

        public create(): void {
        }

        public get pageX(): number {
            return this._pageOffsetIncludesScroll ? this._pageX : this._pageX - $(document).scrollLeft();
        }

        public get pageY(): number {
            return this._pageOffsetIncludesScroll ? this._pageY : this._pageY - $(document).scrollTop();
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

        public dispose(): void {
            super.dispose();
        }

        public qualifiedClassName(): string {
            return "jsidea.Application";
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}