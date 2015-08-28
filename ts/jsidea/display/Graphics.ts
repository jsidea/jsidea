module jsidea.display {
    export class Graphics {

        private static _instance: Graphics = new Graphics();
        public static get(ctx: CanvasRenderingContext2D): Graphics {
            Graphics._instance._context = ctx;
            return Graphics._instance;
        }

        private _context: CanvasRenderingContext2D;

        public bounds(e: HTMLElement, boxModel?: layout.IBoxModel): void {
            var ctx = this._context;
            var can: HTMLElement = ctx.canvas;
            boxModel = boxModel || layout.BoxModel.BORDER;

            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);
            
            var from = geom.Transform.create(e);
            
            if(boxModel != layout.BoxModel.BORDER)
            {
                var box = from.boxSizing.bounds(boxModel);
                a.x = box.x;
                a.y = box.y;
                b.x = box.right;
                b.y = box.y;
                c.x = box.right;
                c.y = box.bottom;
                d.x = box.x;
                d.y = box.bottom;
            }

            from.fromBox = layout.BoxModel.BORDER;

            var to = geom.Transform.create(can);
            to.toBox = layout.BoxModel.CANVAS;

            a = from.localToLocal(to, a.x, a.y);
            b = from.localToLocal(to, b.x, b.y);
            c = from.localToLocal(to, c.x, c.y);
            d = from.localToLocal(to, d.x, d.y);

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();
        }

        public cross(x: number, y: number, size: number): void {
            var ctx = this._context;

            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x - size, y);
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y - size);
            ctx.closePath();
        }

        public quad(quad: geom.Quad): void {
            var ctx = this._context;

            ctx.beginPath();
            ctx.moveTo(quad.p1.x, quad.p1.y);
            ctx.lineTo(quad.p2.x, quad.p2.y);
            ctx.lineTo(quad.p3.x, quad.p3.y);
            ctx.lineTo(quad.p4.x, quad.p4.y);
            ctx.lineTo(quad.p1.x, quad.p1.y);
            ctx.closePath();
        }

        public box(box: geom.Rect2D): void {
            var ctx = this._context;

            ctx.beginPath();
            ctx.moveTo(box.x, box.y);
            ctx.lineTo(box.x + box.width, box.y);
            ctx.lineTo(box.x + box.width, box.y + box.height);
            ctx.lineTo(box.x, box.y + box.height);
            ctx.lineTo(box.x, box.y);
            ctx.closePath();
        }

        public clear(): void {
            var ctx = this._context;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}