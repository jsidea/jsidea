module jsidea.text {
    export class Text {

        public static fill(text: string, length: number, char: string = " "): string {
            if (text.length >= length)
                return text;
            while (text.length < length)
                text += char;
            return text;
        }
        
        public static conc(length: number, char: string = " ", ...args): string {
            
            return this.fill(args.join(" "), length, char);
        }

    }
}