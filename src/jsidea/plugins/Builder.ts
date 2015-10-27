namespace jsidea.plugins {
    export interface IFile {
        name: string;
        size: number;
        code: string;
        sizeMinified?: number;
    }
    export interface IData {
        project: any;
        files: IFile[];
        typescript: ISymbol[];
    }
    export interface IReferenceData {
        fullName: string;
        file: string | IFile;
        kind: number;
        imports: any[];
    }
    export interface ISymbol extends IReferenceData {
        ui: SymbolUI;
        relations: ISymbol[];
        usage: ISymbol[];
        imports: ISymbol[];
        usageOrder: number;
        file: IFile;
        name: string;
        url: string;
        module: IModule;
        isDependent: boolean;
        isChecked: boolean;
    }
    export interface IModule {
        ui: ModuleUI;
        fullName: string;
        name: string;
        symbols: ISymbol[];
    }
    type SortFunction = (a: ISymbol, b: ISymbol) => number;
    export class ModuleUI {
        public element: HTMLElement;
        public list: HTMLDivElement;
        private _data: IModule;
        private _header: HTMLDivElement;
        private _docs: HTMLAnchorElement;

        constructor(data: IModule) {
            this._data = data;

            var element = document.createElement("div");
            element.className = "module";
            element.id = data.fullName;
            this.element = element;

            var header = document.createElement("div");
            header.className = "header";
            header.textContent = data.fullName.replace("jsidea.", "");
            this._header = header;

            var list = document.createElement("div");
            list.className = "list";
            this.list = list;

            //            var docs = document.createElement("a");
            //            docs.className = "docs";
            //            docs.href = data.;
            //            this._docs = docs;
            
            element.appendChild(header);
            //            header.appendChild(docs);
            element.appendChild(list);

            header.addEventListener("click", () => {
                element.classList.toggle("collapsed");
            });
            
            
            //            docs.addEventListener("click", () => {
            //                
            //            });            
        }
    }
    export class SymbolUI {
        private _data: ISymbol;
        public element: HTMLElement;
        private _docs: HTMLAnchorElement;

        constructor(data: ISymbol) {
            this._data = data;

            this.element = document.createElement("div");

            var e = this.element;

            e.className = "symbol";
            e.id = data.fullName;
            e.setAttribute("data-checked", "0");
            e.setAttribute("data-dependent", "0");
            e.setAttribute("data-kind", data.kind.toString());

            var chk = document.createElement("div");
            chk.className = "checkbox";
            e.appendChild(chk);

            var lab = document.createElement("div");
            lab.className = "label";
            lab.textContent = data.name;// + " [" + text.Text.fileSize(data.file.size) + " " + text.Text.fileSize(data.file.sizeMinified) + "]";
            //            lab.textContent = reference.name + " [" + reference.file.size + " " + reference.file.sizeMinified + "]";
            e.appendChild(lab);

            var docs = document.createElement("a");
            docs.className = "docs";
            docs.href = data.url;
            e.appendChild(docs);
            this._docs = docs;

            docs.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        public setChecked(checked: boolean): void {
            this.element.setAttribute("data-checked", checked ? "1" : "0");
        }

        public setDependent(dependent: boolean): void {
            this.element.setAttribute("data-dependent", dependent ? "1" : "0");
        }
    }
    export class Builder extends Plugin {

        public symbols: ISymbol[] = null;
        public files: IFile[] = null;
        public modules: IModule[] = null;

        private _content: HTMLDivElement = null;

        public static SORT_FILESIZE: SortFunction = (a, b) => {
            return a.file.size - b.file.size;
        };

        public static SORT_USAGE: SortFunction = (a, b) => {
            return a.usageOrder - b.usageOrder;
        };

        public static SORT_MODULE: SortFunction = (a, b) => {
            if (a.module != b.module)
                return a.module.fullName.localeCompare(b.module.fullName);
            if (a.name != b.name)
                return a.name.localeCompare(b.name);
            return a.fullName.localeCompare(b.fullName);
        };

        public static SORT_NAME: SortFunction = (a, b) => {
            return a.name.localeCompare(b.name);
        };

        constructor() {
            super();

            var project = "jsidea";
            var version = "0.0.1";
            var url = "http://127.0.0.1/eventfive/jsidea-website/build/" + project + "/" + version + "/" + project + ".build.json";
            var klaus = "PETER";

            var req = new model.Request<IData>(url);
            //            req.method = model.RequestMethod.GET;
            req.reader = model.Reader.JSON;
            req.onFail.add((e) => console.log("ERROR", e));
            req.onSuccess.add((data) => this.parse(data));
            req.load();

            //            var u = new model.URL(url);
            //            var params = u.parameters;
            //            params["TEST"] = "HELLO WORLD 1";
            //            params["TEST"] = "HELLO WORLD 2";
            //            u.parameters = params;
            //            u.addParameters({ "asfasdf": 5 });
            //            console.log(u.url);
            
            //            console.log(t.scope == Builder);
            
            //            var drag = new action.Drag();

        }

        private parse(dat: IData): void {
            var data = dat.typescript;
            this._content = document.createElement("div");
            this._content.id = "dependency";
            document.body.appendChild(this._content);
            
            //            var host = ts.createCompilerHost({ noLib: true });
            //            console.log(host);
            
            //get all exports
            this.symbols = data;
            this.files = dat.files;
            this.modules = [];
            
            //            for (var file of dat.files)
            //                file.sizeMinified = text.Text.byteLengthUTF8(file.code);
            
            //create/collect references
            var refs: ISymbol[] = this.symbols;
            
            //resolve names to IReference objects
            var moduleLookup: any = {};
            var modules: IModule[] = this.modules;
            for (var ref of refs) {
                ref.file = this.getFileByName(<any>ref.file);
                for (var i = 0; i < ref.imports.length; ++i)
                    ref.imports[i] = this.getByQualifiedName(<any>ref.imports[i]);
                var path = ref.fullName.split(".");
                ref.name = path[path.length - 1];
                ref.module = null;//
                ref.isDependent = false;
                ref.isChecked = false;
                var moduleName = path.slice(0, path.length - 1).join(".");
                if (!moduleLookup[moduleName]) {
                    ref.module = { fullName: moduleName, name: path[path.length - 2], symbols: [ref], ui: null };
                    moduleLookup[moduleName] = ref.module;
                    modules.push(ref.module);
                }
                else {
                    ref.module = moduleLookup[moduleName];
                    ref.module.symbols.push(ref);
                }

                if (!ref.usage)
                    ref.usage = [];
                for (var chi of ref.imports) {
                    if (!chi.usage)
                        chi.usage = [];
                    if (chi.usage.indexOf(ref) === -1)
                        chi.usage.push(ref);
                }
                ref.url = this.getURL(ref);
            }

            modules.sort((a, b) => {
                return a.fullName.localeCompare(b.fullName);
            });

            //create ui
            for (var mod of modules) {
                mod.symbols.sort(Builder.SORT_NAME);
                mod.ui = this.createModuleUI(mod);
                for (var sym of mod.symbols) {
                    sym.ui = this.createSymbolUI(sym);
                }
            }
            
            //multipath(2/3)
            for (var ref of refs) {
                ref.relations = this.createRelations(ref);
            }

            this.sort(Builder.SORT_MODULE);
            
            //multipath(3/3)
            var ordered = this.getOrderedSymbols();
            var i = 0;
            for (var ref of ordered) {
                ref.usageOrder = i++;
            }

            this.sort(Builder.SORT_MODULE);
            
            //            console.log(SourceMapGenerator);
            //            return;
            
            //---------------
            //TEST TYPESCRIPT
            //---------------
            
            //            var filesToCompile = this.files;
            //            var opt: ts.CompilerOptions = {};
            //            opt.declaration = true;
            //            opt.sourceMap = true;
            //            opt.outFile = "jsidea.js";
            //            var host = new build.VirtualHost(filesToCompile);
            //            var names = [];
            //            for (var f of this.files)
            //                names.push(f.name);
            //            var program = ts.createProgram(names, opt, host);
            //            var em = program.emit();
            //            console.log(host.results);

            //            var s = new build.SymbolProcessor();
            //            s.run(this.files);
            //            console.log("EXPORTS", s.exports);
            
            //            console.log("INIT");
            var host = new build.FileSystem(this.files);

            //            console.log(document.querySelector("script[src~='src/jsidea/system/System.js']"));
            //            console.log(document.querySelectorAll("script[src*='System']"));
            var tsFiles = host.match("*.ts");
            var requests: model.Request<string>[] = [];
            var z = 0;
            for (var file of tsFiles) {
                var jsFileName = file.name.replace(".ts", ".js");
                var script: HTMLScriptElement = <HTMLScriptElement>document.querySelector("script[src*='" + jsFileName + "']");
                if (!script)
                    continue;
                requests.push(new model.Request<string>(script.src));
                //                if (z++ > 1)
                //                    break;
            }
            model.Request.bulk(requests, () => {
                for (var r of requests) {

                    host.write(r.url.path, r.response);
                }
                
                //            console.log("TS FILES", tsFiles);
                //
                //            console.log("START");
            
                //            var filesToCompile = host.match("*.ts");
                //            
                //            var opt: ts.CompilerOptions = {};
                //            opt.declaration = true;
                //            opt.sourceMap = true;
                //            opt.outFile = "jsidea.js";
                //            
                //            var names = [];
                //            for (var f of filesToCompile)
                //                names.push(f.name);
                //            
                //            var program = ts.createProgram(names, opt, host);
                //            var em = program.emit();

                //            console.log("MATCH", host.match("*.map"));
            
                //            var result = build.Usage.TYPESCRIPT.apply(host.match("*.ts"));
                //            console.log("SYMBOLS", result.symbols);

                //                console.log("TEST");//, fi);
                //                console.log("WHY");
                //                return;
                
//                var jsFiles = host.match("*layout/Transform.js|*Border.js|*Number.js");
                var jsFiles = host.match("*.js");
                var usage = build.Usage.JAVASCRIPT.apply(jsFiles);

                //            console.log(topLevel);

                //            var options: any = {};
                //            var ot: any = {};
                //            //            ot.inSourceMap = host.results[0].code;
                //            //            ot.outSourceMap = true;
                //            var min = UglifyJS.minify(host.results[1].name, host, ot);
                //            console.log(min);
            });
        }
        private getURL(sym: ISymbol): string {
            var base = "http://127.0.0.1/eventfive/jsidea-build/bin/";
            if (sym.kind == 213)
                base += "interfaces/";
            else if (sym.kind == 212)
                base += "classes/";
            else if (sym.kind == 209)
                base += "modules/";
            base += sym.module.fullName.toLowerCase();
            if (sym.kind == 209)//variable declaration
                base += ".html#" + sym.name.toLowerCase();
            else if (sym.kind == 212 || sym.kind == 213)//class or interface
                base += "." + sym.name.toLowerCase() + ".html";
            return base;
        }

        private getOrderedSymbols(): ISymbol[] {
            function addAt(ary: any[], data: any, index: number): any[] {
                var head = ary.slice(0, index);
                var tail = ary.slice(index);
                ary.splice(0, ary.length);
                for (var da of head)
                    ary.push(da);
                ary.push(data);
                for (var da of tail)
                    ary.push(da);
                return ary;
            }

            var symbols = this.symbols;
            var res: ISymbol[] = [];
            for (var ref of symbols) {
                var l = res.length;
                for (var i = 0; i < l; ++i) {
                    //if its used by
                    if (res[i] == ref)
                        continue;
                    if (res[i].relations.indexOf(ref) >= 0) {
                        addAt(res, ref, i);
                        break;
                    }
                }
                if (res.indexOf(ref) === -1)
                    res.push(ref);
            }
            return res;
        }

        public getFileByName(name: string): IFile {
            for (var file of this.files)
                if (file.name == name)
                    return file;
            return null;
        }

        private getByQualifiedName(name: string): ISymbol {
            var refs = this.symbols;
            for (var ref of refs)
                if (ref.fullName == name)
                    return ref;
            return null;
        }

        private createRelations(ref: ISymbol, relations?: ISymbol[]): ISymbol[] {
            relations = relations || [];
            for (var imp of ref.imports) {
                if (relations.indexOf(imp) < 0) {
                    relations.push(imp);
                    //                    if (imp.usage.indexOf(ref) === -1)
                    //                        imp.usage.push(ref);
                    this.createRelations(imp, relations);
                }
            }
            return relations;
        }

        private createModuleUI(mod: IModule): ModuleUI {
            var ui = new ModuleUI(mod);
            this._content.appendChild(ui.element);
            //            ui.element.addEventListener("click", () => this.onClickElement(ref));
            return ui;
        }

        private createSymbolUI(ref: ISymbol): SymbolUI {
            var ui = new SymbolUI(ref);
            ref.module.ui.list.appendChild(ui.element);
            ui.element.addEventListener("click", () => this.onClickElement(ref));
            return ui;
        }

        private onClickElement(ref: ISymbol): void {
            ref.isChecked = !ref.isChecked;
            this.refreshDependency();
        }

        private refreshDependency(): void {
            //collect checked
            //and reset dependent
            var checked: ISymbol[] = [];
            for (var ref of this.symbols) {
                ref.isDependent = false;
                if (ref.isChecked)
                    checked.push(ref);
            }
            
            //mark dependencies
            for (var ref of checked)
                for (var rel of ref.relations)
                    rel.isDependent = true;
            
            //size
            var size = this.getSize();
            //            console.log("SIZE", text.Text.fileSize(size.bytesMinified));

            //refresh the ui-elements
            this.refreshUI();
        }

        private getSize(): { bytes: number, bytesMinified: number } {
            var files: IFile[] = [];
            for (var ref of this.symbols)
                if (ref.isDependent)
                    if (files.indexOf(ref.file) === -1)
                        files.push(ref.file);
            var bytesMinified = 0;
            var bytes = 0;
            for (var file of files) {
                bytes += file.size;
                bytesMinified += file.sizeMinified;
            }
            return { bytes: bytes, bytesMinified: bytesMinified };
        }

        public sort(f: SortFunction): void {
            this.symbols.sort(f);
            
            //            var display = this._list.style.display;
            //            this._list.style.display = "none";
            //            for (var symbol of this.symbols)
            //                this._list.appendChild(symbol.ui.getElement());
            //            this._list.style.display = display;
        }

        private refreshUI(): void {
            for (var ref of this.symbols) {
                ref.ui.setChecked(ref.isChecked);
                ref.ui.setDependent(ref.isDependent);
            }
        }
    }
}