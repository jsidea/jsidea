namespace jsidea.events {
    interface ISignal1<Data0> {
        add(listener: (data: Data0) => void): number;
        dispatch(p0: Data0): void;
    }
    interface ISignal2<Data0, Data1> {
        add(listener: (data0: Data0, data1: Data1) => void): number;
        dispatch(p0: Data0, p1: Data1): void;
    }
    interface ISignal3<Data0, Data1, Data2> {
        add(listener: (data0: Data0, data1: Data1, data2: Data2) => void): number;
        dispatch(p0: Data0, p1: Data1, p2: Data2): void;
    }
    interface ISignal4<Data0, Data1, Data2, Data3> {
        add(listener: (data0: Data0, data1: Data1, data2: Data2, data3: Data3) => void): number;
        dispatch(p0: Data0, p1: Data1, p2: Data2, p3: Data3): void;
    }
    interface ISignal5<Data0, Data1, Data2, Data3, Data4> {
        add(listener: (data0: Data0, data1: Data1, data2: Data2, data3: Data3, data4: Data4) => void): number;
        dispatch(p0: Data0, p1: Data1, p2: Data2, p3: Data3, p4: Data4): void;
    }
    export class Signal {

        private static _key: number = 0;
        private _slots: ((...args: any[]) => void)[] = [];
        private _handles: number[] = [];

        public add(listener: (...args) => void): number {
            Signal._key++;
            this._slots.push(listener);
            this._handles.push(Signal._key);
            return Signal._key;
        }

        public dispatch(...args: any[]): void {
            for (var slot of this._slots)
                slot.apply(this, args);
        }

        public remove(handle: number): void {
            var index = this._handles.indexOf(handle);
            this._slots.splice(index, 1);
            this._handles.splice(index, 1);
        }

        public clear(): void {
            this._slots.splice(0, this._slots.length);
            this._handles.splice(0, this._handles.length);
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