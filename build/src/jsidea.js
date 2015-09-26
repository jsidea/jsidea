var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var glob = require("glob");
var fs = require('fs');
var BaseProcessor = (function () {
    function BaseProcessor() {
        this.result = null;
        this._options = { noLib: true };
    }
    BaseProcessor.prototype.run = function (sourceFiles) {
        var _this = this;
        this.prepare(sourceFiles);
        this._host = ts.createCompilerHost(this._options);
        this._program = ts.createProgram(sourceFiles, this._options, this._host);
        this._program.getSourceFiles().forEach(function (file) { _this._file = file; _this.processNode(file); });
        this.finalize();
    };
    BaseProcessor.prototype.getQualifiedName = function (node) {
        var symbol = this.getSymbol(node);
        if (!symbol)
            return "";
        return this._program.getTypeChecker().getFullyQualifiedName(symbol);
    };
    BaseProcessor.prototype.getName = function (node) {
        var path = this.getPath(node);
        return path ? path[path.length - 1] : "";
    };
    BaseProcessor.prototype.getPath = function (node) {
        var qname = this.getQualifiedName(node);
        if (qname)
            return qname.split(".");
        return null;
    };
    BaseProcessor.prototype.getSymbol = function (node) {
        var symbol = this._program.getTypeChecker().getSymbolAtLocation(node);
        if (!symbol)
            symbol = node.symbol;
        return symbol;
    };
    BaseProcessor.prototype.addQualifiedName = function (qualifiedName) {
        if (!qualifiedName)
            return;
        var fileName = String(this._file.fileName);
        if (!this.result.hasOwnProperty(fileName))
            this.result[fileName] = [];
        if (this.result[fileName].indexOf(qualifiedName) === -1) {
            this.result[fileName].push(qualifiedName);
        }
    };
    BaseProcessor.prototype.prepare = function (sourceFiles) {
        this.result = {};
    };
    BaseProcessor.prototype.finalize = function () { };
    return BaseProcessor;
})();
var ExportProcessor = (function (_super) {
    __extends(ExportProcessor, _super);
    function ExportProcessor() {
        _super.apply(this, arguments);
        this.association = null;
        this._stack = [];
    }
    ExportProcessor.prototype.prepare = function (sourceFiles) {
        _super.prototype.prepare.call(this, sourceFiles);
        this.association = {};
    };
    ExportProcessor.prototype.processNode = function (node) {
        var _this = this;
        if (node.kind == 216 /* ModuleDeclaration */)
            this._stack.push(node);
        switch (node.kind) {
            case 216 /* ModuleDeclaration */:
            case 212 /* ClassDeclaration */:
            case 213 /* InterfaceDeclaration */:
            case 215 /* EnumDeclaration */:
            case 209 /* VariableDeclaration */:
                this.extract(node);
        }
        var skipChildren = node.kind == 212 /* ClassDeclaration */;
        if (!skipChildren)
            ts.forEachChild(node, function (node) { return _this.processNode(node); });
        if (node.kind == 216 /* ModuleDeclaration */)
            this._stack.pop();
    };
    ExportProcessor.prototype.extract = function (node) {
        if (this.isExported(node)) {
            this.addQualifiedName(this.getQualifiedName(node));
        }
    };
    ExportProcessor.prototype.isExported = function (node) {
        if (this._stack.length == 0)
            return false;
        var name = this.getName(node);
        var mod = this._stack[this._stack.length - 1];
        return mod.symbol ? mod.symbol.exports.hasOwnProperty(name) : false;
    };
    ExportProcessor.prototype.finalize = function () {
        var _this = this;
        Object.keys(this.result).forEach(function (fileName) {
            _this.result[fileName].forEach(function (symbol) {
                if (!_this.association.hasOwnProperty(symbol)) {
                    _this.association[symbol] = [];
                }
                if (_this.association[symbol].indexOf(fileName) === -1) {
                    _this.association[symbol].push(fileName);
                }
            });
        });
    };
    return ExportProcessor;
})(BaseProcessor);
var ImportProcessor = (function (_super) {
    __extends(ImportProcessor, _super);
    function ImportProcessor() {
        _super.apply(this, arguments);
    }
    ImportProcessor.prototype.processNode = function (node) {
        var _this = this;
        if (node.kind === 67 /* Identifier */) {
            this.extract(node);
        }
        else if (node.kind === 164 /* PropertyAccessExpression */) {
            return this.extract(node);
        }
        ts.forEachChild(node, function (node) { return _this.processNode(node); });
    };
    ImportProcessor.prototype.extract = function (node) {
        var path = this.getPath(node);
        if (path) {
            var fullName = "";
            var l = path.length;
            for (var i = 0; i < l; ++i) {
                fullName += (fullName ? "." : "") + path[i];
                this.addQualifiedName(fullName);
            }
        }
    };
    return ImportProcessor;
})(BaseProcessor);
var DependencyManager = (function () {
    function DependencyManager() {
    }
    DependencyManager.prototype.run = function (sourceFiles) {
        var _this = this;
        var im = new ImportProcessor();
        im.run(sourceFiles);
        var ex = new ExportProcessor();
        ex.run(sourceFiles);
        var importResult = im.result;
        var association = ex.association;
        var tree = {};
        Object.keys(importResult).forEach(function (fileName) {
            importResult[fileName].forEach(function (symbol) {
                if (association.hasOwnProperty(symbol)) {
                    _this.addDependentFilesToFiles(tree, fileName, association[symbol]);
                }
            });
        });
        Object.keys(tree).forEach(function (fileName) {
            var val = tree[fileName];
            delete tree[fileName];
            fileName = _this.fileNameToQualifiedName(fileName);
            tree[fileName] = val;
            var l = val.length;
            for (var i = 0; i < l; ++i)
                val[i] = _this.fileNameToQualifiedName(val[i]);
        });
        //        console.log(im.result["../src/jsidea/display/Graphics.ts"]);
        return tree;
    };
    DependencyManager.prototype.fileNameToQualifiedName = function (fileName) {
        fileName = fileName.replace("../src/", "");
        fileName = fileName.replace(/\//gi, ".");
        var idx = fileName.lastIndexOf(".ts");
        return fileName.substring(0, idx);
    };
    DependencyManager.prototype.getDependenciesOf = function (tree, file) {
        var _this = this;
        var result = [];
        tree[file].forEach(function (dependency) {
            _this.getDependenciesOf(tree, dependency).forEach(function (res) {
                if (result.indexOf(res) < 0)
                    result.push(res);
            });
            result.push(dependency);
        });
        return result;
    };
    DependencyManager.prototype.addDependentFilesToFiles = function (tree, fileName, files) {
        if (!tree.hasOwnProperty(fileName)) {
            tree[fileName] = [];
        }
        if (files.indexOf(fileName) === -1) {
            files.forEach(function (file) {
                if (file !== fileName && !tree[fileName].hasOwnProperty(file)) {
                    if (tree[fileName].indexOf(file) < 0)
                        tree[fileName].push(file);
                }
            });
        }
    };
    return DependencyManager;
})();
//hook
var sourceFiles = glob.sync('./../src/jsidea/**/**.ts');
var dpm = new DependencyManager();
var tree = dpm.run(sourceFiles);
fs.writeFile("dependency.json", JSON.stringify(tree, null, 2), function (err) {
    if (err)
        return console.log(err);
});
