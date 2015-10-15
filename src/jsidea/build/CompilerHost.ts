module jsidea.build {
    export class CompilerHost extends FileSystem implements ts.CompilerHost {

        constructor(files?: IFile[]) {
            super(files);
        }

        public getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
            var fi = this.find(fileName);
            if (!fi) {
                if (onError)
                    onError("File not found: " + fileName);
                return null;
            }
            return ts.createSourceFile(fi.name, fi.code, languageVersion);
        }
        
        public fileExists(fileName: string): boolean {
            return this.exists(fileName);
        }
        
        public readFile(fileName: string): string {
            return this.read(fileName);
        }
        
        public writeFile: ts.WriteFileCallback = (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) => this.write(fileName, data);
        
        public getDefaultLibFileName(options: ts.CompilerOptions): string {
            return "";
        }
        
        public getCurrentDirectory(): string {
            return "";
        }
        
        public getCanonicalFileName(fileName: string): string {
            return fileName;
        }
        
        public useCaseSensitiveFileNames(): boolean {
            return true;
        }
        
        public getNewLine(): string {
            return "\n";
        }
    }
}