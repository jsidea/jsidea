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
    }
}