var ts = require("typescript");
var glob = require("glob");
var sourceFiles = glob.sync('./../src/jsidea.ts');
function compile(fileNames, options) {
    var program = ts.createProgram(fileNames, options);
    //    program.em
    //    var emitResult = program.emit();
    //
    //    var allDiagnostics = tsc.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    //
    //    allDiagnostics.forEach(diagnostic => {
    //        var { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    //        var message = tsc.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    //        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    //    });
    //
    //    var exitCode = emitResult.emitSkipped ? 1 : 0;
    //    console.log(`Process exiting with code '${exitCode}'.`);
    //    process.exit(exitCode);
}
compile(sourceFiles, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: 1 /* ES5 */,
    module: 1 /* CommonJS */
});