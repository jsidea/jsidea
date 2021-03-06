namespace jsidea.build.Minify {
    export interface IJavaScriptOptions extends UglifyJS.IOptions {

    }
    class JavaScriptMinify {
        //SOURCE: https://gist.github.com/jpillora/5652641
        //SOURCE: https://github.com/mishoo/UglifyJS2/blob/master/tools/node.js#L52
        public apply(files: IFile[], options?: IJavaScriptOptions): IMinifyResult {
            options = UglifyJS.defaults(options, {
                outSourceMap: null,
                sourceRoot: null,
                inSourceMap: null,
                fromString: false,
                warnings: false,
                mangle: {},
                output: null,
                compress: {}
            });
            UglifyJS.base54.reset();

            // 1. parse
            var haveScope = false;
            var topLevel: any = null;
            var sourcesContent: any = {};

            files.forEach(function(file, i) {
                var code = file.code;
                sourcesContent[file.name] = code;
                topLevel = UglifyJS.parse(code, {
                    filename: options.fromString ? i : file.name,
                    toplevel: topLevel
                });
            });

            console.log(topLevel);
            
            if (options.wrap)
                topLevel = topLevel.wrap_commonjs(options.wrap, options.exportAll);

            // 2. compress
            if (options.compress) {
                var compress = { warnings: options.warnings };
                UglifyJS.merge(compress, options.compress);
                topLevel.figure_out_scope();
                haveScope = true;
                var sq = UglifyJS.Compressor(compress);
                topLevel = topLevel.transform(sq);
            }

            // 3. mangle
            if (options.mangle) {
                topLevel.figure_out_scope(options.mangle);
                haveScope = true;
                topLevel.compute_char_frequency(options.mangle);
                topLevel.mangle_names(options.mangle);
            }

            // 4. scope (if needed)
            if (!haveScope)
                topLevel.figure_out_scope();

            // 5. output
            var inMap = options.inSourceMap;
            var output: any = {};
            if (typeof options.inSourceMap == "string")
                inMap = options.inSourceMap;

            if (options.outSourceMap) {
                output.source_map = UglifyJS.SourceMap({
                    file: options.outSourceMap,
                    orig: inMap,
                    root: options.sourceRoot
                });
                if (options.sourceMapIncludeSources) {
                    for (var file in sourcesContent) {
                        if (sourcesContent.hasOwnProperty(file))
                            output.source_map.get().setSourceContent(file, sourcesContent[file]);
                    }
                }

            }
            if (options.output)
                UglifyJS.merge(output, options.output);

            var stream = UglifyJS.OutputStream(output);
            topLevel.print(stream);

            stream = stream.toString();
            if (options.outSourceMap && "string" === typeof options.outSourceMap)
                stream += "\n//# sourceMappingURL=" + options.outSourceMap;

            var source_map = output.source_map;
            if (source_map)
                source_map = source_map + "";

            return {
                code: stream,
                map: source_map
            };
        }
    }

    export var JAVASCRIPT = new JavaScriptMinify();
}

if (UglifyJS)
    UglifyJS.AST_Node.warn_function = (txt: string) => console.warn(txt);