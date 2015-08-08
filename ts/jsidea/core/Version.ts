module jsidea.core {
    export interface IVersion extends jsidea.core.ICore {
        state: string;
        major: number;
        build: number;
        revision: number;
        compare(v: IVersion): number;
    }
    export class Version implements IVersion {
        constructor() {
        }

        public compare(v: IVersion): number {
            if (v.major > this.major)
                return -1;
            else if (v.major < this.major)
                return 1;
            else if (v.build > this.build)
                return -1;
            else if (v.build < this.build)
                return 1;
            else if (v.revision > this.revision)
                return -1;
            else if (v.revision < this.revision)
                return 1;
            return 0;
        }

        public get versionString(): string {
            return this.state + " " + this.major + "." + this.build + "." + this.revision;
        }

        public get state(): string {
            return "alpha";
        }

        public get major(): number {
            return 0;
        }

        public get build(): number {
            return 0;
        }

        public get revision(): number {
            return 1;
        }

        public dispose(): void {
        }

        public static qualifiedClassName: string = "jsidea.core.Version";
        public toString(): string {
            return "[" + Version.qualifiedClassName +
                " version='" + this.versionString + "']";
        }
    }
}
