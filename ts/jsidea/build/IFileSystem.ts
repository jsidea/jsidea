namespace jsidea.build {
    export interface IFileSystem {
        files: IFile[];
        find(fileName: string): IFile;
        match(glob: string): IFile[];
        exists(fileName: string): boolean;
        read(fileName: string): string;
        write(fileName: string, data: string): void;
    }
}