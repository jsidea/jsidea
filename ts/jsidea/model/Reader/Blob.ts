namespace jsidea.model.Reader {
    class BlobReader implements IReader {
        public responseType: string = "blob";
        public read(data: Blob): Blob {
            return data;
        }
    }

    export var BLOB: IReader = new BlobReader();
}