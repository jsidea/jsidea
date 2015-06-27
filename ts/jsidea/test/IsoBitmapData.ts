module jsidea.test {
    export interface IRect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export class IsoBitmapData extends jsidea.events.EventDispatcher {

        private _pixels: Uint32Array;
        private _imageData: ImageData;

        private _width: number;
        private _height: number;
        private _canvas: HTMLCanvasElement;
        private _ctx: CanvasRenderingContext2D;
        private _isDirtyCanvas: boolean = true;
        private _isDirtyPixels: boolean = false;

        constructor(width: number, height: number, color: number = 0x00000000) {
            super();
            this._width = width;
            this._height = height;

            //prepare canvas and context 2d
            this._canvas = document.createElement("canvas");
            this._canvas.width = this._width;
            this._canvas.height = this._height;
            this._ctx = this._canvas.getContext("2d");

            //apply intial color
            if (color) {
                this._ctx.fillStyle = this.hexToArgb(color);
                this._ctx.fillRect(0, 0, this._width, this._height);
            }

            //initial validation get the _pixels property
            this.validate();
        }

        public resize(width: number, height: number, keepContent: boolean = false): void {
            if (this._width == width && this._height == height)
                return;
            this._width = width;
            this._height = height;

            this._canvas.width = this._width;
            this._canvas.height = this._height;
            this._ctx = this._canvas.getContext("2d");

            this.validate();
        }

        public hexToArgb(color: number): string {
            var a: number = color >> 24 & 0xFF;
            var r: number = color >> 16 & 0xFF;
            var g: number = color >> 8 & 0xFF;
            var b: number = color & 0xFF;
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }

        public drawBitmapData(data: IsoBitmapData, x: number = 0, y: number = 0): void {
            this.draw(data._canvas, x, y);
        }

        public draw(image: HTMLElement, x: number = 0, y: number = 0): void {
            this._ctx.drawImage(image, x, y);
            this._isDirtyCanvas = true;
        }

        private test(): void {
            for (var i = 0; i < this._pixels.length; ++i) {
                if (this._pixels[i])
                    this._pixels[i] *= 24;
            }
            this._isDirtyPixels = true;
            this.validate();
        }

        public get canvas(): HTMLCanvasElement {
            return this._canvas;
        }

        public get pixels(): Uint32Array {
            return this._pixels;
        }

        public set pixels(p: Uint32Array) {
            this._isDirtyPixels = true;
            if (p != this._pixels) {
                if (p.length != this._pixels.length)
                    console.warn("The given pixels array has the wrong length: " + p.length + ". Expected: " + this._pixels.length);
                else
                    for (var i = 0; i < p.length; ++i)
                        this._pixels[i] = p[i];
            }
        }

        public getPixel(x: number, y: number): number {
            return 0x00FFFFFF & this.getPixel32(x, y);
        }

        public setPixel(x: number, y: number, color: number): void {
            var alpha = this.getPixel32(x, y) & 0xFF000000;
            this.setPixel32(x, y, alpha & color);
        }

        public getPixel32(x: number, y: number): number {
            return this.pixels[y * this._width + x];
        }

        public setPixel32(x: number, y: number, color: number): void {
            var idx = x + y * this._width;
            if (this._pixels[idx] == color)
                return;
            this._pixels[idx] = color;
            this._isDirtyPixels = true;
        }

        public validate(): void {
            //if the pixels typed array changed 
            //than reflect to the canvas
            if (this._isDirtyPixels) {
                if (this._imageData)
                    this._ctx.putImageData(this._imageData, 0, 0);
                this._isDirtyPixels = false;
            }
            //if the canvas changed 
            //than reflect to the pixels typed array
            if (this._isDirtyCanvas) {
                this._imageData = this._ctx.getImageData(0, 0, this._width, this._height);
                var d: any = this._imageData.data;
                this._pixels = new Uint32Array(d.buffer);
                this._isDirtyCanvas = false;
            }
        }

        public crop(r: IRect): void {
            var da = this._imageData;
            this.resize(r.width, r.height, false);
            this._ctx.putImageData(da, -r.x, -r.y);
            this._isDirtyCanvas = true;
            this.validate();
        }

        public extract(r: IRect): IsoBitmapData {
            var bit = new IsoBitmapData(r.width, r.height);
            bit.draw(this._canvas, -r.x, -r.y);
            bit.validate();
            return bit;
        }

        public get rect(): IRect {
            return { x: 0, y: 0, width: this._width, height: this._height };
        }

        public bounds(): IRect {
            var minX: number = Number.MAX_VALUE;
            var maxX: number = -Number.MAX_VALUE;
            var minY: number = Number.MAX_VALUE;
            var maxY: number = -Number.MAX_VALUE;
            var w: number = this._width;
            var h: number = this._height;
            var pixels = this.pixels;
            for (var i = 0; i < pixels.length; ++i) {
                if (pixels[i]) {
                    var x = i % w;
                    var y = Math.floor(i / w);
                    if (x < minX)
                        minX = x;
                    if (x > maxX)
                        maxX = x;
                    if (y < minY)
                        minY = y;
                    if (y > maxY)
                        maxY = y;
                }
            }
            if (minX > w - 1)
                minX = w - 1;
            if (maxX < 0)
                maxX = 0;
            if (minY > h - 1)
                minY = h - 1;
            if (maxY < 0)
                maxY = 0;
            return { x: minX, y: minY, width: (maxX - minX) + 1, height: (maxY - minY) + 1 };
        }
    }
}