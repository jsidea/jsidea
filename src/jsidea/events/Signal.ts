namespace jsidea.events {
    interface ISignal {
        clear();
    }
    interface ISignal1<Data0> extends ISignal {
        add(listener: (data: Data0) => void): ISlot;
        dispatch(p0: Data0): void;
    }
    interface ISignal2<Data0, Data1> extends ISignal {
        add(listener: (data0: Data0, data1: Data1) => void): ISlot;
        dispatch(p0: Data0, p1: Data1): void;
    }
    interface ISignal3<Data0, Data1, Data2> extends ISignal {
        add(listener: (data0: Data0, data1: Data1, data2: Data2) => void): ISlot;
        dispatch(p0: Data0, p1: Data1, p2: Data2): void;
    }
    interface ISignal4<Data0, Data1, Data2, Data3> extends ISignal {
        add(listener: (data0: Data0, data1: Data1, data2: Data2, data3: Data3) => void): ISlot;
        dispatch(p0: Data0, p1: Data1, p2: Data2, p3: Data3): void;
    }
    interface ISignal5<Data0, Data1, Data2, Data3, Data4> extends ISignal {
        add(listener: (data0: Data0, data1: Data1, data2: Data2, data3: Data3, data4: Data4) => void): ISlot;
        dispatch(p0: Data0, p1: Data1, p2: Data2, p3: Data3, p4: Data4): void;
    }
    interface ISlot {
        remove(): void;
        listener: (...args: any[]) => void;
    }
    export class Signal {

        private _slots: ISlot[] = [];

        public add(listener: (...args) => void): ISlot {
            var slot: ISlot = {
                remove: () => this._slots.splice(this._slots.indexOf(slot), 1),
                listener: listener
            };
            this._slots.push(slot);
            return slot;
        }

        public dispatch(...args: any[]): void {
            for (var slot of this._slots)
                slot.listener.apply(this, args);
        }

        public clear(): void {
            this._slots.splice(0, this._slots.length);
        }

        public static create<T0>(): ISignal1<T0>;
        public static create<T0, T1>(): ISignal2<T0, T1>;
        public static create<T0, T1, T2>(): ISignal3<T0, T1, T2>;
        public static create<T0, T1, T2, T3>(): ISignal4<T0, T1, T2, T3>;
        public static create<T0, T1, T2, T3, T4>(): ISignal5<T0, T1, T2, T3, T4>;
        public static create(): Signal {
            return new Signal();
        }
    }
}