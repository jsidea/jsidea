namespace jsidea.model.Reader {
    class JsonReader implements IReader {
        public read(data: string): any {
            return JSON.parse(data);
        }
    }

    export var Json: IReader = new JsonReader();
}