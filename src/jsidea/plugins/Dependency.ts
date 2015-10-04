namespace jsidea.plugins {
    interface IFile {
        name: string;
        size: number;
        sizeMinified: number;
        code: string;
    }
    interface IData {
        project: any;
        files: IFile[];
        typescript: ISymbol[];
    }
    interface IReferenceData {
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
        private _data: IModule;
        public element: HTMLElement;
        public list: HTMLDivElement;
        private _header: HTMLDivElement;

        constructor(data: IModule) {
            this._data = data;

            var list = document.createElement("div");
            var header = document.createElement("div");
            var element = document.createElement("div");

            list.className = "list";
            header.className = "header";
            header.textContent = data.fullName.replace("jsidea.", "");            
            
            element.className = "module";
            element.id = data.fullName;
            
            element.appendChild(header);
            element.appendChild(list);
            
            this.element = element;
            this.list = list;
            this._header = header;
        }
    }
    export class SymbolUI {
        private _data: ISymbol;
        public element: HTMLElement;

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
        }

        public setChecked(checked: boolean): void {
            this.element.setAttribute("data-checked", checked ? "1" : "0");
        }

        public setDependent(dependent: boolean): void {
            this.element.setAttribute("data-dependent", dependent ? "1" : "0");
        }
    }
    export class Dependency extends Plugin {

        public symbols: ISymbol[] = null;
        public files: IFile[] = null;
        public modules: IModule[] = null;

        private _ajax: XMLHttpRequest;
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
            this._ajax = new XMLHttpRequest();
            this._ajax.onreadystatechange = (e) => this.onReadyStateChange(e);

            var project = "jsidea";
            var version = "0.0.1";
            this.load("http://127.0.0.1/eventfive/jsidea-website/build/" + project + "/" + version + "/" + project + ".build.json");
        }

        public load(url: string): void {
            this._ajax.open("GET", url);
            this._ajax.send(null);
        }

        private onReadyStateChange(e: ProgressEvent): void {
            if (this._ajax.readyState == 4) {
                if (this._ajax.status == 200) {
                    this.parse(JSON.parse(this._ajax.responseText));
                }
                else {
                    console.log(this._ajax.statusText);
                }
            }
        }

        private parse(dat: IData): void {
            var data = dat.typescript;
            this._content = document.createElement("div");
            this._content.id = "dependency";
            document.body.appendChild(this._content);
            
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
            }

            modules.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });

            for (var mod of modules) {
                mod.symbols.sort(Dependency.SORT_NAME);
                mod.ui = this.createModuleUI(mod);
                for (var sym of mod.symbols) {
                    sym.ui = this.createSymbolUI(sym);
                }
            }
            
            //multipath(2/3)
            for (var ref of refs) {
                ref.relations = this.createRelations(ref);
            }

            this.sort(Dependency.SORT_MODULE);
            
            //multipath(3/3)
            var ordered = this.getOrderedSymbols();
            var i = 0;
            for (var ref of ordered) {
                ref.usageOrder = i++;
            }

            this.sort(Dependency.SORT_MODULE);
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