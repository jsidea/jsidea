namespace jsidea.text {
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

        //SOURCE: http://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
        public static byteLengthUTF8(str: string): number {
            // returns the byte length of an utf8 string
            var s = str.length;
            for (var i = str.length - 1; i >= 0; i--) {
                var code = str.charCodeAt(i);
                if (code > 0x7f && code <= 0x7ff)
                    s++;
                else if (code > 0x7ff && code <= 0xffff)
                    s += 2;
                if (code >= 0xDC00 && code <= 0xDFFF)
                    i--; //trail surrogate
            }
            return s;
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