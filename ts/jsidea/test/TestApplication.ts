module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        constructor() {
            super();
        }

        //@override abstract
        public create(): void {
            this.testGeometryUtils();
        }

        private testGeometryUtils(): void {
            var con = document.getElementById("content");
            var vie = document.getElementById("view");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 256;
            can.height = 512;
            var ctx = can.getContext("2d");

            a.appendChild(b);
            b.appendChild(bc);
            con.appendChild(a);
            document.body.appendChild(can);

            var pos = new layout.Position();
            pos.my.x = "-100%";
            pos.my.y = "-50%";
            pos.at.x = 0;
            pos.at.y = 0;
            pos.of = document.body;
            pos.useTransform = false;
            pos.boxModel = "padding";
            
            document.addEventListener("enterframe", (evt) => {
                ctx.clearRect(0, 0, can.width, can.height);
                this.drawBoundingBox(ctx, con);
                this.drawBoundingBox(ctx, a);
                this.drawBoundingBox(ctx, b);
                this.drawBoundingBox(ctx, bc);
                this.drawBoundingBox(ctx, vie);
                this.drawBoundingBox(ctx, can);
            });           

            document.addEventListener("mousemove", (evt) => {
                var pt: any = new geom.Point3D(evt.pageX, evt.pageY);
                pos.at.x = pt.x;
                pos.at.y = pt.y;
                pos.apply(bc);
            });
        }

        private drawBoundingBox(ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            
            var can: HTMLElement = ctx.canvas;
            
            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);

            var tim = (new Date()).getTime();

            var locToGlo = geom.Transform.extract(e);
            a = locToGlo.localToGlobal(a.x, a.y);
            b = locToGlo.localToGlobal(b.x, b.y);
            c = locToGlo.localToGlobal(c.x, c.y);
            d = locToGlo.localToGlobal(d.x, d.y);

            var gloToLoc = geom.Transform.extract(can);
            a = gloToLoc.globalToLocal(a.x, a.y, 0, "canvas");
            b = gloToLoc.globalToLocal(b.x, b.y, 0, "canvas");
            c = gloToLoc.globalToLocal(c.x, c.y, 0, "canvas");
            d = gloToLoc.globalToLocal(d.x, d.y, 0, "canvas");

            //console.log("TIME TO CALC 4 POINTS", (new Date()).getTime() - tim);

            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();
        }

        private getOffestToCrossDoc(f: HTMLElement, aOther: HTMLElement | Window): geom.Point2D {
            var top: number = 0;
            var left: number = 0;
            while (f && f != aOther) {
                left += f.offsetLeft;
                top += f.offsetTop;
                var par = f.parentElement;
                if (par) {
                    f = par;
                }
                else {

                }
            }
            return new geom.Point2D(left, top);
        }

        private testObserver(): void {
            var d = $("<div>A</div>");
            $("body").append(d);
            var o = d[0];
            Object.observe(o, function(a): void {
                console.log(a);
            });
            o.style.width = "200px";
            o.style.height = "200px";
            o.style.backgroundColor = "#FF00FF";
            //ARRGHHH funzt nit
        }

        private testXMLConverter(): void {
            var x = new jsidea.model.conversion.XMLConverter();
        }

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            d.bind("click.setup",(e: jsidea.events.IEvent) => console.log(e.eventType));
            d.trigger(".setup");
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}

interface JQuery {
    globalToLocal(x: number, y: number, z?: number): jsidea.geom.IPoint3DValue;
    localToGlobal(x: number, y: number, z?: number): jsidea.geom.IPoint3DValue;
}

(function($) {
    $.fn.globalToLocal = function(x: number, y: number, z: number = 0) {
        return jsidea.geom.Transform.extract(this[0]).globalToLocal(x, y, z);
    };
    $.fn.localToGlobal = function(x: number, y: number, z: number = 0) {
        return jsidea.geom.Transform.extract(this[0]).localToGlobal(x, y, z);
    };
} (jQuery));