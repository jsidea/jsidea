//TODO: include license/source
//author: not me
var ts = require("typescript");
var glob = require("glob");
var ExportExtractor = (function () {
    function ExportExtractor() {
        this.result = {};
        this.options = {
            noLib: true
        };
        this.host = ts.createCompilerHost(this.options);
        this.program = null;
        this.moduleStack = [];
        this.currentFile = null;
        this._c = 0;
    }
    ExportExtractor.prototype.getReport = function (sourceFiles) {
        var _this = this;
        this.host = ts.createCompilerHost(this.options);
        this.program = ts.createProgram(sourceFiles, this.options, this.host);
        this.program.getSourceFiles().forEach(function (file) { return _this.processFile(file); });
        var report = this.result;
        Object.keys(report).forEach(function (fileName) {
            var signatures = report[fileName];
            var l = signatures.length;
            for (var i = 1; i < l; ++i) {
                signatures[i] = signatures[0] + "." + signatures[i];
            }
            if (l > 1)
                signatures.splice(0, 1);
        });
        return report;
    };
    ExportExtractor.prototype.convertReport = function (report) {
        var result = {};
        Object.keys(report).forEach(function (fileName) {
            report[fileName].forEach(function (symbol) {
                if (!result.hasOwnProperty(symbol)) {
                    result[symbol] = [];
                }
                if (result[symbol].indexOf(fileName) === -1) {
                    result[symbol].push(fileName);
                }
            });
        });
        return result;
    };
    ExportExtractor.prototype.addToReport = function (report, fileName, obj) {
        //        console.log("ADD TO REPORT", fileName, obj);
        if (!report.hasOwnProperty(fileName)) {
            report[fileName] = [];
        }
        if (report[fileName].indexOf(obj) === -1) {
            report[fileName].push(obj);
        }
    };
    ExportExtractor.prototype.isExported = function (node) {
        if (!node.modifiers) {
            return false;
        }
        return node.modifiers.some(function (node) { return node.kind ===
            80 /* ExportKeyword */; });
    };
    ExportExtractor.prototype.isVarExported = function (node) {
        return (node.flags & 1 /* Export */) !== 0;
    };
    ExportExtractor.prototype.processFile = function (file) {
        this.currentFile = file;
        this.processNode(file);
    };
    ExportExtractor.prototype.getDeclarationFullName = function (declaration) {
        if (!declaration)
            return "";
        var name = "";
        while (declaration) {
            var cls;
            if (!declaration.name) {
                if (declaration.left)
                    cls = declaration.left + "." + declaration.right;
                else if (declaration.text)
                    cls = declaration.text;
                else
                    cls = "";
            }
            else
                cls = declaration.name ? declaration.name.text : "";
            if (cls)
                name = name + (name ? "." : "") + cls;
            if (!declaration.parent)
                declaration = declaration.body;
            else
                declaration = declaration.parent;
        }
        return name;
    };
    ExportExtractor.prototype.exportNeeded = function () {
        return this.moduleStack.length > 0;
    };
    ExportExtractor.prototype.processComplexDeclaration = function (node) {
        var complexDeclaration = node;
        if (!this.exportNeeded() || this.isExported(complexDeclaration)) {
            this.addToReport(this.result, this.currentFile.fileName, this.getDeclarationFullName(complexDeclaration));
        }
        else {
        }
    };
    ExportExtractor.prototype.processVarDeclaration = function (node) {
        var variableDeclaration = node;
        if (!node.parent || !this.exportNeeded() || this.isVarExported(variableDeclaration)) {
            this.addToReport(this.result, this.currentFile.fileName, this.getDeclarationFullName(variableDeclaration));
        }
        else {
        }
    };
    ExportExtractor.prototype.processNode = function (node) {
        var _this = this;
        var skipChildren = false;
        switch (node.kind) {
            case 216 /* ModuleDeclaration */:
                this.processComplexDeclaration(node);
                this.moduleStack.push(node);
                break;
            case 212 /* ClassDeclaration */:
                this.processComplexDeclaration(node);
                skipChildren = true;
                break;
            case 213 /* InterfaceDeclaration */:
                this.processComplexDeclaration(node);
                break;
            case 215 /* EnumDeclaration */:
                this.processComplexDeclaration(node);
                break;
            case 209 /* VariableDeclaration */:
                this.processVarDeclaration(node);
                break;
        }
        //        if (node.name && node.name.text == "TRANSFORM")
        //            console.log(node, node.kind);
        //        if (!this.skipInternal) {
        //            if (this._c++ < 10)
        //                console.log(node);
        if (!skipChildren)
            ts.forEachChild(node, function (node) { return _this.processNode(node); });
        //        }
        if (node.kind == 216 /* ModuleDeclaration */)
            this.moduleStack.pop();
    };
    return ExportExtractor;
})();
var tsAlias = ts;
var UsageExtractor = (function () {
    function UsageExtractor() {
        this.program = null;
        this.report = {};
    }
    UsageExtractor.prototype.findUsages = function (sourceFiles) {
        var _this = this;
        var options = { noLib: true };
        var host = ts.createCompilerHost(options);
        this.program = ts.createProgram(sourceFiles, options, host);
        this.program.getSourceFiles().forEach(function (file) { return _this.processFile(file); });
        return this.report;
    };
    UsageExtractor.prototype.processFile = function (file) {
        this.currentFile = file;
        this.processNode(file);
    };
    UsageExtractor.prototype.processNode = function (node) {
        var _this = this;
        if (node.kind === 67 /* Identifier */) {
            var identifier = node;
            this.addNode(node);
        }
        else if (node.kind === 164 /* PropertyAccessExpression */) {
            return this.addNode(node);
        }
        ts.forEachChild(node, function (node) { return _this.processNode(node); });
    };
    UsageExtractor.prototype.addUsageToCurrentFile = function (usage, file) {
        if (!this.report.hasOwnProperty(this.currentFile.fileName)) {
            this.report[this.currentFile.fileName] = [];
        }
        if (this.report[this.currentFile.fileName].indexOf(usage) === -1) {
            this.report[this.currentFile.fileName].push(usage);
        }
    };
    UsageExtractor.prototype.addNode = function (node) {
        var fullName = this.getFullName(node);
        if (fullName) {
            this.addUsageToCurrentFile(this.getFullName(node), node);
        }
    };
    UsageExtractor.prototype.getFullName = function (node) {
        var symbol = this.program.getTypeChecker().getSymbolAtLocation(node);
        if (!symbol)
            return null;
        return this.program.getTypeChecker().getFullyQualifiedName(symbol);
    };
    return UsageExtractor;
})();
function pushIfNotContained(arr, obj) {
    if (arr.indexOf(obj) === -1) {
        arr.push(obj);
    }
}
var DependencyManager = (function () {
    function DependencyManager() {
    }
    DependencyManager.prototype.createDepdencyTree = function (bySymbolExportReport, usageReport) {
        var _this = this;
        var tree = {};
        Object.keys(usageReport).forEach(function (fileName) {
            usageReport[fileName].forEach(function (symbol) {
                if (bySymbolExportReport.hasOwnProperty(symbol)) {
                    _this.addDependentFilesToFiles(tree, fileName, bySymbolExportReport[symbol]);
                }
            });
        });
        return tree;
    };
    DependencyManager.prototype.sortFromDepdencyTree = function (tree) {
        var _this = this;
        var sortedFiles = [];
        Object.keys(tree).forEach(function (fileWithDepdendencies) {
            _this.getDependenciesOf(tree, fileWithDepdendencies).forEach(function (r) {
                pushIfNotContained(sortedFiles, r);
            });
            pushIfNotContained(sortedFiles, fileWithDepdendencies);
        });
        return sortedFiles;
    };
    DependencyManager.prototype.getDependenciesOf = function (tree, file) {
        var _this = this;
        var result = [];
        tree[file].forEach(function (dependency) {
            _this.getDependenciesOf(tree, dependency).forEach(function (res) {
                pushIfNotContained(result, res);
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
                    pushIfNotContained(tree[fileName], file);
                }
            });
        }
    };
    return DependencyManager;
})();
//var sourceFiles = glob.sync('./../src/jsidea.ts');
//var sourceFiles = glob.sync('./../src/jsidea/layout/MoveMode/Transform.ts');
var sourceFiles = glob.sync('./../src/jsidea/**/**.ts');
var exp = new ExportExtractor();
var expReport = exp.getReport(sourceFiles);
var expReportC = exp.convertReport(expReport);
var usg = new UsageExtractor();
var usageReport = usg.findUsages(sourceFiles);
var dpm = new DependencyManager();
var tree = dpm.createDepdencyTree(expReportC, usageReport);
//console.log(tree);
function correctFileName(fileName) {
    fileName = fileName.replace("../src/", "");
    fileName = fileName.replace(/\//gi, ".");
    var idx = fileName.lastIndexOf(".ts");
    return fileName.substring(0, idx);
}
Object.keys(tree).forEach(function (fileName) {
    var val = tree[fileName];
    delete tree[fileName];
    fileName = correctFileName(fileName);
    tree[fileName] = val;
    var l = val.length;
    for (var i = 0; i < l; ++i)
        val[i] = correctFileName(val[i]);
});
var fs = require('fs');
fs.writeFile("dependency.json", JSON.stringify(tree, null, 2), function (err) {
    if (err) {
        return console.log(err);
    }
});
//console.log(expReportC["jsidea.layout.Transform"]);
//console.log(expReport);
//console.log(usageReport["../src/jsidea/display/Graphics.ts"]);
//console.log(usageReport["../src/jsidea/layout/Transform.ts"]);
console.log(usageReport["../src/jsidea/layout/TransformMode/Planar.ts"]);
