declare namespace fs {
    function writeFile(fileName:string, content:string, callback:(err) => void):void;
}
export = fs;