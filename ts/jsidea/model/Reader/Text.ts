namespace jsidea.model.Reader {
    class TextReader implements IReader {
        public responseType: string = "text";
        public read(data: string): string {
            return data;
        }
    }

    export var TEXT: IReader = new TextReader();
}