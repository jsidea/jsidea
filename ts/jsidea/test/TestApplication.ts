module jsidea.test {
    export class TestApplication extends jsidea.Application {

        constructor() {
            super();
        }

        public create(): void {
            this.testPosition();
            //            this.testXMLConverter();
            //            this.testDialog();
            //            this.testElement();
            //            this.testPoint();
        }

        private testPosition(): void {
        
            
            $("body").css("overflow", "hidden");
            
            var a = new jsidea.display.Element();
            a.visual = $("<div>A</div>");
            a.transform.scaleX = 2;
            a.transform.x = 100;
            a.transform.y = 100;
//            a.transform.scaleY = 2;
//            a.transform.rotation = 25;
            $("#content").append(a.visual);
            
            var e = new jsidea.display.Element();
            e.visual = $("<div></div>");
//            e.visual.css("position", "relative");
//            e.transform.originX = 0;
//            e.transform.originY = 0;
//            e.transform.scaleX = 2;
//            e.transform.scaleY = 2;
            e.visual.css("margin", "50px");
//            e.transform.rotation = 90;
            $("#content").append(e.visual);
//            a.visual.append(e.visual);
            
//            var p = new jsidea.layout.Position(e.visual);
//            p.my.x = 0;
//            p.my.y = 0;
//            p.my.originX = "right";
//            p.my.originY = "bottom";
//            p.at.x = "right";
//            p.at.y = "bottom";
//            p.apply(e.transform);
            
            $("#content").css("transform-origin", "0px 0px");
//            $("#content").css("position", "fixed");
            $("#content").css("transform", "scale(0.75, 0.75)");
//            $("#content").css("transform", "scale(0.5, 0.5) skew(0, 25deg)");
            
            var p = new jsidea.layout.Position();
            p.my.originX = "right";
            p.my.originY = "bottom";
            p.at.x = "right";
            p.at.y = "center";
            p.of = $("body");//a.visual;//$("#content");
            p.transform(e.transform);
            
            $("body").mousemove((evt) => {
                p.at.x = evt.pageX;
                p.at.y = evt.pageY;
                p.transform(e.transform);
            });
        }

        private testXMLConverter(): void {
            var x = new jsidea.model.conversion.XMLConverter();
        }

        private testPoint(): void {
            var p = new jsidea.geom.Point(5, 5);
            p.x = 5;
            p.y = 5;
            console.log(p.toString());
            console.log(p.length);
            p.normalize();
            console.log(p.length);
        }

        private testDialog(): void {

        }

        private testElement(): void {
            var a = new jsidea.display.Element();
            a.visual = $("<div>A</div>");
            a.transform.x = 100;
            a.transform.y = 100;
            a.transform.rotation = 30;
            a.visual.css("left", "70px");
            $("#content").append(a.visual);

            var b = new jsidea.display.Element();
            b.visual = $("<div>B</div>");
            b.transform.scaleX = 2;
            b.transform.scaleY = 2;
            b.transform.rotation = 45;
            b.visual.css("left", "100px");
            b.visual.css("margin-left", "40px");
            //            b.visual.css("position", "absolute");
            a.visual.append(b.visual);

            var c = new jsidea.display.Element($("<div>C</div>"));
            c.visual.css("margin", "40px");
            c.transform.rotation += 45;
            b.visual.append(c.visual);

            var gl = c.transform.localToGlobal(0, 0);
            var d = new jsidea.display.Element($("<div>D</div>"));
            d.visual.css("background-color", "#FFFF00");
            $("#content").append(d.visual);

            //            console.log(d.presented);
            //            console.log(d.presented);
            //            d.visible = false;
            //            console.log(d.presented);

            //            console.log(d.visual.offset().left, d.visual.offset().top, d.visual[0].offsetLeft, d.visual[0].o            
            d.transform.x = gl.x - d.offsetX;
            d.transform.y = gl.y - d.offsetY;

            //this.bind("activate deactivate", (e: jsidea.events.IEvent) => console.log(e.eventType));

            //            console.log(gl);
            //            console.ld.height);

            d.opacity = 0.8;
            console.log(d.qualifiedClassName());
        }

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            d.bind("click.setup", (e: jsidea.events.IEvent) => console.log(e.eventType));
            d.trigger(".setup");
        }

        private testMatrix(): void {
            var m = new jsidea.geom.Matrix();
            m.translate(-100, -100);
            m.scale(2, 2);
            m.rotateDegree(45);
            m.translate(100, 100);
            console.log(m.decompose());

            var div = $("<div></div>");
            div.css({ backgroundColor: "#FF00FF", width: "200px", height: "200px", top: "0", left: "0", position: "absolute", transformOrigin: "0% 0%", transition: "all 1s" });
            $("#content").append(div);
            console.log(m.cssMatrix);
            div.delay(500).queue(() => div.css({ transform: m.cssMatrix }));

            div.append($("<div style='top:50%; left:50%; position:absolute; width:10px; height:10px; background-color:#FF0000'></div>"));
            var p = m.transform(0, 0);
            console.log(p.toString());
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}