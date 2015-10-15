namespace jsidea.model.Converter {
    class JsonParser implements IConverter {
        public read(data: string): any {
            return JSON.parse(data);
        }

        public write(data: any): string {
            return JSON.stringify(data);
        }
    }

    export var Json: IConverter = new JsonParser();
}