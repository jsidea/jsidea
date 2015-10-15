namespace jsidea.build {
    export interface IUsage {
        apply(files: IFile[], options?: any): IUsageResult;
    }
}