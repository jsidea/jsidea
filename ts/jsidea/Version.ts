module jsidea {
    export class Version {

        public state: string = "alpha";
        public major: number = 0;
        public build: number = 0;
        public revision: number = 1;

        constructor() {
        }

        public compare(v: Version): number {
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

        public toString(): string {
            return this.state + " " + this.major + "." + this.build + "." + this.revision;
        }
    }
}