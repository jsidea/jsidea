module jsidea.test {
    export class BulkImageLoader extends jsidea.events.EventDispatcher {

        private _images: HTMLImageElement[] = [];
        private _keys: { [key: string]: HTMLImageElement } = {};
        private _running: boolean = false;
        private _path: string;

        private _lastCount: number = 0;

        constructor(path: string = "") {
            super();

            this._path = path;
        }

        public get images(): HTMLImageElement[] {
            return this._images;
        }

        public get(key: string): HTMLImageElement {
            return this._keys[key];
        }

        public getImage(src: string): HTMLImageElement {
            for (var i = 0; i < this._images.length; ++i)
                if (this._images[i].src == src)
                    return this._images[i];
            return null;
        }

        public add(src: string, key: string): HTMLImageElement {
            var image: HTMLImageElement = this.getImage(src);
            if (image) {
                this._keys[key] = image;
                return image;
            }

            image = document.createElement("img");
            image.addEventListener(jsidea.events.Events.IMAGE_LOAD, (e) => this.handleImageLoaded(image));
            image["sourceToLoad"] = this._path + src;
            if (this._running)
                image.src = image["sourceToLoad"];
            this._images.push(image);
            this._keys[key] = image;
            return image;
        }

        public run(): void {
            if (this._running)
                return;
            this._running = true;
            for (var i = 0; i < this._images.length; ++i) {
                var img = this._images[i];
                if (!img.src)
                    img.src = img["sourceToLoad"];
            }
        }

        public stop(): void {
            if (!this._running)
                return;
            this._running = false;
            for (var i = 0; i < this._images.length; ++i) {
                var img = this._images[i];
                if (!img.complete && img.src)
                    img.src = "";
            }
        }

        private handleImageLoaded(image: HTMLImageElement): void {
            this.checkState();
        }

        private checkState(): void {
            var completeCount = 0;
            var overallCount = this._images.length;
            for (var i = 0; i < overallCount; ++i)
                if (this._images[i].src && this._images[i].complete)
                    completeCount++;
            var loadingCount = overallCount - completeCount;
            if (overallCount > 0 && overallCount == completeCount) {
                if (completeCount != this._lastCount)
                    this.trigger("loaded");
                this._lastCount = completeCount;
            }
        }
    }
}