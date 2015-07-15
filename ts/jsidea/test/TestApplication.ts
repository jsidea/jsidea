module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        constructor() {
            super();
        }

        //@override abstract
        public create(): void {
            this.testMatrix3D5();
        }

        private testMatrix3D5(): void {
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
            can.width = 2048;
            can.height = 1024;
            var ctx = can.getContext("2d");

            a.appendChild(b);
            b.appendChild(bc);
            con.appendChild(a);
            document.body.appendChild(can);

            this.drawBoundingBox3(can, ctx, con);
            this.drawBoundingBox3(can, ctx, a);
            this.drawBoundingBox3(can, ctx, b);
            this.drawBoundingBox3(can, ctx, bc);
            this.drawBoundingBox3(can, ctx, vie);
            //            this.drawBoundingBox3(can, ctx, b);
            //            this.drawBoundingBox4(can, ctx, a);

            $(document).bind("mousemove",(evt) => {
                var pt: any = new geom.Point3D(evt.pageX, evt.pageY);
                pt = geom.Transform.getGlobalToLocal(b, pt.x, pt.y);
                this.applyPos(pt, bc);

            });
        }

        private drawBoundingBox4(can: HTMLElement, ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            var size = 100;
            var cenX = e.offsetWidth * 0.5;
            var cenY = e.offsetHeight * 0.5;

            var a = new geom.Point3D(cenX, cenY, 0);
            var b = new geom.Point3D(cenX + size, cenY, 0);
            var c = new geom.Point3D(cenX, cenY, size);
            var d = new geom.Point3D(cenX, cenY + size, 0);

            var locToGlo = geom.Transform.getTransform(e);
            a = locToGlo.localToGlobal(a.x, a.y);
            b = locToGlo.localToGlobal(b.x, b.y);
            c = locToGlo.localToGlobal(c.x, c.y, c.z);
            d = locToGlo.localToGlobal(d.x, d.y);

            var gloToLoc = geom.Transform.getTransform(can);
            a = gloToLoc.globalToLocal(a.x, a.y);
            b = gloToLoc.globalToLocal(b.x, b.y);
            c = gloToLoc.globalToLocal(c.x, c.y);
            d = gloToLoc.globalToLocal(d.x, d.y);

            ctx.beginPath();

            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            ctx.moveTo(a.x, a.y);
            ctx.lineTo(d.x, d.y);

            ctx.setLineDash([]);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.moveTo(a.x, a.y);
            ctx.lineTo(c.x, c.y);

            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        private drawBoundingBox3(can: HTMLElement, ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);

            var tim = (new Date()).getTime();

            var locToGlo = geom.Transform.getTransform(e);
            a = locToGlo.localToGlobal(a.x, a.y);
            b = locToGlo.localToGlobal(b.x, b.y);
            c = locToGlo.localToGlobal(c.x, c.y);
            d = locToGlo.localToGlobal(d.x, d.y);

            var gloToLoc = geom.Transform.getTransform(can);
            a = gloToLoc.globalToLocal(a.x, a.y);
            b = gloToLoc.globalToLocal(b.x, b.y);
            c = gloToLoc.globalToLocal(c.x, c.y);
            d = gloToLoc.globalToLocal(d.x, d.y);
            
            //            orp = geom.Transform.getLocalToGlobal(e, orp);
            var tim2 = (new Date()).getTime();
            console.log("TIME TO CALC 4 POINTS", tim2 - tim);

            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            //            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 2;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            //x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean
            //            ctx.moveTo(orp.x + 5, orp.y);
            //            ctx.arc(orp.x, orp.y, 5, 0, 360);
            ctx.stroke();

            //            ctx.fillText("(" + orp.x.toFixed(2) + ", " + orp.y.toFixed(2) + ") ", orp.x + 5, orp.y - 5);
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

        private applyPos(pos: geom.Point3D, visual: HTMLElement): geom.Point3D {
            var x = math.Number.clamp(pos.x, -2048, 2048);
            var y = math.Number.clamp(pos.y, -2048, 2048);
            visual.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
            return pos;
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

        private testPosition(): void {
            //            //$("body").css("overflow", "hidden");
            //            $("body").css("height", "200%");
            //
            //            var a = $("<div id='a-cont'>A</div>");
            //            $("#content").append(a);
            //
            //            var e = $("<div id='b-cont'>B</div>");
            //            e.css("position", "absolute");
            //            a.append(e);
            //            //$("#content").append(e);
            //
            //            var p = new jsidea.layout.Position();
            //            p.my.px = "left";
            //            p.my.py = "top";
            ////            p.my.x = "-50%";
            ////            p.my.y = "-50%";
            //            p.of = window;
            //            $(document).bind("mousemove",(evt) => {
            //                p.at.x = this.pageX;
            //                p.at.y = this.pageY;
            //                //p.apply(e[0]);
            //                p.transform(e[0]);
            //            });
            //$("body").css("overflow", "hidden");

            var a = $("<div id='a-cont'></div>");
            $("#content").append(a);
            var e = $("<div id='b-cont'></div>");
            e.css("position", "absolute");
            a.append(e);
            
            //            var mt = geom.Matrix3D.extract(a[0]);
            //            mt.invert();
            
            $(document).bind("mousemove",(evt) => {
                var pt = a.globalToLocal(this.pageX, this.pageY);
                //                var pt = mt.transformRaw(this.pageX, this.pageY, 0);
                e.css("transform", "translate(" + Math.round(pt.x) + "px, " + Math.round(pt.y) + "px)");
                //                e.css("top", Math.round(pt.y) + "px");
                //                e.css("left", Math.round(pt.x) + "px");
            });

            //https://gist.github.com/turbodrive/dede2748fadb7e8dfb13
            var viewportWidth = 1280;
            var focalLength = 28;
            var filmWidth = 36;
            //var cssPerspective = viewportWidth / (filmWidth / focalLength);
            var cssPerspective = viewportWidth / (2 * Math.tan(Math.atan(filmWidth / (2 * focalLength))));
        }

        private testXMLConverter(): void {
            var x = new jsidea.model.conversion.XMLConverter();
        }

        private testPoint(): void {
            var p = new jsidea.geom.Point2D(5, 5);
            p.x = 5;
            p.y = 5;
            console.log(p.toString());
            console.log(p.length());
            p.normalize();
            console.log(p.length());
        }

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            d.bind("click.setup",(e: jsidea.events.IEvent) => console.log(e.eventType));
            d.trigger(".setup");
        }

        private testMatrix(): void {
            //            var m = new jsidea.geom.Matrix2D();
            //            m.appendPositionRaw(-100, -100);
            //            m.appendScaleRaw(2, 2);
            //            m.appendRotation(45);
            //            m.appendPositionRaw(100, 100);
            //            console.log(m.decompose());
            //
            //            var div = $("<div></div>");
            //            div.css({ backgroundColor: "#FF00FF", width: "200px", height: "200px", top: "0", left: "0", position: "absolute", transformOrigin: "0% 0%", transition: "all 1s" });
            //            $("#content").append(div);
            //            console.log(m.getCSS());
            //            div.delay(500).queue(() => div.css({ transform: m.getCSS() }));
            //
            //            div.append($("<div style='top:50%; left:50%; position:absolute; width:10px; height:10px; background-color:#FF0000'></div>"));
            //            var p = m.transform(0, 0);
            //            console.log(p.toString());
            
            var m = new geom.Matrix2D();
            m.appendPositionRaw(100, 80);
            m.appendScaleRaw(2, 4);
            m.appendRotation(45);
            var ma = m.getMatrix3D();
            var mat = ma.getMatrix2D();

            var p = new geom.Point2D(1, 1);
            var pt = new geom.Point3D(1, 1);

            console.log(m.transformRaw(p.x, p.y));
            console.log(ma.transform(pt));
            console.log(mat.transformRaw(p.x, p.y));
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}

interface JQuery {
    globalToLocal(x: number, y: number): jsidea.geom.IPoint2DValue;
    localToGlobal(x: number, y: number): jsidea.geom.IPoint2DValue;
}

(function($) {
    $.fn.globalToLocal = function(x: number, y: number, z: number = 0) {
        return jsidea.geom.Transform.getGlobalToLocal(this[0], x, y, z);
    };
    $.fn.localToGlobal = function(x: number, y: number, z: number = 0) {
        return jsidea.geom.Transform.getLocalToGlobal(this[0], x, y, z);
    };
} (jQuery));