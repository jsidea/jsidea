module jsidea {
    export class Application extends jsidea.events.EventDispatcher {

        public version: jsidea.core.IVersion;

        constructor() {
            super();

            this.create();
        }

        public create(): void {
            this.version = new jsidea.core.Version();
            //            var pt = new create.Point(0, 0);
            //            trace(pt.toString());
            //            var vea.display.Viewport();

            this.testDisplayObject();
        }
        private testDisplayObject(): void {
            var d = new jsidea.display.DisplayObject();
            d.element = $("<div>TEST</div>");
            d.x = 100;
            d.y = 100;
            d.rotation = 45;
            d.originX = 25;
            d.originY = 25;
            d.scaleX = 2;
            d.scaleY = 2;
            d.validate();
            $("#content").append(d.element);
            
            var b = new jsidea.display.DisplayObject();
            b.element = $("<div>AAA</div>");
            b.originX = d.originX;
            b.originY = d.originY;
//            b.skewX = 45;
            b.element.css("left", "10px");
            b.element.css("margin-left", "10px");
            b.validate();
            d.element.append(b.element);
            
            var c = new jsidea.display.DisplayObject();
            c.element = $("<div>CCC</div>");
            c.originX = b.originX;
            c.originY = b.originY;
            c.transform.matrix = b.transform.sceneTransform;
            c.validate();
            $("#content").append(c.element);
            
            trace(b.transform.sceneTransform.css);
        }
        
        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            d.bind("click.setup", (e:jsidea.events.IEvent) => trace(e.eventType));
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
            trace(m.css);
            div.delay(500).queue(() => div.css({ transform: m.css }));

            div.append($("<div style='top:50%; left:50%; position:absolute; width:10px; height:10px; background-color:#FF0000'></div>"));
            var p = m.transform(0, 0);
            trace(p.toString());
        }
    }
}
$(window).ready(() => new jsidea.Application());