namespace jsidea.model {
    export interface IConverter {
        read(data: string): any
        write(data: any): string;
    }
}