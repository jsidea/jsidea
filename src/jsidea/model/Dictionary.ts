namespace jsidea.model {
    export class Dictonary<K, V> {
        private _keys: K[] = [];
        private _values: V[] = [];

        constructor() {
        }

        public getValue(key: K): V {
            return this._values[this._keys.indexOf(key)];
        }

        public setValue(key: K, value: V): V {
            var index = this._keys.indexOf(key);
            if (index < 0) {
                this._keys.push(key);
                this._values.push(value);
                return value;
            }
            this._values[index] = value;
            return value;
        }
        
        public hasKey(key: K):boolean
        {
            return this._keys.indexOf(key) >= 0;    
        }
        
        public hasValue(value: V):boolean
        {
            return this._values.indexOf(value) >= 0;    
        }

        public clear(): void {
            this._keys.splice(0, this._keys.length);
            this._values.splice(0, this._values.length);
        }

        public removeKey(key: K): V {
            var index = this._keys.indexOf(key);
            if (index < 0)
                return null;
            var value: V = this._values[index];
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            return value;
        }
        
        public getKeys(value: V): K[] {
            var res:K[] = [];
            var index = 0; 
            while((index = this._values.indexOf(value, index)) >= 0)
                res.push(this._keys[index]);
            return res;
        }

        public length(): number {
            return this._keys.length;
        }
    }
}