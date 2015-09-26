declare namespace fs {
    function writeFile(fileName: string, content: string, callback: (err) => void): void;
    function statSync(fileName: string): any;
}
export = fs;