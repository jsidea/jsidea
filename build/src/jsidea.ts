import ts = require("typescript");
import glob = require("glob");
import fs = require('fs');

type Result = {
    [fileName: string]: string[];
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

    protected addQualifiedName(qualifiedName: string): void {
        if (!qualifiedName)
            return;
        var fileName: string = String(this._file.fileName);
        if (!this.result.hasOwnProperty(fileName))
            this.result[fileName] = [];
        if (this.result[fileName].indexOf(qualifiedName) === -1) {
            this.result[fileName].push(qualifiedName);
        }
    }

    protected prepare(sourceFiles: string[]): void {
        this.result = {};
    }


    protected finalize(): void { }
}

class ExportProcessor extends BaseProcessor {
    public association: Result = null;

    private _stack: ts.ModuleDeclaration[] = [];

    protected prepare(sourceFiles: string[]): void {
        super.prepare(sourceFiles);
        this.association = {};
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
            this.addQualifiedName(this.getQualifiedName(node));
        }
    }

    private isExported(node: ts.Node): boolean {
        if (this._stack.length == 0)
            return false;
        var name = this.getName(node);
        var mod: any = this._stack[this._stack.length - 1];
        return mod.symbol ? Boolean(mod.symbol.exports.hasOwnProperty(name)) : false;
    }

    protected finalize(): void {
        Object.keys(this.result).forEach(fileName => {
            this.result[fileName].forEach(symbol => {
                if (!this.association.hasOwnProperty(symbol)) {
                    this.association[symbol] = [];
                }
                if (this.association[symbol].indexOf(fileName) === -1) {
                    this.association[symbol].push(fileName);
                }
            });
        });
    }
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
        var fullName = this.getQualifiedName(node);
        if (fullName) {
            this.addQualifiedName(fullName);
        }
    }

    protected finalize(): void {

    }
}

type DependencyTree = {
    [index: string]: string[];
}

function pushIfNotContained(arr: any[], obj: any) {
    if (arr.indexOf(obj) === -1) {
        arr.push(obj);
    }
}

class DependencyManager {
    createDepdencyTree(bySymbolExportReport: Result, usageReport: Result): DependencyTree {
        var tree: DependencyTree = {};
        Object.keys(usageReport).forEach(fileName => {
            usageReport[fileName].forEach(symbol => {
                if (bySymbolExportReport.hasOwnProperty(symbol)) {
                    this.addDependentFilesToFiles(tree, fileName, bySymbolExportReport[symbol]);
                }
            })
        });
        return tree;
    }
    sortFromDepdencyTree(tree: DependencyTree): string[] {
        var sortedFiles = [];
        Object.keys(tree).forEach(fileWithDepdendencies => {
            this.getDependenciesOf(tree, fileWithDepdendencies).forEach(r => {
                pushIfNotContained(sortedFiles, r);
            });
            pushIfNotContained(sortedFiles, fileWithDepdendencies);
        });
        return sortedFiles;
    }

    private getDependenciesOf(tree: DependencyTree, file: string): string[] {
        var result = [];
        tree[file].forEach(dependency => {
            this.getDependenciesOf(tree, dependency).forEach(res => {
                pushIfNotContained(result, res);
            });
            result.push(dependency);
        });
        return result;
    }

    private addDependentFilesToFiles(tree: DependencyTree, fileName: string, files: string[]) {
        if (!tree.hasOwnProperty(fileName)) {
            tree[fileName] = [];
        }
        if (files.indexOf(fileName) === -1) {
            files.forEach(file => {
                if (file !== fileName && !tree[fileName].hasOwnProperty(file)) {
                    pushIfNotContained(tree[fileName], file);
                }
            });
        }
    }
}

var sourceFiles = glob.sync('./../src/jsidea/**/**.ts');
var im = new ImportProcessor();
im.run(sourceFiles);
var ex = new ExportProcessor();
ex.run(sourceFiles);
var dpm = new DependencyManager();
var tree = dpm.createDepdencyTree(ex.association, im.result);

function fileNameToQualifiedName(fileName: string): string {
    fileName = fileName.replace("../src/", "");
    fileName = fileName.replace(/\//gi, ".");
    var idx = fileName.lastIndexOf(".ts");
    return fileName.substring(0, idx);
}
Object.keys(tree).forEach(fileName => {
    var val = tree[fileName];
    delete tree[fileName];
    fileName = fileNameToQualifiedName(fileName);
    tree[fileName] = val;
    var l = val.length;
    for (var i = 0; i < l; ++i)
        val[i] = fileNameToQualifiedName(val[i]);
});

fs.writeFile("dependency.json", JSON.stringify(tree, null, 2), function(err) {
    if (err) {
        return console.log(err);
    }
});