module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        constructor() {
            super();
        }

        //@override abstract
        public create(): void {

            //var img: IsoImage = new IsoImage();

            this.testMatrix3D();
            //this.testPosition();
            //            this.testXMLConverter();
            //            this.testDialog();
            //            this.testPoint();
            //            this.testObserver();
            //                        this.testMatrix();
        }

        private testMatrix3D(): void {

            var a = $("<div id='a-cont'></div>");
            $("#content").append(a);
            
            var c = $("<div id='c-cont'></div>");
            a.append(c);
            
            var b = $("<div id='b-cont'></div>");
            c.append(b);
            

            var vp = new geom.Viewport();
            vp.width = $("#content").width();
            vp.height = $("#content").height();
            vp.originX = 256;
            vp.originY = 256;
            vp.focalLength = parseFloat($("#content").css("perspective").replace("px", ""));//vp.perspectiveToFocal(parseFloat($("#content").css("perspective").replace("px", "")));
            console.log("FOC", vp.focalLength);

            var pl = new geom.Plane3D();

            $(document).bind("mousemove",(evt) => {

                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);
                var dir = new geom.Point3D(screen.x, screen.y, 1);
                var focalLength: number = vp.focalLength;

                var m: geom.Matrix3D = geom.Matrix3D.extract(a[0]);
                //m.prependScale(new geom.Point3D(0, 0, -1));
//                m.m31 *= -1;
//                m.m13 *= -1;
//                var zz = geom.Matrix3D.extract(c[0]);
//                zz.m31 *= -1;
//                zz.m13 *= -1;
                m.prepend(geom.Matrix3D.extract(c[0]));
                
//                console.log(m.toString());
//                return;
                
                
                pl.fromPoints(
                    m.transform(new geom.Point3D(0, 0, 0)),
                    m.transform(new geom.Point3D(1, 0, 0)),
                    m.transform(new geom.Point3D(0, 1, 0)));
                
                
//                console.log(m.toString());
//                return;
                
                //unproject
                var sc: number = focalLength / (focalLength + dir.z);
                dir.x -= vp.originX;
                dir.y -= vp.originY;
                dir.x /= sc;
                dir.y /= sc;
                dir.x += vp.originX;
                dir.y += vp.originY;
                
                //intersect plane -- extract z
                var fin: geom.Point3D = pl.intersectLine(screen, dir);
                fin.z *= -1;
//                console.log(fin.z);
////                console.log("FOC", focalLength);
//                return;
                fin.x = screen.x;
                fin.y = screen.y;
                
                
                
                //unproject intersection
                sc = (focalLength) / (focalLength + fin.z);
                fin.x -= vp.originX;
                fin.y -= vp.originY;
                fin.x /= sc;
                fin.y /= sc;
                fin.x += vp.originX;
                fin.y += vp.originY;
                
                
                
                m.invert();
//                console.log(m.toString());
//                return;
                var loc: geom.Point3D = m.transform(fin);
//                console.log(loc.x, loc.y);
                loc.x = math.Number.clamp(loc.x, -1024, 1024);
                loc.y = math.Number.clamp(loc.y, -1024, 1024);
                b.css("transform", "translate(" +Math.round(loc.x)+ "px," +Math.round(loc.y)+"px)");
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