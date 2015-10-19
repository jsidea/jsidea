namespace jsidea.model.Reader {
    class JSONReader implements IReader {
        public responseType: string = "json";
        public read(data: string | any): any {
            if (typeof data == "string")
                return window.JSON.parse(data);
            return data;
        }
    }

    export var JSON: IReader = new JSONReader();
}