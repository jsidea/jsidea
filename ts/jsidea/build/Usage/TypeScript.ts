namespace jsidea.build.Usage {
    export interface ITypeScriptOptions extends ts.CompilerOptions {
        compilerHost?: CompilerHost;
    }
    class TypeScriptUsage implements IUsage {

        private _symbols: ISymbol[];
        private _stack: ts.ModuleDeclaration[];
        private _program: ts.Program;
        private _file: IFile;

        public apply(files: IFile[], options?: ITypeScriptOptions): IUsageResult {

            options = options || { noLib: true };
            this._stack = [];
            this._symbols = [];

            //create program
            var host = options.compilerHost || new CompilerHost(files);
            var names: string[] = [];

            for (var f of host.files)
                names.push(f.name);

            //            try {
            this._program = ts.createProgram(names, options, host);
            //            } catch (e) {
            //                console.log("TypeScript program created", e);
            //            }
            
            
            //process exports (do it before import!)
            this._program.getSourceFiles().forEach(node => {
                this._file = host.find(node.fileName);
                //                if (node.fileName.indexOf(".d.ts") === -1)
                this.processExport(node);
            });
            
            //process imports
            this._stack = [];
            this._program.getSourceFiles().forEach(node => {
                this._file = host.find(node.fileName);
                //                if (node.fileName.indexOf(".d.ts") === -1)
                this.processImport(node);
            });

            //TODO: this should be optional
            this._program.emit();

            return {
                symbols: this._symbols
            };
        }

        private getFullName(node: ts.Node): string {
            var symbol: ts.Symbol = this._program.getTypeChecker().getSymbolAtLocation(node);
            if (!symbol)
                symbol = (<any>node).symbol;
            if (!symbol)
                return "";
            return this._program.getTypeChecker().getFullyQualifiedName(symbol);
        }

        private getName(node: ts.Node): string {
            var path = this.getPath(node);
            return path ? path[path.length - 1] : "";
        }

        private getPath(node: ts.Node): string[] {
            var qname = this.getFullName(node);
            if (qname)
                return qname.split(".");
            return null;
        }

        private processExport(node: ts.Node): void {
            if (node.kind == ts.SyntaxKind.ModuleDeclaration)
                this._stack.push(<ts.ModuleDeclaration>node);

            switch (node.kind) {
                case ts.SyntaxKind.ModuleDeclaration:
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                case ts.SyntaxKind.EnumDeclaration:
                case ts.SyntaxKind.VariableDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                    this.extractExportNames(node);
            }

            var skipChildren = node.kind == ts.SyntaxKind.ClassDeclaration;
            if (!skipChildren)
                ts.forEachChild(node, node => this.processExport(node));

            if (node.kind == ts.SyntaxKind.ModuleDeclaration)
                this._stack.pop();
        }

        private extractExportNames(node: ts.Node) {
            var isNodeExported = false;
            if (this._stack.length > 0) {
                var name = this.getName(node);
                var lastModule: any = this._stack[this._stack.length - 1];
                isNodeExported = lastModule.symbol ? lastModule.symbol.exports.hasOwnProperty(name) : false;
            }
            
            //keep track of declarations on the global scope
            if (!isNodeExported && this._stack.length == 0 && node.kind != ts.SyntaxKind.ModuleDeclaration) {
                isNodeExported = true;
            }

            if (isNodeExported) {
                var fullName = this.getFullName(node);
                this.addExport(fullName, node.kind);
            }
        }

        private addExport(fullName: string, kind: any): void {
            var s = this.getSymbolByName(fullName);
            if (!s)
                this._symbols.push({ fullName: fullName, kind: kind, file: this._file, imports: [] });
        }

        private processImport(node: ts.Node): void {
            if (node.kind == ts.SyntaxKind.ModuleDeclaration)
                this._stack.push(<ts.ModuleDeclaration>node);
            
            //TODO: integrate some filter option
            switch (node.kind) {
                //                case ts.SyntaxKind.Identifier:
                //                case ts.SyntaxKind.ExtendsKeyword:
                //                case ts.SyntaxKind.ClassKeyword:
                //                case ts.SyntaxKind.ClassExpression:
                //                case ts.SyntaxKind.ClassDeclaration:
                //                case ts.SyntaxKind.PropertyAccessExpression:
                default:
                    this.extractImportNames(node);
            }

            ts.forEachChild(node, node => this.processImport(node));

            if (node.kind == ts.SyntaxKind.ModuleDeclaration)
                this._stack.pop();
        }

        private extractImportNames(node: ts.Node): void {
            var path = this.getPath(node);
            if (node.kind == ts.SyntaxKind.ExpressionWithTypeArguments) {
                var exp = <ts.ExpressionWithTypeArguments>node;
                var signature = exp.expression.getText();
                var stack = this._stack.map((a) => { return a.name.getText(); });
                var mod = "";
                this.addImport(signature);
                if (signature && stack.length > 0) {
                    for (var modName of stack) {
                        mod += (mod ? "." : "") + modName;
                        if (mod) {
                            this.addImport(mod + "." + signature);
                        }
                    }
                }
            }
            else if (path) {
                var fullName: string = "";
                var l = path.length;
                for (var i = 0; i < l; ++i) {
                    fullName += (fullName ? "." : "") + path[i];
                    this.addImport(fullName);
                }
            }
        }

        private addImport(fullName: string): void {
            var s = this.getSymbolByName(fullName);
            if (s) {
                var file = this._file;
                for (var e of this._symbols)
                    if (e != s && e.file == file && e.imports.indexOf(s) === -1)
                        e.imports.push(s);
            }
        }

        private getSymbolByName(fullName: string): ISymbol {
            for (var s of this._symbols)
                if (s.fullName == fullName)
                    return s;
            return null;
        }
    }

    export var TYPESCRIPT = new TypeScriptUsage();
}