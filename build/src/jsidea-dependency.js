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
    BaseProcessor.prototype.addToResult = function (qualifiedName, node) {
        if (!qualifiedName)
            return;
        var fileName = String(this._file.fileName);
        if (!this.result.hasOwnProperty(fileName)) {
            this.result[fileName] = [];
        }
        if (this.getIndexOfQualifiedName(qualifiedName, this.result[fileName]) === -1) {
            var stats = fs.statSync(this._file.fileName.replace(".ts", ".js"));
            var fileSizeInBytes = stats["size"];
            this.result[fileName].push({ qualifiedName: qualifiedName, node: node, file: this._file.fileName, fileSize: fileSizeInBytes });
        }
    };
    BaseProcessor.prototype.getIndexOfQualifiedName = function (qualifiedName, refs) {
        var l = refs.length;
        for (var i = 0; i < l; ++i)
            if (refs[i].qualifiedName == qualifiedName)
                return i;
        return -1;
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
        this._stack = [];
    }
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
            case 211 /* FunctionDeclaration */:
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
            this.addToResult(this.getQualifiedName(node), node);
        }
    };
    ExportProcessor.prototype.isExported = function (node) {
        if (this._stack.length == 0)
            return false;
        var name = this.getName(node);
        var mod = this._stack[this._stack.length - 1];
        return mod.symbol ? mod.symbol.exports.hasOwnProperty(name) : false;
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
                this.addToResult(fullName, node);
            }
        }
    };
    return ImportProcessor;
})(BaseProcessor);
var DependencyManager = (function () {
    function DependencyManager() {
        this.imports = null;
        this.exports = null;
    }
    DependencyManager.prototype.run = function (sourceFiles) {
        this.imports = new ImportProcessor();
        this.imports.run(sourceFiles);
        this.exports = new ExportProcessor();
        this.exports.run(sourceFiles);
        //get all exports
        var exportsAll = [];
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
    };
    DependencyManager.prototype.getData = function () {
        var imports = {};
        for (var file in this.imports.result) {
            var data = this.imports.result[file];
            var res = [];
            for (var _i = 0; _i < data.length; _i++) {
                var r = data[_i];
                res.push(r.qualifiedName);
            }
            imports[file] = res;
        }
        var exports = [];
        for (var file in this.exports.result) {
            var data = this.exports.result[file];
            var res = [];
            for (var _a = 0; _a < data.length; _a++) {
                var r = data[_a];
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
    };
    DependencyManager.prototype.finalizeFilePath = function (file) {
        return file.replace("../src/", "");
    };
    return DependencyManager;
})();
//hook
var sourceFiles = glob.sync('./../src/jsidea/**/**.ts');
var dpm = new DependencyManager();
dpm.run(sourceFiles);
fs.writeFile("dependency.json", JSON.stringify(dpm.getData(), null, 2), function (err) {
    if (err)
        return console.log(err);
});
