namespace jsidea.model.Writer {
    class JsonWriter implements IWriter {
        public write(data: any): string {
            return window.JSON.stringify(data);
        }
    }

    export var JSON: IWriter = new JsonWriter();
}