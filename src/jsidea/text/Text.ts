module jsidea.text {
    export class Text {
        public static fillHead(text: string, length: number, char: string = " "): string {
            if (text.length >= length)
                return text;
            while (text.length < length)
                text = char + text;
            return text;
        }

        public static fill(text: string, length: number, char: string = " "): string {
            if (text.length >= length)
                return text;
            while (text.length < length)
                text += char;
            return text;
        }

        public static conc(length: number, char: string = " ", ...args: any[]): string {

            return this.fill(args.join(" "), length, char);
        }

        public static color(hexColor: number): string {
            console.log(Math.round(hexColor).toString(16));
            return "#" + this.fill(Math.round(hexColor).toString(16), 6, "0");
        }

        public static fileSize(bytes: number, roundMB: Boolean = false): String {
            var mb: number = math.Number.precision(bytes * math.Number.BYTE_TO_MB, 100);
            if (mb > 1000)
                return math.Number.precision(bytes * math.Number.BYTE_TO_GIGABYTE, 100) + " GB";
            else if (mb < 1)
                return Math.round(bytes * math.Number.BYTE_TO_KILOBYTE) + " kB";
            if (roundMB)
                return Math.round(mb) + " MB";
            return mb + " MB";
        }
    }
}