namespace jsidea.plugins {
    interface IFile {
        name: string;
        size: number;
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
        ui: DependencyUI;
        relations: ISymbol[];
        imports: ISymbol[];
        file: IFile;
        name: string;
        package: string;
        isDependent: boolean;
        isChecked: boolean;
    }
    export class DependencyUI {
        private _reference: ISymbol;
        private _element: HTMLElement;

        constructor(reference: ISymbol) {
            this._reference = reference;

            this._element = document.createElement("div");
            var e = this._element;

            e.className = "entry";
            e.id = reference.fullName;
            e.setAttribute("data-checked", "0");
            e.setAttribute("data-dependent", "0");
            e.setAttribute("data-kind", reference.kind.toString());

            var chk = document.createElement("div");
            chk.className = "checkbox";
            e.appendChild(chk);

            var lab = document.createElement("div");
            lab.className = "label";
            lab.textContent = reference.name + " [" + text.Text.fileSize(reference.file.size) + "]";
            e.appendChild(lab);
        }

        public getElement(): HTMLElement {
            return this._element;
        }

        public setChecked(checked: boolean): void {
            this._element.setAttribute("data-checked", checked ? "1" : "0");
        }

        public setDependent(dependent: boolean): void {
            this._element.setAttribute("data-dependent", dependent ? "1" : "0");
        }
    }
    export class Dependency extends Plugin {

        public symbols: ISymbol[] = null;
        public files: IFile[] = null;

        private _ajax: XMLHttpRequest;
        private _list: HTMLDivElement = null;

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
            this._list = document.createElement("div");
            this._list.id = "list";
            document.body.appendChild(this._list);
            
            //get all exports
            this.symbols = data;
            this.files = dat.files;
            
            //create/collect references
            var refs: ISymbol[] = this.symbols;
            
            //resolve names to IReference objects
            for (var ref of refs) {
                ref.file = this.getFileByName(<any>ref.file);
                for (var i = 0; i < ref.imports.length; ++i)
                    ref.imports[i] = this.getByQualifiedName(<any>ref.imports[i]);
                var path = ref.fullName.split(".");
                ref.name = path[path.length - 1];
                ref.package = path.splice(0, path.length - 1).join(".");
                ref.isDependent = false;
                ref.isChecked = false;
            }
            
            //sort names
            refs.sort((a: ISymbol, b: ISymbol): number => {
                if (a.package != b.package)
                    return a.package.localeCompare(b.package);
                if (a.name != b.name)
                    return a.name.localeCompare(b.name);
                return a.fullName.localeCompare(b.fullName);
            });
            
            //multipath(2/2)
            for (var ref of refs) {
                ref.ui = this.createElement(ref);
                ref.relations = this.createRelations(ref);
            }
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
                    this.createRelations(imp, relations);
                }
            }
            return relations;
        }

        private createElement(ref: ISymbol): DependencyUI {
            var element = new DependencyUI(ref);
            this._list.appendChild(element.getElement());
            element.getElement().addEventListener("click", () => this.onClickElement(ref));
            return element;
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

            //refresh the ui-elements
            this.refreshUI();
        }

        private refreshUI(): void {
            for (var ref of this.symbols) {
                ref.ui.setChecked(ref.isChecked);
                ref.ui.setDependent(ref.isDependent);
            }
        }
    }
}