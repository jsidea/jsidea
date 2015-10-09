module jsidea.build {
    export class VirtualHost implements ts.CompilerHost {
        private _files: plugins.IFile[] = null;
        constructor(symbols: plugins.IFile[]) {
            this._files = symbols;
        }
        getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
            var fi = this.getFile(fileName);
            if (!fi) {
                console.log("File not found: ", fileName);
                return null;
            }
            return ts.createSourceFile(fi.name, fi.code, languageVersion);
        }

        private getFile(fileName: string): plugins.IFile {
            for (var f of this._files)
                if (f.name == fileName)
                    return f;
            return null;
        }
        //        getCancellationToken?(): ts.CancellationToken{
        //            return null;    
        //        }
        getDefaultLibFileName(options: ts.CompilerOptions): string {
            return "";
        }
        writeFile: ts.WriteFileCallback = (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => {
            var fi = this.getFile(fileName);
            if (!fi)
                return;
            (<any>fi).typeScript = data;
        }
        getCurrentDirectory(): string {
            return "";
        }
        getCanonicalFileName(fileName: string): string {

            return fileName;
        }
        useCaseSensitiveFileNames(): boolean {
            return true;
        }
        getNewLine(): string {
            return "\n";
        }

        fileExists(fileName: string): boolean {
            for (var f of this._files)
                if (f.name == fileName)
                    return true;
            return false;
        }
        readFile(fileName: string): string {
            for (var f of this._files)
                if (f.name == fileName)
                    return f.code;
            return "";
        }
        //        resolveModuleNames?(moduleNames: string[], containingFile: string): ts.ResolvedModule[]{
        //            return null;    
        //        }
    }
}