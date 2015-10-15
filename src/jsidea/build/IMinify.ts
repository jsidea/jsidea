namespace jsidea.build {
    export interface IMinify {
        apply(files: IFile[], options: any): IMinifyResult;
    }
}
