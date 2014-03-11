module jsidea.test {
    export class TestApplication extends jsidea.Application {

        constructor() {
            super();
        }

        public create(): void {
            //this.testDisplayObject();
            this.testPoint();
        }

        private testPoint(): void {
            var p = new jsidea.geom.Point(5, 5);
            p.x = 5;
            p.y = 5;
            trace(p.toString());
            trace(p.distance(new 
            trace(p.length);
            p.normalize();
            trace(p.length);
        }

        private testDisplayObject(): void {
            var a = new jsidea.display.DisplayObject();
            a.element = $("<div>TEST</div>");
            a.x = 100;
            a.y = 100;
            a.rotation = 30;
            a.element.css("left", "70px");
            $("#content").append(a.element);

            var b = new jsidea.display.DisplayObject();
            b.element = $("<div>BBB</div>");
            b.scaleX = 2;
            b.scaleY = 2;
            b.rotation = 90;
            b.skewX = 45;
            b.element.css("left", "100px");
            b.element.css("margin-left", "40px");
            a.element.append(b.element);

            var c = new jsidea.display.DisplayObject($("<div>CCC</div>"));
            c.element.css("margin", "40px");
            c.rotation += 45;
            b.element.append(c.element);

            var gl = c.transform.localToGlobal(25, 50);
            var d = new jsidea.display.DisplayObject($("<div>DDD</div>"));
            d.x = gl.x;
            d.y = gl.y;
            d.element.css("background-color", "#FFFF00");
            trace("ADD IT", d.element);
            $("#content").append(d.element);
            console.log(c.transform.globalToLocal(gl.x, gl.y).toString());

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
            trace(m.decompose());

            var div = $("<div></div>");
            div.css({ backgroundColor: "#FF00FF", width: "200px", height: "200px", top: "0", left: "0", position: "absolute", transformOrigin: "0% 0%", transition: "all 1s" });
            $("#content").append(div);
            trace(m.cssMatrix);
            div.delay(500).queue(() => div.css({ transform: m.cssMatrix }));

            div.append($("<div style='top:50%; left:50%; position:absolute; width:10px; height:10px; background-color:#FF0000'></div>"));
            var p = m.transform(0, 0);
            trace(p.toString());
        }
    }
}