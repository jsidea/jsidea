namespace jsidea.model {
    export interface IReader {
        responseType: string;
        read(data: any): any
    }
}