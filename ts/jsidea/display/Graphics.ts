module jsidea.events {
    export class Graphics {

        constructor(public context: CanvasRenderingContext2D) {

        }

        public cross(x: number, y: number, size: number): Graphics {
            var ctx = this.context;

            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x - size, y);
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y - size);
            ctx.closePath();

            return this;
        }

        public quad(quad: geom.Quad): Graphics {
            var ctx = this.context;

            ctx.beginPath();
            ctx.moveTo(quad.p1.x, quad.p1.y);
            ctx.lineTo(quad.p2.x, quad.p2.y);
            ctx.lineTo(quad.p3.x, quad.p3.y);
            ctx.lineTo(quad.p4.x, quad.p4.y);
            ctx.lineTo(quad.p1.x, quad.p1.y);
            ctx.closePath();

            return this;
        }

        public box(box: geom.Rect2D): Graphics {
            var ctx = this.context;

            ctx.beginPath();
            ctx.moveTo(box.x, box.y);
            ctx.lineTo(box.x + box.width, box.y);
            ctx.lineTo(box.x + box.width, box.y + box.height);
            ctx.lineTo(box.x, box.y + box.height);
            ctx.lineTo(box.x, box.y);
            ctx.closePath();

            return this;
        }

        public clear(): Graphics {
            var ctx = this.context;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            return this;
        }
    }
}