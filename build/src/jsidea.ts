import ts = require("typescript");
import glob = require("glob");
import fs = require('fs');

interface IReference {
    qualifiedName: string;
    node: ts.Node;
    fileSize: number;
    file: string;
}

interface Result {
    [fileName: string]: IReference[];
}

abstract class BaseProcessor {
    public result: Result = null;

    protected _host: ts.CompilerHost;
    protected _program: ts.Program;
    protected _options: ts.CompilerOptions = { noLib: true };
    protected _file: ts.SourceFile;

    public run(sourceFiles: string[]): void {
        this.prepare(sourceFiles);
        this._host = ts.createCompilerHost(this._options)
        this._program = ts.createProgram(sourceFiles, this._options, this._host)
        this._program.getSourceFiles().forEach(file => { this._file = file; this.processNode(file) });
        this.finalize();
    }

    protected abstract processNode(node: ts.Node): void;

    protected getQualifiedName(node: ts.Node): string {
        var symbol: ts.Symbol = this.getSymbol(node);
        if (!symbol)
            return "";
        return this._program.getTypeChecker().getFullyQualifiedName(symbol);
    }

    protected getName(node: ts.Node): string {
        var path = this.getPath(node);
        return path ? path[path.length - 1] : "";
    }

    protected getPath(node: ts.Node): string[] {
        var qname = this.getQualifiedName(node);
        if (qname)
            return qname.split(".");
        return null;
    }

    protected getSymbol(node: ts.Node): ts.Symbol {
        var symbol: ts.Symbol = this._program.getTypeChecker().getSymbolAtLocation(node);
        if (!symbol)
            symbol = (<any>node).symbol;
        return symbol;
    }

    protected addToResult(qualifiedName: string, node: ts.Node): void {
        if (!qualifiedName)
            return;
        var fileName: string = String(this._file.fileName);
        if (!this.result.hasOwnProperty(fileName)) {
            this.result[fileName] = [];
        }
        if (this.getIndexOfQualifiedName(qualifiedName, this.result[fileName]) === -1) {
            var stats = fs.statSync(this._file.fileName.replace(".ts", ".js"))
            var fileSizeInBytes = stats["size"]
            this.result[fileName].push({ qualifiedName: qualifiedName, node: node, file: this._file.fileName, fileSize: fileSizeInBytes });
        }
    }

    private getIndexOfQualifiedName(qualifiedName: string, refs: IReference[]): number {
        var l = refs.length;
        for (var i = 0; i < l; ++i)
            if (refs[i].qualifiedName == qualifiedName)
                return i;
        return -1;
    }

    protected prepare(sourceFiles: string[]): void {
        this.result = {};
    }

    protected finalize(): void { }
}

class ExportProcessor extends BaseProcessor {
    //    public association: Result = null;

    private _stack: ts.ModuleDeclaration[] = [];

    protected prepare(sourceFiles: string[]): void {
        super.prepare(sourceFiles);
        //        this.association = {};
    }

    protected processNode(node: ts.Node): void {
        if (node.kind == ts.SyntaxKind.ModuleDeclaration)
            this._stack.push(<ts.ModuleDeclaration>node);

        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration:
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.InterfaceDeclaration:
            case ts.SyntaxKind.EnumDeclaration:
            case ts.SyntaxKind.VariableDeclaration:
                this.extract(node);
        }

        var skipChildren = node.kind == ts.SyntaxKind.ClassDeclaration;
        if (!skipChildren)
            ts.forEachChild(node, node => this.processNode(node));

        if (node.kind == ts.SyntaxKind.ModuleDeclaration)
            this._stack.pop();
    }

    private extract(node: ts.Node) {
        if (this.isExported(node)) {
            this.addToResult(this.getQualifiedName(node), node);
        }
    }

    private isExported(node: ts.Node): boolean {
        if (this._stack.length == 0)
            return false;
        var name = this.getName(node);
        var mod: any = this._stack[this._stack.length - 1];
        return mod.symbol ? mod.symbol.exports.hasOwnProperty(name) : false;
    }

    //    protected finalize(): void {
    //        Object.keys(this.result).forEach(fileName => {
    //            this.result[fileName].forEach(symbol => {
    //                if (!this.association.hasOwnProperty(symbol)) {
    //                    this.association[symbol] = [];
    //                }
    //                if (this.association[symbol].indexOf(fileName) === -1) {
    //                    this.association[symbol].push(fileName);
    //                }
    //            });
    //        });
    //    }
}

class ImportProcessor extends BaseProcessor {
    protected processNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.Identifier) {
            this.extract(node);
        } else if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
            return this.extract(node);
        }

        ts.forEachChild(node, node => this.processNode(node));
    }

    private extract(node: ts.Node): void {
        var path = this.getPath(node);
        if (path) {
            var fullName: string = "";
            var l = path.length;
            for (var i = 0; i < l; ++i) {
                fullName += (fullName ? "." : "") + path[i];
                this.addToResult(fullName, node);
            }
        }
    }
}

class DependencyManager {
    public imports: ImportProcessor = null;
    public exports: ExportProcessor = null;

    public run(sourceFiles: string[]): void {
        this.imports = new ImportProcessor();
        this.imports.run(sourceFiles);
        this.exports = new ExportProcessor();
        this.exports.run(sourceFiles);

        //get all exports
        var exportsAll: string[] = [];
        for (var file in this.exports.result) {
            var classes = this.exports.result[file];
            var l = classes.length;
            for (var i = 0; i < l; ++i) {
                var className = classes[i];
                if (exportsAll.indexOf(className.qualifiedName) < 0)
                    exportsAll.push(className.qualifiedName);
            }
        }

        //clean imports
        for (var file in this.imports.result) {
            var classes = this.imports.result[file];
            var l = classes.length;
            for (var i = 0; i < l; ++i) {
                var className = classes[i];
                if (exportsAll.indexOf(className.qualifiedName) < 0) {
                    classes.splice(i, 1);
                    i--;
                    l--;
                }
            }
        }

        for (var file in this.imports.result) {
            var data = this.imports.result[file];
            delete this.imports.result[file];
            this.imports.result[this.finalizeFilePath(file)] = data;
        }

        for (var file in this.exports.result) {
            var data = this.exports.result[file];
            delete this.exports.result[file];
            this.exports.result[this.finalizeFilePath(file)] = data;
        }
    }

    public getData(): any {

        var imports = {};
        for (var file in this.imports.result) {
            var data = this.imports.result[file];
            var res: any = [];
            for (var r of data)
                res.push(r.qualifiedName);
            imports[file] = res;
        }

        var exports = [];
        for (var file in this.exports.result) {
            var data = this.exports.result[file];
            var res: any = [];
            for (var r of data) {
                exports.push({
                    qualifiedName: r.qualifiedName,
                    file: r.file.replace("../src/", ""),
                    fileSize: r.fileSize,
                    kind: r.node.kind,
                    imports: imports[file]
                });
            }
        }

        return exports;
    }

    private finalizeFilePath(file: string): string {
        return file.replace("../src/", "");
    }
}

//hook
var sourceFiles = glob.sync('./../src/jsidea/**/**.ts');
var dpm = new DependencyManager();
dpm.run(sourceFiles);
fs.writeFile("dependency.json", JSON.stringify(dpm.getData(), null, 2), function(err) {
    if (err)
        return console.log(err);
});