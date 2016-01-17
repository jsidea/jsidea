namespace jsidea.build {
    export interface ISymbol {
        fullName: string;
        file: IFile;
        kind: number;
        imports: ISymbol[];
    }
}