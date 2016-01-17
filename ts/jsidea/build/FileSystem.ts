namespace jsidea.build {
    export class FileSystem implements IFileSystem {
        public files: IFile[] = null;

        constructor(files?: IFile[]) {
            this.files = files || [];
        }

        public match(glob: string): IFile[] {
            var res: IFile[] = [];
            var r = FileSystem.globToRegex(glob);
            for (var file of this.files)
                if (r.test(file.name))
                    res.push(file);
            return res;
        }

        public find(fileName: string): IFile {
            for (var f of this.files)
                if (f.name == fileName)
                    return f;
            return null;
        }
        public exists(fileName: string): boolean {
            return Boolean(this.find(fileName));
        }

        public read(fileName: string): string {
            var f = this.find(fileName);
            return f ? f.code : "";
        }

        public move(fileName: string, target: string): void {
            var f = this.find(fileName);
            if (!f)
                return;
            var t = this.find(target);
            if (!t) {
                f.name = target;
                return;
            }

            var tidx = this.files.indexOf(t);
            this.files.splice(tidx, 1);
            f.name = target;
        }

        public write(fileName: string, data: string): void {
            var f = this.find(fileName);
            if (f)
                f.code = data;
            else
                this.files.push({
                    name: fileName,
                    code: data
                });
        }

        private static globToRegex(glob: string): RegExp {
            //            var specialChars = "\\^$*+?.()|{}[]";
            //            var regexChars = ["^"];
            //            for (var i = 0; i < glob.length; ++i) {
            //                var c = glob.charAt(i);
            //                switch (c) {
            //                    case '?':
            //                        regexChars.push(".");
            //                        break;
            //                    case '*':
            //                        regexChars.push(".*");
            //                        break;
            //                    default:
            //                        if (specialChars.indexOf(c) >= 0)
            //                            regexChars.push("\\");
            //                        regexChars.push(c);
            //                }
            //            }
            //            regexChars.push("$");
            //            return new RegExp(regexChars.join(""));
            
            var globs = glob.indexOf("|") >= 0 ? glob.split("|") : [glob];

            var specialChars = "\\^$*+?.(){}[]";
            var regexChars = ["^"];
            for (var glob of globs) {
                if (regexChars.length > 1)
                    regexChars.push("|");
                regexChars.push("(");
                for (var i = 0; i < glob.length; ++i) {
                    var c = glob.charAt(i);
                    switch (c) {
                        case '?':
                            regexChars.push(".");
                            break;
                        case '*':
                            regexChars.push(".*");
                            break;
                        default:
                            if (specialChars.indexOf(c) >= 0)
                                regexChars.push("\\");
                            regexChars.push(c);
                    }
                }
                regexChars.push(")");
            }
            regexChars.push("$");
//            console.log("REG", regexChars.join(""));
            return new RegExp(regexChars.join(""));
        }
    }
}