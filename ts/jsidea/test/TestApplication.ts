module jsidea.test {
    export class TestApplication extends jsidea.Application {

        constructor() {
            super();
        }

        public create(): void {
            this.testDisplayObject();
//            this.testPoint();
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

        private testDisplayObject(): void {
            var a = new jsidea.display.Element();
            a.visual = $("<div>A</div>");
            a.x = 100;
            a.y = 100;
            a.rotation = 30;
            a.visual.css("left", "70px");
            $("#content").append(a.visual);

            var b = new jsidea.display.Element();
            b.visual = $("<div>B</div>");
            b.scaleX = 2;
            b.scaleY = 2;
            b.rotation = 45;
            b.visual.css("left", "100px");
            b.visual.css("margin-left", "40px");
//            b.visual.css("position", "absolute");
            a.visual.append(b.visual);

            var c = new jsidea.display.Element($("<div>C</div>"));
            c.visual.css("margin", "40px");
            c.rotation += 45;
            b.visual.append(c.visual);

            var gl = a.transform.localToGlobal(0, 0);
            var d = new jsidea.display.Element($("<div>D</div>"));
            d.visual.css("background-color", "#FFFF00");
            $("#content").append(d.visual);
            
//            console.log(d.visual.offset().left, d.visual.offset().top, d.visual[0].offsetLeft, d.visual[0].offsetTop);
            
            d.x = gl.x - d.offsetX;
            d.y = gl.y - d.offsetY;

            //this.bind("activate deactivate", (e: jsidea.events.IEvent) => console.log(e.eventType));
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
    }
}