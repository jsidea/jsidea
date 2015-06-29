module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        constructor() {
            super();
        }

        //@override abstract
        public create(): void {
            this.testMatrix3D();
        }

        private testMatrix3D(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var ac = document.createElement("div");
            ac.id = "ac-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            con.appendChild(a);
            a.appendChild(b);
            a.appendChild(ac);
            b.appendChild(bc);

            $(document).bind("mousemove",(evt) => {
                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);

                var vp = new geom.Viewport();
                var focalMatrix = new geom.Matrix3D();

                var ma = geom.Matrix3D.extract(a);
                vp.fromElement(con);
                
                
                
                vp.focalLength = focalMatrix.prependPerspective(vp.focalLength).getPerspective();
                this.applyPos(this.unp(screen, vp, ma), ac);

                var mb = geom.Matrix3D.extract(b);
                ma.append(mb);
                vp.fromElement(b.parentElement);
                
                var tes = new geom.Matrix3D();
                
//                var val = (1 / 800) + (1 / 300);
//                console.log(1 / val);
//                
//                tes.prependPerspective(800);
//                tes.prependPerspective(300);
//                console.log(tes.getPerspective());
                
                //calc new focal length
//                var val = (1 / 600) + (1 / 300);
//                val = (1 / val);
//                console.log(val);
                
//                tes.prependPerspective(800);
//                tes.prependPerspective(300);
//                console.log(tes.getPerspective());
                
                //A -> perspective-origin: 256px 256px; PERS: 600
                //B -> perspective-origin: 0px 0px; PERS: 300
                //FOC -> 200
                //PERS-> 85px 85px
                
//                var te = new geom.Point3D(128, 128, 1);
//                te.unproject(vp.focalLength, new geom.Point2D(0, 0));
//                console.log(te.toString());
                
                var t1 = new geom.Matrix3D();
                t1.appendPositionRaw(256, 256, 0);
                t1.appendPerspective(600);
                t1.appendPositionRaw(-256, -256, 0);
                var t2 = new geom.Matrix3D();
                t2.appendPositionRaw(128, 0, 0);
                t2.appendPerspective(300);
                t2.appendPositionRaw(-128, 0, 0);
                var t3 = geom.Matrix3D.multiply(t1, t2);
                
                vp.origin.x = (1 / -t3.m34) * t3.m31;
                vp.origin.y = (1 / -t3.m34) * t3.m32;
                
//                vp.origin.x = 170.7;
//                vp.origin.y = 85;
                
//                console.log((1 / -t3.m34) * t3.m31);
//                console.log((1 / -t3.m34) * t3.m32);
                
                var ps = window.getComputedStyle(b.parentElement);
                if (ps.transformStyle == "preserve-3d")
                    vp.focalLength = focalMatrix.prependPerspective(vp.focalLength).getPerspective();
                else
                    vp.focalLength = math.Number.parse(ps.perspective, 0);
//                console.log(vp.origin);
//                console.log(vp.focalLength);
                
                this.applyPos(this.unp(screen, vp, ma), bc);
            });
        }

        private applyPos(pos: geom.Point3D, visual: HTMLElement): void {
            var x = math.Number.clamp(pos.x, -2048, 2048);
            var y = math.Number.clamp(pos.y, -2048, 2048);
            visual.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
        }

        private unp(screen: geom.Point3D, vp: geom.Viewport, m: geom.Matrix3D): geom.Point3D {
            m = m.clone();

            //unproject
            var dir = new geom.Point3D(screen.x, screen.y, -1);
            dir.unproject(vp.focalLength, vp.origin);
            //create plane
            var pl = new geom.Plane3D();
            pl.fromPoints(
                m.transform(new geom.Point3D(0, 0, 0)),
                m.transform(new geom.Point3D(1, 0, 0)),
                m.transform(new geom.Point3D(0, 1, 0))
                );
            
            //intersect plane -- extract z
            var fin: geom.Point3D = pl.intersectLine(screen, dir);
            fin.z *= -1;
            fin.x = screen.x;
            fin.y = screen.y;
            
            //unproject intersection to get the final position in scene space
            fin.unproject(vp.focalLength, vp.origin);
            
            //transform from scene to local
            m.invert();
            return m.transform(fin);
        }

        private testMatrix3DOLD(): void {
            var a = $("<div id='a-cont'></div>");
            $("#content").append(a);

            var b = $("<div id='b-cont'></div>");
            a.append(b);

            var ac = $("<div id='ac-cont'></div>");
            a.append(ac);

            var bc = $("<div id='bc-cont'></div>");
            b.append(bc);

            var vp = new geom.Viewport();
            vp.fromElement($("#content")[0]);

            $(document).bind("mousemove",(evt) => {

                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);

                //create concatenated matrix
                var m: geom.Matrix3D = geom.Matrix3D.extract(a[0]);
                m.prepend(geom.Matrix3D.extract(b[0]));
                //unproject
                var dir = new geom.Point3D(screen.x, screen.y, 1);
                dir.unproject(vp.focalLength, vp.origin);
                //create plane
                var pl = new geom.Plane3D();
                pl.fromPoints(
                    m.transform(new geom.Point3D(0, 0, 0)),
                    m.transform(new geom.Point3D(1, 0, 0)),
                    m.transform(new geom.Point3D(0, 1, 0)));
                //intersect plane -- extract z
                var fin: geom.Point3D = pl.intersectLine(screen, dir);
                fin.z *= -1;
                fin.x = screen.x;
                fin.y = screen.y;
                //unproject intersection to get the final position in scene space
                fin.unproject(vp.focalLength, vp.origin);
                //transform from scene to local                
                m.invert();
                var loc: geom.Point3D = m.transform(fin);
                loc.x = math.Number.clamp(loc.x, -1024, 1024);
                loc.y = math.Number.clamp(loc.y, -1024, 1024);
                bc.css("transform", "translate(" + Math.round(loc.x) + "px," + Math.round(loc.y) + "px)");
            });
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
    $.fn.globalToLocal = function(x: number, y: number) {
        return jsidea.geom.Transform.getGlobalToLocal(this[0], x, y);
    };
    $.fn.localToGlobal = function(x: number, y: number) {
        return jsidea.geom.Transform.getLocalToGlobal(this[0], x, y);
    };
} (jQuery));