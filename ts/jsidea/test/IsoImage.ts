module jsidea.test {
    export class IsoImage extends jsidea.events.EventDispatcher {

        private _loadCount: number = 0;

        private _depths: IsoBitmapData[] = [];
        private _colors: IsoBitmapData[] = [];
        private _active: IsoBitmapData;

        private _loader: BulkImageLoader;

        constructor() {
            super();

            this._loader = new BulkImageLoader("http://127.0.0.1/eventfive/jsidea/assets/");
            this._loader.bind("loaded", (e) => this.handleLoaded(e));
            for (var i = 0; i < 8; ++i) {
                this._loader.add("noname-color-" + i + ".png", "_colors" + i);
                this._loader.add("noname-depth-" + i + ".png", "_depths" + i);
            }
            this._loader.run();
        }

        private handleLoaded(e: jsidea.events.IEvent): void {
            console.log("RESSOURCES AVAILABLE");

            var types = ["_colors", "_depths"];
            var types = ["_colors"];
            for (var i = 0; i < 8; ++i) {
                for (var j = 0; j < types.length; ++j) {
                    var img = this._loader.get(types[j] + i);
                    if(!img)
                        continue;
                    var bit = new IsoBitmapData(img.width, img.height);
                    bit.draw(img);
                    bit.validate();
                    bit.crop(bit.bounds());
                    this[types[j]] = bit;
                    
                    document.body.appendChild(bit.canvas);
                }
            }
            
            console.log("RESSOURCES CREATED");
        }
        //
        //        private handleLoadedBitmapData(e: jsidea.events.IEvent): void {
        //            this._color.crop(this._color.bounds());
        //            this._loadCount++;
        //            if (this._loadCount == 2)
        //                this.finalize();
        //        }

        private finalize(): void {
            console.log("FINALIZE");
            //            this._dep            
            //            this._active = new IsoBitmapData(this._color.canvas.width, this._color.canvas.height);
            //            this._active.drawBitmapData(this._color);
            //            this._active.validate();
            //            document.body.appendChild(this._active.canvas);
        }
    }
}