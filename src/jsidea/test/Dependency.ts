module jsidea.test {
    export class Dependency extends jsidea.system.Application {

        private _ajax: XMLHttpRequest;
        private _data: any = null;
        private _dependencies: any = null;
        private _checks: HTMLDivElement[] = [];
        private _list: HTMLDivElement = null;
        private _names: string[] = [];

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
                    this._data = JSON.parse(this._ajax.responseText);
                    this.parse();
                }
                else {
                    console.log(this._ajax.statusText);
                }
            }
        }

        private parse(): void {
            this._list = document.createElement("div");
            this._list.id = "list";
            document.body.appendChild(this._list);

            //add dependencies
            this._dependencies = {};
            var cls;
            for (cls in this._data) {
                this._names.push(cls);
                console.log(cls);
                this._dependencies[cls] = this.getDependencies(cls);
            }
            
            //sort names
            this._names.sort((a: string, b: string): number => {
                var pkgA = a.substr(0, a.lastIndexOf("."));
                var clsA = a.substring(a.lastIndexOf(".") + 1);
                var pkgB = b.substr(0, b.lastIndexOf("."));
                var clsB = b.substring(b.lastIndexOf(".") + 1);
                if (pkgA != pkgB)
                    return pkgA.localeCompare(pkgB);
                if (clsA != clsB)
                    return clsA.localeCompare(clsB);
                return a.localeCompare(b);
            });
            var l = this._names.length;
            for (var i = 0; i < l; ++i) {
                cls = this._names[i];
                this.addCheckbox(cls);
            }
        }

        private addCheckbox(cls: string): void {
            var id = cls;//cls.replace(/\./g, "-");
            
            var ent = document.createElement("div");
            ent.className = "entry";
            ent.id = id;
            ent.setAttribute("data-checked", "0");
            ent.setAttribute("data-dependent", "0");
            this._list.appendChild(ent);
            this._checks.push(ent);

            var chk = document.createElement("div");
            chk.className = "checkbox";
            ent.appendChild(chk);

            var lab = document.createElement("div");
            lab.className = "label";
            lab.textContent = cls.replace("jsidea.", "");
            ent.appendChild(lab);

            ent.addEventListener("click", () => this.onChangeCheckbox(ent));
        }

        private onChangeCheckbox(chk: HTMLDivElement): void {
            var att = chk.getAttribute("data-checked");
            var checked = att == "1";
            //toggle
            chk.setAttribute("data-checked", checked ? "0" : "1");
            this.refreshDependencies();
        }

        private resetDependent(): void {
            var refs = this._checks;
            var l = refs.length;
            for (var i = 0; i < l; ++i) {
                var div = refs[i];
                div.setAttribute("data-dependent", "0");
            }
        }

        private refreshDependencies(): void {
            this.resetDependent();
            var refs = this._checks;
            var l = refs.length;
            var checked = [];
            var div: HTMLDivElement;
            for (var i = 0; i < l; ++i) {
                div = refs[i];
                if (div.getAttribute("data-checked") == "1")
                    checked.push(div);
            }
            l = checked.length;
            for (var i = 0; i < l; ++i) {
                div = checked[i];
                var deps: string[] = this._dependencies[div.id];
                var m = deps.length;
                for (var j = 0; j < m; ++j) {
                    var depEl = document.getElementById(deps[j]);
                    depEl.setAttribute("data-dependent", "1");
                }
            }
        }

        private getDependencies(qualifiedClassName: string): string[] {
            var res = [];
            this.addTo(qualifiedClassName, res);
            return res;
        }

        private addTo(qualifiedClassName: string, target: string[]): void {
            var names: string[] = this._data[qualifiedClassName];
            if (!names) {
                console.log("MISSING", qualifiedClassName);
                return;
            }
            var l = names.length;
            for (var i = 0; i < l; ++i) {
                var na = names[i];
                if (target.indexOf(na) < 0) {
                    target.push(na);
                    this.addTo(na, target);
                }
            }
        }
    }
}