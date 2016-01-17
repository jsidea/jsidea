namespace jsidea.model.Reader {
    class ArrayBufferReader implements IReader {
        public responseType: string = "arraybuffer";
        public read(data: ArrayBuffer): ArrayBuffer {
            return data;
        }
    }

    export var ARRAY_BUFFER: IReader = new ArrayBufferReader();
}