namespace jsidea.model.Writer {
    class JsonWriter implements IWriter {
        public write(data: any): string {
            return JSON.stringify(data);
        }
    }

    export var Json: IWriter = new JsonWriter();
}