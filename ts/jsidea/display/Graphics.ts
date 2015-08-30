module jsidea.display {
    export class Graphics {

        private static _instance: Graphics = new Graphics();
        public static get(ctx: CanvasRenderingContext2D): Graphics {
            Graphics._instance._ctx = ctx;
            return Graphics._instance;
        }

        private _ctx: CanvasRenderingContext2D;

        public bounds(element: HTMLElement, boxModel?: layout.IBoxModel): Graphics {
            var ctx = this._ctx;
            var can: HTMLElement = ctx.canvas;
            boxModel = boxModel || layout.BoxModel.BORDER;

            var from = geom.Transform.create(element);
            var to = geom.Transform.create(can);
            var quad = from.size.bounds(boxModel).toQuad();
            quad = from.localToLocalQuad(to, quad, null, layout.BoxModel.CANVAS, quad);
            this.quad(quad);

            return this;
        }

        public strokeColor(color: string): Graphics {
            var ctx = this._ctx;
            ctx.strokeStyle = color;
            return this;
        }
        
        public lineWidth(lineWidth: number): Graphics {
            var ctx = this._ctx;
            ctx.lineWidth = lineWidth;
            return this;
        }

        public stroke(color?: string, lineWidth?: number): Graphics {
            var ctx = this._ctx;
            ctx.closePath();
            if (color !== undefined)
                this.strokeColor(color);
            if (lineWidth !== undefined)
                this.lineWidth(lineWidth);
            ctx.stroke();
            ctx.beginPath();
            return this;
        }

        public cross(x: number, y: number, size: number): Graphics {
            var ctx = this._ctx;

            ctx.moveTo(x + size, y);
            ctx.lineTo(x - size, y);
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y - size);
            return this;
        }

        public quad(quad: geom.Quad): Graphics {
            var ctx = this._ctx;

            ctx.moveTo(quad.p1.x, quad.p1.y);
            ctx.lineTo(quad.p2.x, quad.p2.y);
            ctx.lineTo(quad.p3.x, quad.p3.y);
            ctx.lineTo(quad.p4.x, quad.p4.y);
            ctx.lineTo(quad.p1.x, quad.p1.y);
            return this;
        }

        public rect(box: geom.Rect2D): Graphics {
            var ctx = this._ctx;

            ctx.moveTo(box.x, box.y);
            ctx.lineTo(box.x + box.width, box.y);
            ctx.lineTo(box.x + box.width, box.y + box.height);
            ctx.lineTo(box.x, box.y + box.height);
            ctx.lineTo(box.x, box.y);
            return this;
        }

        public clear(): Graphics {
            var ctx = this._ctx;
            ctx.closePath();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.beginPath();
            return this;
        }
    }
}