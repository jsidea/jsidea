module jsidea.events {
    export class Graphics {

        constructor(public context: CanvasRenderingContext2D) {

        }

        public quad(quad: geom.Quad): Graphics {
            var ctx = this.context;

            ctx.beginPath();
            ctx.moveTo(quad.a.x, quad.a.y);
            ctx.lineTo(quad.b.x, quad.b.y);
            ctx.lineTo(quad.c.x, quad.c.y);
            ctx.lineTo(quad.d.x, quad.d.y);
            ctx.lineTo(quad.a.x, quad.a.y);
            ctx.closePath();
            
            return this;
        }

        public box(box: geom.Box2D): Graphics {
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