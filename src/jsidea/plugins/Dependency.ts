module jsidea.plugins {
    interface IReferenceData {
        qualifiedName: string,
        file: string,
        fileSize: number,
        kind: number;
        imports: string[] | IReference[];
    }
    export interface IReference extends IReferenceData {
        element: HTMLDivElement;
        relations: IReference[];
        imports: IReference[];
        name: string;
        package: string;
        isDependent: boolean;
        isChecked: boolean;
    }
    export class Dependency extends Plugin {

        public references: IReference[] = null;

        private _ajax: XMLHttpRequest;
        private _list: HTMLDivElement = null;

        constructor() {
            super();

            this._ajax = new XMLHttpRequest();
            this._ajax.onreadystatechange = (e) => this.onReadyStateChange(e);
            this._ajax.open("GET", "http://127.0.0.1/eventfive/jsidea/build/dependency.json");
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

        private parse(data: IReference[]): void {
            this._list = document.createElement("div");
            this._list.id = "list";
            document.body.appendChild(this._list);
            
            //get all exports
            this.references = data;
            
            //create/collect references
            var refs: IReference[] = this.references;
            
            //resolve names to IReference objects
            var l = refs.length;
            for (var ref of refs) {
                for (var i = 0; i < ref.imports.length; ++i)
                    ref.imports[i] = this.getByQualifiedName(<any>ref.imports[i]);
                var path = ref.qualifiedName.split(".");
                ref.name = path[path.length - 1];
                ref.package = path.splice(0, path.length - 1).join(".");
                ref.isDependent = false;
                ref.isChecked = false;
            }
            
            //sort names
            refs.sort((a: IReference, b: IReference): number => {
                if (a.package != b.package)
                    return a.package.localeCompare(b.package);
                if (a.name != b.name)
                    return a.name.localeCompare(b.name);
                return a.qualifiedName.localeCompare(b.qualifiedName);
            });
            
            //multipath(2/2)
            for (var ref of refs) {
                ref.element = this.createElement(ref);
                ref.relations = this.createRelations(ref);
            }
        }

        private getByQualifiedName(name: string): IReference {
            var refs = this.references;
            var l = refs.length;
            for (var i = 0; i < l; ++i)
                if (refs[i].qualifiedName == name)
                    return refs[i];
            return null;
        }

        private createRelations(ref: IReference, relations?: IReference[]): IReference[] {
            relations = relations || [];
            var l = ref.imports.length;
            for (var i = 0; i < l; ++i) {
                if (relations.indexOf(ref.imports[i]) < 0) {
                    relations.push(ref.imports[i]);
                    this.createRelations(ref.imports[i], relations);
                }
            }
            return relations;
        }

        private createElement(ref: IReference): HTMLDivElement {
            var element = document.createElement("div");
            element.className = "entry";
            element.id = ref.qualifiedName;
            element.setAttribute("data-checked", "0");
            element.setAttribute("data-dependent", "0");
            element.setAttribute("data-kind", ref.kind.toString());
            this._list.appendChild(element);

            var chk = document.createElement("div");
            chk.className = "checkbox";
            element.appendChild(chk);

            var lab = document.createElement("div");
            lab.className = "label";
            lab.textContent = ref.name + " [" + text.Text.fileSize(ref.fileSize) + "]";
            element.appendChild(lab);

            element.addEventListener("click", () => this.onClickElement(ref));

            return element;
        }

        private onClickElement(ref: IReference): void {
            ref.isChecked = !ref.isChecked;
            this.refreshDependency();
        }

        private refreshDependency(): void {
            var refs = this.references;
            var l = refs.length;
            
            //collect checked
            //and reset dependent
            var checked: IReference[] = [];
            for (var i = 0; i < l; ++i) {
                refs[i].isDependent = false;
                if (refs[i].isChecked)
                    checked.push(refs[i]);
            }
            
            //mark dependencies
            l = checked.length;
            for (var i = 0; i < l; ++i) {
                var ref = checked[i];
                var m = ref.relations.length;
                for (var j = 0; j < m; ++j) {
                    ref.relations[j].isDependent = true;
                }
            }

            //refresh the ui-elements
            this.refreshUI();
        }

        private refreshUI(): void {
            var refs = this.references;
            var l = refs.length;
            for (var i = 0; i < l; ++i) {
                var ref = refs[i];
                ref.element.setAttribute("data-checked", ref.isChecked ? "1" : "0");
                ref.element.setAttribute("data-dependent", ref.isDependent ? "1" : "0");
            }
        }
    }
}