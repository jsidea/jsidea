namespace jsidea.build.Usage {
    export interface IJavaScriptOptions {

    }
    class JavaScriptUsage implements IUsage {

        private _symbols: ISymbol[];
        private _stack: ts.ModuleDeclaration[];
        private _program: ts.Program;
        private _file: IFile;

        public apply(files: IFile[], options?: IJavaScriptOptions): IUsageResult {
            var fi = files.map((f, index) => { return f.name }).join(",");
            //            console.log(fi);
            //                return;
            //            console.log("FILES", jsFiles);
            //            build.Minify.JAVASCRIPT.apply(jsFiles);
            
            
            // 1. parse
            var haveScope = false;
            var topLevel: any = null;
            var sourcesContent: any = {};
            files.forEach(function(file, i) {
                var code = file.code;
                sourcesContent[file.name] = code;
                topLevel = UglifyJS.parse(code, {
                    filename: file.name,
                    toplevel: topLevel
                });
            });

            topLevel.figure_out_scope();

            
            //            fullName: string;
            //        file: IFile;
            //        kind: number;
            //        imports: ISymbol[];
            
            var usage: any = {};
            var lookup: any = {};
            var encs: any[] = [];
            var getQualiName = (jsSymbol: any) => {

                var names: string[] = [];//jsSymbol.name
                //                console.log(jsSymbol.scope.print_to_string());
                var sym = jsSymbol.scope;
                var enc: any = null;
                var scopes: any[] = [];
                var isUnd = false;
                do {
                    //                    enc = sym.enclosed[0];
                    //                    if (encs.indexOf(enc) >= 0)
                    //                        continue;
                    //                    encs.push(enc);
                    //                    
                    //                    var na = enc.name;
                    
                    
                    //                    var con = false;
                    //                    for(var s of scopes)
                    //                        if(s.equivalent_to(sym))
                    //                           {
                    //                            con = true;
                    //                            break;    
                    //                        }
                    //                    if(con)
                    //                        continue;
                    //                    
                    //                    scopes.push(sym);
                    
                    var na = sym.enclosed[0].name;
                    if (na == "undefined" || na == "Object") {
                        isUnd = true;
                        //                        sym = sym.parent_scope;
//                        console.log("UNDE", na);
                        continue;
                    }
                    //                    if (!isUnd)
                    
                    if (names.indexOf(na) < 0)
                        names.push(na);
                    isUnd = false;


                }
                while ((sym = sym.parent_scope))
                return names.reverse().join(".");
            };
            var walker = new UglifyJS.TreeWalker((node: any) => {
                if (node instanceof UglifyJS.AST_SymbolRef) {
                    var file = node.start.file;
                    if (!usage[file])
                        usage[file] = [];
                    if (!lookup[file])
                        lookup[file] = [];
                    var sym = node.scope.find_variable(node.name);
                    if (sym) {
                        var symName = getQualiName(sym);
                        for (var ref of sym.references) {
                            var refFile = symName + " " + ref.start.file;
                            if (symName && lookup[file].indexOf(symName) < 0) {
                                usage[file].push(refFile);
                                lookup[file].push(symName);
                            }
                        }
                        //                        console.log(sym.references);
                    }
                    //                        console.log(node.name, node.start.file, "->", sym ? sym.scope.start.file : sym);
                }
            });
            topLevel.walk(walker);
            console.log("USAGE", usage);

            return null;
        }
    }

    export var JAVASCRIPT = new JavaScriptUsage();
}