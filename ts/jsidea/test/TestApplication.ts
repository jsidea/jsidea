module jsidea.test {
    export class TestApplication extends jsidea.system.Application {
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

            var max = 16;
            var te = 16;//5;//7;//11 for ie11 testing 5 is scrolling test
            document.body.className = "test-" + te;

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 1920;
            can.height = 1080;
            var ctx = can.getContext("2d");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var c = document.createElement("div");
            c.id = "c-cont";
            var d = document.createElement("div");
            d.id = "d-cont";
            var xc = document.createElement("div");
            xc.id = "x-cont";

            a.appendChild(b);
            b.appendChild(c);
            c.appendChild(d);
            d.appendChild(xc);
            con.appendChild(a);
            document.body.appendChild(can);

            var pos = new layout.Position();
//            pos.to.x = "100%";
//            pos.to.y = "100%";
            pos.useTransform = true;
//            pos.to.boxModel = layout.BoxModel.BORDER;
            pos.bounds.element = a;
            
            var target: HTMLElement = null;
            document.addEventListener("mousedown",(evt) => {
                //                if (!evt.ctrlKey)
                //                    return;
                target = <HTMLElement> evt.target;
                var pt = new geom.Point3D(evt.pageX, evt.pageY);
                var loc = geom.Transform.create(target).globalToLocalPoint(pt, pos.to.boxModel);
                pos.to.x = loc.x;
                pos.to.y = loc.y;                
                
//                pos.useTransform = Math.random() > 0.5;
                
                evt.preventDefault();
                evt.stopImmediatePropagation();
            });
            document.addEventListener("mouseup",(evt) => {
                target = null;
            });
            document.addEventListener("mousemove",(evt) => {
                if (!target)
                    return;
                var pt = new geom.Point3D(this.pageX, this.pageY);
                pos.from.x = pt.x;
                pos.from.y = pt.y;
                
                pos.apply(target);
            });

            var draw = () => {
                ctx.clearRect(0, 0, can.width, can.height);

                this.drawBoundingBox(ctx, vie);
                this.drawBoundingBox(ctx, con);
                this.drawBoundingBox(ctx, a);
                this.drawBoundingBox(ctx, b);
                this.drawBoundingBox(ctx, c);
                this.drawBoundingBox(ctx, d);
                this.drawBoundingBox(ctx, xc);
                this.drawBoundingBox(ctx, can);
                
                this.logChain(xc);
            };
            
//            draw();
//            document.addEventListener("click", draw);
            
            var setTest = (e:KeyboardEvent) => {
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
                }
            }
            document.addEventListener("keyup", setTest);

            //           var target = con;
            //             var observer = new MutationObserver(function(mutations) {
            //                mutations.forEach(function(mutation) {
            //                    console.log(
            //                    mutation.type, 
            //                        mutation.attributeName, 
            //                        mutation.oldValue, 
            //                        mutation.target[mutation.attributeName],
            //                        mutation.attributeNamespace,
            //                        mutation.target);
            //                });
            //            });
            //            var config:MutationObserverInit = { attributes: true, childList: true, characterData: true, subtree: true };
            //            observer.observe(target, config);
            //            document.documentElement.addEventListener('DOMAttrModified', function(e) {
            //                if (e.attrName === 'style') {
            //                    console.log('prevValue: ' + e.prevValue, 'newValue: ' + e.newValue);
            //                }
            //            }, false);
        }

        private drawOffsetChain(ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            while (e && e.parentElement != document.body.parentElement) {
                var sc = layout.StyleChain.create(e);
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

            var from = geom.Transform.create(e);
            from.fromBox = layout.BoxModel.BORDER;

            var to = geom.Transform.create(can);
            to.toBox = layout.BoxModel.CANVAS;

            a = from.localToLocal(to, a.x, a.y);
            b = from.localToLocal(to, b.x, b.y);
            c = from.localToLocal(to, c.x, c.y);
            d = from.localToLocal(to, d.x, d.y);

            ctx.beginPath();
            //            ctx.setLineDash([4, 4]);
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
            var node = layout.StyleChain.create(f);
            if (node)
                node = node.first;
            while (node) {
                var ofp = <HTMLElement> node.element.offsetParent;
                var calcedOff = node.offsetParent ? node.offsetParent.element : null;
                //                var calced = geom.Transform.getParentBlock(node);
                //                var calcedPar = calced ? calced.element : null;
                var scaleOff = node.parentScroll ? node.parentScroll.element : null;
                var res = ([
                    text.Text.conc(10, " ", node.element.id ? node.element.id : node.element.nodeName),
                    text.Text.conc(16, " ", "PARENT", ofp ? (ofp.id ? ofp.id : ofp.nodeName) : "NONE"),
                    text.Text.conc(16, " ", "PARENT_C", calcedOff ? (calcedOff.id ? calcedOff.id : calcedOff.nodeName) : "NONE"),
                    //                    text.Text.conc(18, " ", "SCROLL_C", scaleOff ? (scaleOff.id ? scaleOff.id : scaleOff.nodeName) : "NONE"),
                    //                    text.Text.conc(18, " ", "PARENT_B", calcedPar ? (calcedPar.id ? calcedPar.id : calcedPar.nodeName) : "NONE"),
                    text.Text.conc(18, " ", "OFFSET", node.offsetLeft, node.offsetTop),
                    text.Text.conc(18, " ", "OFFSET_C", node.offset.x, node.offset.y),
                    //                    text.Text.conc(12, " ", "DISPLAY", node.style.display),
                    text.Text.conc(12, " ", "ACC", node.isAccumulatable),
                    text.Text.conc(18, " ", "TRANSFORMED", node.isTransformed, node.style.perspective),
                    text.Text.conc(18, " ", "PRESERVED", node.isPreserved3dOrPerspective),//, node.style.transformStyle),
                    //                    text.Text.conc(18, " ", "MARGIN", node.style.marginLeft, node.style.marginTop),
                    text.Text.conc(18, " ", "BORDER", node.style.borderLeftWidth, node.style.borderTopWidth),
                    //                    text.Text.conc(18, " ", "PADDING", node.style.paddingLeft, node.style.paddingTop),
                    text.Text.conc(18, " ", "OVERFLOW", node.style.overflow),
                    text.Text.conc(18, " ", "POSITION", node.style.position, node.isSticked)
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

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            //            d.bind("click.setup",(e: jsidea.events.IEvent) => console.log(e.eventType));
            //            d.trigger(".setup");
        }

        public static qualifiedClassName: string = "jsidea.test.TestApplication";
        public toString(): string {
            return "[" + TestApplication.qualifiedClassName + "]";
        }
    }
}

//interface JQuery {
//    globalToLocal(x: number, y: number, z?: number): jsidea.geom.IPoint3DValue;
//    localToGlobal(x: number, y: number, z?: number): jsidea.geom.IPoint3DValue;
//}
//
//(function($) {
//    $.fn.globalToLocal = function(x: number, y: number, z: number = 0) {
//        return jsidea.geom.Transform.create(this[0]).globalToLocal(x, y, z);
//    };
//    $.fn.localToGlobal = function(x: number, y: number, z: number = 0) {
//        return jsidea.geom.Transform.create(this[0]).localToGlobal(x, y, z);
//    };
//} (jQuery));