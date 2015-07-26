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

            var max = 6;
            var te = max;
            document.body.className = "test-" + te;
            
            var draw = () => {
                ctx.clearRect(0, 0, can.width, can.height);

                this.drawBoundingBox(ctx, con);
                this.drawBoundingBox(ctx, a);
                this.drawBoundingBox(ctx, b);
                this.drawBoundingBox(ctx, c);
                this.drawBoundingBox(ctx, d);
                this.drawBoundingBox(ctx, vie);
                this.drawBoundingBox(ctx, can);

                //                this.drawOffsetChain(ctx, d);
            };

            document.onkeyup = (e) => {
                //console.log("KEY UP");
                if (e.keyCode == 37 || e.keyCode == 39) {
                    if (e.keyCode == 37)
                        te--;
                    else
                        te++;
                    if (te > max)
                        te = 0;
                    else if (te < 0)
                        te = max;
                    document.body.className = "test-" + te;
                    console.log("TEST-" + te);
                    draw();
                }
            };

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 800;
            can.height = 800;
            var ctx = can.getContext("2d");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var c = document.createElement("div");
            c.id = "c-cont";
            var d = document.createElement("div");
            d.id = "d-cont";

            a.appendChild(b);
            b.appendChild(c);
            c.appendChild(d);
            con.appendChild(a);
            document.body.appendChild(can);

            var pos = new layout.Position();
            pos.to.x = "100%";
            pos.to.y = "100%";
            pos.toBox = layout.BoxModel.BORDER;
            pos.useTransform = true;

            document.addEventListener("click",(evt) => {
                this.logChain(d);
            });

            document.addEventListener("click", draw);

            document.addEventListener("mousemove",(evt) => {
                var pt: any = new geom.Point3D(evt.pageX, evt.pageY);
                //from window to body
                //                console.log(pt.x, pt.y);
                
                //                pt = geom.Transform.create(document.body).globalToLocalPoint(pt);
                //                pos.from.x = pt.x;
                //                pos.from.y = pt.y;
                //                pos.apply(d);
            });
        }

        private drawOffsetChain(ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            while (e && e.parentElement != document.body.parentElement) {
                var sc = layout.StyleChain.create(e).node;
                this.drawCross(ctx, sc.offset.x, sc.offset.y);
                e = e.parentElement;
            }
        }

        private drawBoundingBox(ctx: CanvasRenderingContext2D, e: HTMLElement): void {

            var can: HTMLElement = ctx.canvas;

            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);

            var tim = (new Date()).getTime();

            //            var locToGlo = geom.Transform.create(e);
            //            locToGlo.fromBox = layout.BoxModel.BORDER;
            //            locToGlo.toBox = layout.BoxModel.CANVAS;
            //            a = locToGlo.localToLocal(can, a.x, a.y);
            //            b = locToGlo.localToLocal(can, b.x, b.y);
            //            c = locToGlo.localToLocal(can, c.x, c.y);
            //            d = locToGlo.localToLocal(can, d.x, d.y);
            
            var from = geom.Transform.create(e);
            from.fromBox = layout.BoxModel.BORDER;

            var to = geom.Transform.create(can);
            to.toBox = layout.BoxModel.CANVAS;

            a = from.localToLocal(to, a.x, a.y);
            b = from.localToLocal(to, b.x, b.y);
            c = from.localToLocal(to, c.x, c.y);
            d = from.localToLocal(to, d.x, d.y);           
            

            //            var locToGlo = geom.Transform.create(e);
            //            a = locToGlo.project(a.x, a.y);
            //            b = locToGlo.project(b.x, b.y);
            //            c = locToGlo.project(c.x, c.y);
            //            d = locToGlo.project(d.x, d.y);
            //
            //            var gloToLoc = geom.Transform.create(can);
            //            gloToLoc.toBox = "canvas";
            //            a = gloToLoc.unproject(a.x, a.y);
            //            b = gloToLoc.unproject(b.x, b.y);
            //            c = gloToLoc.unproject(c.x, c.y);
            //            d = gloToLoc.unproject(d.x, d.y);
            
            
            
            
            //            a = gloToLoc.unproject(a.x, a.y);
            //            b = gloToLoc.unproject(b.x, b.y);
            //            c = gloToLoc.unproject(c.x, c.y);
            //            d = gloToLoc.unproject(d.x, d.y);

            //            console.log("TIME TO CALC 4 POINTS",(new Date()).getTime() - tim);

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

        private drawCross(ctx, x: number, y: number): void {
            ctx.beginPath();
            ctx.lineWidth = 2;
            var size = 20;
            ctx.moveTo(x + size, y);
            ctx.lineTo(x - size, y);
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y - size);
            ctx.stroke();
        }

        private logChain(f: HTMLElement): void {
            var node = layout.StyleChain.create(f).node;
            if (node)
                node = node.root;
            while (node) {
                var ofp = <HTMLElement> node.element.offsetParent;
                var calcedOff = node.offsetParent ? node.offsetParent.element : null;
                //                var calced = geom.Transform.getParentBlock(node);
                //                var calcedPar = calced ? calced.element : null;
                var scaleOff = node.parentScroll ? node.parentScroll.element : null;
                var res = ([
                    text.Text.conc(10, " ", node.element.id ? node.element.id : node.element.nodeName),
                    text.Text.conc(18, " ", "PARENT", ofp ? (ofp.id ? ofp.id : ofp.nodeName) : "NONE"),
                    text.Text.conc(18, " ", "PARENT_C", calcedOff ? (calcedOff.id ? calcedOff.id : calcedOff.nodeName) : "NONE"),
                    //                    text.Text.conc(18, " ", "SCROLL_C", scaleOff ? (scaleOff.id ? scaleOff.id : scaleOff.nodeName) : "NONE"),
                    //                    text.Text.conc(18, " ", "PARENT_B", calcedPar ? (calcedPar.id ? calcedPar.id : calcedPar.nodeName) : "NONE"),
                    text.Text.conc(18, " ", "OFFSET", node.offsetLeft, node.offsetTop),
                    text.Text.conc(18, " ", "OFFSET_C", node.offset.x, node.offset.y),
                    text.Text.conc(18, " ", "DISPLAY", node.style.display),
                    text.Text.conc(18, " ", "TRANSFORMED", node.isTransformed),
                    text.Text.conc(18, " ", "PRESERVED", node.isPreserved3dFixed, node.style.transformStyle),
                    //                    text.Text.conc(18, " ", "MARGIN", node.style.marginLeft, node.style.marginTop),
                    text.Text.conc(18, " ", "BORDER", node.style.borderLeftWidth, node.style.borderTopWidth),
                    //                    text.Text.conc(18, " ", "PADDING", node.style.paddingLeft, node.style.paddingTop),
                    text.Text.conc(18, " ", "OVERFLOW", node.style.overflow),
                    text.Text.conc(18, " ", "POSITION", node.style.position, node.isFixedWrong)
                ]).join(" ");
                console.log(res);
                node = node.child;
            }
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
        return jsidea.geom.Transform.create(this[0]).globalToLocal(x, y, z);
    };
    $.fn.localToGlobal = function(x: number, y: number, z: number = 0) {
        return jsidea.geom.Transform.create(this[0]).localToGlobal(x, y, z);
    };
} (jQuery));