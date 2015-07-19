module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

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
            
            //            var e = document.createElement("div");
            //            e.id = "e-cont";
            //            d.appendChild(e);

            var pos = new layout.Position();
            pos.to.x = "-100%";
            pos.to.y = "-100%";
            pos.toBox = "border";
            pos.fromBox = "border";
            
            //            console.log(this.getOffestToCrossDoc(a, document.body));
            //            console.log(this.getOffestToCrossDoc2(a, document.body));
            //            console.log(this.getOffestToCrossDoc3(a, document.body));
            

            document.addEventListener("click",(evt) => {
                ctx.clearRect(0, 0, can.width, can.height);
                
                //                this.drawBoundingBox(ctx, con);
                //                this.drawBoundingBox(ctx, a);
                //                this.drawBoundingBox(ctx, b);
                //                this.drawBoundingBox(ctx, c);
                //                this.drawBoundingBox(ctx, d);
                //                this.drawBoundingBox(ctx, vie);
                //                this.drawBoundingBox(ctx, can);
                
                this.logChain(d);
                this.drawOffsetChain(ctx, d);
            });

            document.addEventListener("mousemove",(evt) => {
                var pt: any = new geom.Point3D(evt.pageX, evt.pageY);
                pos.from.x = pt.x;
                pos.from.y = pt.y;
                //                pos.apply(d);
            });
        }

        private drawOffsetChain(ctx: CanvasRenderingContext2D, e: HTMLElement): void {

            while (e) {
                var off = geom.Transform.extractOffsetReal(e);
                //            console.log(off.x, off.y);
                this.drawCross(ctx, off.x, off.y);
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

            var locToGlo = geom.Transform.extract(e);
            a = locToGlo.localToGlobal(a.x, a.y);
            b = locToGlo.localToGlobal(b.x, b.y);
            c = locToGlo.localToGlobal(c.x, c.y);
            d = locToGlo.localToGlobal(d.x, d.y);

            var gloToLoc = geom.Transform.extract(can);
            gloToLoc.toBox = "canvas";
            a = gloToLoc.globalToLocal(a.x, a.y);
            b = gloToLoc.globalToLocal(b.x, b.y);
            c = gloToLoc.globalToLocal(c.x, c.y);
            d = gloToLoc.globalToLocal(d.x, d.y);

            //            console.log("TIME TO CALC 4 POINTS", (new Date()).getTime() - tim);

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

        private getOffestToCrossDoc2(f: HTMLElement, aOther: HTMLElement | Window): geom.Point2D {
            var top: number = 0;
            var left: number = 0;
            while (f && f != aOther) {
                left += f.clientLeft;
                top += f.clientTop;
                var par = f.parentElement;
                if (par) {
                    f = par;
                }
                else {

                }
            }
            return new geom.Point2D(left, top);
        }

        private logChain(f: HTMLElement): void {
            var res = "LOG-CHAIN\n";
            while (f) {
                var st = window.getComputedStyle(f);
                res += ([
                    text.Text.conc(10, " ", f.id ? f.id : f.nodeName),
                    text.Text.conc(20, " ", "PARENT", f.offsetParent ? (f.offsetParent.id ? f.offsetParent.id : f.offsetParent.nodeName) : "NONE"),
                    text.Text.conc(20, " ", "OFFSET", f.offsetLeft, f.offsetTop, f.offsetLeft - (f.offsetParent ? f.offsetParent.clientLeft : 0)),
                    text.Text.conc(20, " ", "MARGIN", st.marginLeft, st.marginTop),
                    text.Text.conc(20, " ", "BORDER", st.borderLeftWidth, st.borderTopWidth),
                    text.Text.conc(20, " ", "PADDING", st.paddingLeft, st.paddingTop),
                    text.Text.conc(14, " ", "SCROLL", f.scrollLeft, f.scrollTop),
                    text.Text.conc(28, " ", "OVERFLOW", st.overflow, st.boxSizing),
                    text.Text.conc(20, " ", "BOUNDS", f.getBoundingClientRect().left, f.getBoundingClientRect().top),
                    text.Text.conc(20, " ", "POSITION", st.position, st.left, st.top)
                ]).join(" ");
                res += "\n";
                f = f.parentElement;
            }
            console.log(res);
        }

        private getOffestToCrossDoc3(f: HTMLElement, aOther: HTMLElement | Window): geom.Point2D {
            var top: number = 0;
            var left: number = 0;
            var z = 0;
            while (f && f != aOther) {

                //                top = 0;
                //                left = 0;
                
                if (f.parentElement != document.body) {
                    left -= f.parentElement.scrollLeft;
                    top -= f.parentElement.scrollTop;
                }

                var parentStyle = window.getComputedStyle(f.parentElement);
                var style = window.getComputedStyle(f);
                if (TestApplication.isFirefox) {
                    //                    left += math.Number.parse(parentStyle.borderLeftWidth, 0);
                    //                    top += math.Number.parse(parentStyle.borderTopWidth, 0);
                
                    //                    left += math.Number.parse(parentStyle.borderLeftWidth, 0);
                    //                    top += math.Number.parse(parentStyle.borderTopWidth, 0);
                    
                    
                    
                    left += f.offsetLeft;
                    top += f.offsetTop;

                    //                    left += f.clientLeft;
                    //                    top += f.clientTop;
                    //                    
                    //                    left -= f.parentElement.clientLeft;
                    //                    top -= f.parentElement.clientTop;
                    //
                    //                    left += math.Number.parse(parentStyle.borderLeftWidth, 0);
                    //                    top += math.Number.parse(parentStyle.borderTopWidth, 0);

                    //                    left -= math.Number.parse(parentStyle.paddingLeft, 0);
                    //                    top -= math.Number.parse(parentStyle.paddingTop, 0);
                    
                    //                    left -= math.Number.parse(style.paddingLeft, 0);
                    //                    top -= math.Number.parse(style.paddingTop, 0);
                    
                    //                    left += math.Number.parse(style.borderLeftWidth, 0);
                    //                    top += math.Number.parse(style.borderTopWidth, 0);
                    
                    //                    left += math.Number.parse(parentStyle.borderLeftWidth, 0);
                    //                    top += math.Number.parse(parentStyle.borderTopWidth, 0);
                    
                    //                    left += math.Number.parse(parentStyle.borderLeftWidth, 0);
                    //                    top += math.Number.parse(parentStyle.borderTopWidth, 0);
                }
                else {

                    left += f.offsetLeft;
                    top += f.offsetTop;

                    //
                    //                    left += math.Number.parse(parentStyle.paddingLeft, 0);
                    //                    top += math.Number.parse(parentStyle.paddingTop, 0);
                    
                    //                    left += math.Number.parse(parentStyle.marginLeft, 0);
                    //                    top += math.Number.parse(parentStyle.marginTop, 0);
                }

                if (++z > 1)
                    break;

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