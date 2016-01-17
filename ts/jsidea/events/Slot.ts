namespace jsidea.events {
    export interface ISlot {
        remove(): void;
        once(): void;
        count(count: number): void;
        scope(scope: any): void;
    }
    export class Slot {

        private _signal: Signal;
        private _listener: (...args: any[]) => void;
        private _once: boolean = false;
        private _count: number = 0;
        private _maxCount: number = 0;
        private _scope: any = null;
        private _time: number = 0;

        constructor(signal: Signal, listener: (...args: any[]) => void) {
            this._signal = signal;
            this._listener = listener;
        }
        public scope(scope: any): Slot {
            this._scope = scope;
            return this;
        }

        public once(): Slot {
            this._once = true;
            return this;
        }

        public count(count: number): Slot {
            this._maxCount = count;
            return this;
        }

        public duration(duration: number): Slot {
            this._time = Date.now() + duration;
            return this;
        }

        public invoke(args: any[]): void {
            if (this._time && Date.now() > this._time) {
                this.dispose();
                return;
            }
            this._listener.apply(this._scope, args);
            this._count++;
            if (this._once || (this._maxCount && this._count >= this._maxCount))
                this.dispose();
        }

        public dispose(): Slot {
            var slots: Slot[] = (<any>this._signal)._slots;
            slots.splice(slots.indexOf(this), 1);
            this._signal = null;
            this._listener = null;
            return this;
        }
    }
}