namespace jsidea.plugins {
    export class Test extends Plugin {
        constructor() {
            super();

            var vie = document.createElement("div");
            vie.id = "view";
            document.body.appendChild(vie);
            var con = document.createElement("div");
            con.id = "content";
            vie.appendChild(con);
            
            this.testGeometryUtils();
            //asfd - de:keyboard :)
        }

        private testGeometryUtils(): void {
            var con = document.getElementById("content");
            var vie = document.getElementById("view");

            var max = 17;
            var te = 17;//5;//7;//11 for ie11 testing 5 is scrolling test
            document.body.className = "test-" + te;

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 1920;
            can.height = 1080;
            var ctx = <CanvasRenderingContext2D>can.getContext("2d");
            var teste = `asdfasdf ${can.id}`;
            //            ctx.translate(100, 100);
            //            ctx.scale(2, 2);
            //            ctx.rotate(45);
            //            ctx = can.getContext("2d");
            //            console.log("CURRENT TRANSFORM", ctx.getTransform());

            var a = document.createElement("div");
            a.id = "a-cont";

            var tes = document.createElement("div");
            tes.id = "tes-cont";
            tes.style.fontSize = "100px";
            con.appendChild(tes);

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

            document.addEventListener("mousemove", (evt) => {
                var pt = layout.Transform.create(xc).globalToLocal(evt.pageX, evt.pageY, 0, null, layout.BoxModel.BORDER);
                tes.textContent = Math.round(pt.x) + " " + Math.round(pt.y);
            });

            var mode = layout.MoveMode.TRANSFORM;

            var snap = new layout.Snap();
            snap.grid.element = document.documentElement;
            snap.grid.boxModel = layout.BoxModel.PADDING;
            snap.to.x = 0;//"100%";
            snap.to.y = 0;//"100%";
            snap.to.boxModel = mode.boxModel;

            var pos = new layout.Position();
            pos.snap = snap;

            //drag settings
            pos.move.mode = mode;
            pos.to.boxModel = mode.boxModel;
            var invertX = mode.invertX;
            var invertY = mode.invertY;

            var target: HTMLElement = null;
            var pivot = new geom.Point3D();
            var box = new geom.Rect2D();
            var transform = layout.Transform.create();
            var size: layout.Box = layout.Box.create();
            var cursor = new geom.Point3D();
            
            //drag begin
            document.addEventListener("mousedown", (evt) => {
                target = <HTMLElement>evt.target;

                evt.preventDefault();
                evt.stopImmediatePropagation();

                var mode = pos.move.mode || layout.MoveMode.TRANSFORM;
                target.style.willChange = mode.willChange;

                cursor.setTo(evt.pageX, evt.pageY, 0);
                transform.update(target);

                var loc = transform.globalToLocalPoint(cursor, layout.BoxModel.BORDER, pos.to.boxModel);
                box = transform.size.bounds(pos.to.boxModel, null, box);
                pivot.x = invertX ? (box.width - loc.x) : loc.x;
                pivot.y = invertY ? (box.height - loc.y) : loc.y;

            });
            //drag
            document.addEventListener("mousemove", (evt) => {
                if (!target)
                    return;

                evt.preventDefault();
                evt.stopImmediatePropagation();

                cursor.setTo(evt.pageX, evt.pageY, 0);
                size.update(target, window.getComputedStyle(target));
                box = size.bounds(pos.to.boxModel, null, box);
                pos.to.x = invertX ? (box.width - pivot.x) : pivot.x;
                pos.to.y = invertY ? (box.height - pivot.y) : pivot.y;

                pos.from.x = cursor.x;
                pos.from.y = cursor.y;
                layout.Position.apply(pos, target);
            });
            //drag end
            document.addEventListener("mouseup", (evt) => {
                if (target)
                    target.style.willChange = "auto";
                target = null;

                evt.preventDefault();
                evt.stopImmediatePropagation();
            });

            //                        document.addEventListener("click",() => this.logChain(xc));

            var draw = () => {
                var g = display.Graphics.get(ctx);
                g.clear();
                g.bounds(vie);//, layout.BoxModel.PADDING);
                g.bounds(con);
                g.bounds(a);
                g.bounds(b);
                g.bounds(c);
                g.bounds(d);
                g.bounds(xc);//, layout.BoxModel.ATTACHMENT);
                g.bounds(can);
                g.stroke("#00FF00", 4);
            };
            document.addEventListener("click", draw);

            var setTest = (e: KeyboardEvent) => {
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
        }

        private testAffineFit(): void {
            var view = document.getElementById("view");
            var cont = document.getElementById("content");
            var a = document.createElement("div");
            a.id = "x-cont";

            view.style.perspective = "500px";
            cont.style.transform = "perspective(-300px) rotateY(-45deg)";
            //            cont.style.transformStyle = "preserve-3d";
            //            a.style.transform = "rotateY(45deg)";
            cont.appendChild(a);
        }

        private testMutationObserver(): void {
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
                var sc = layout.StyleNode.create(e);
                display.Graphics.get(ctx).cross(sc.offset.x, sc.offset.y, 20).stroke();
                e = e.parentElement;
            }
        }

        private logChain(f: HTMLElement): void {
            var node = layout.StyleNode.create(f);
            if (node)
                node = node.first;
            while (node) {
                var ofp = <HTMLElement>node.element.offsetParent;
                var calcedOff = node.offsetParent ? node.offsetParent.element : null;
                //                var calced = geom.Transform.getParentBlock(node);
                //                var calcedPar = calced ? calced.element : null;
                var scaleOff = node.parentScroll ? node.parentScroll.element : null;
                var res = ([
                    text.Text.conc(10, " ", node.element.id ? node.element.id : node.element.nodeName),
                    //                    text.Text.conc(16, " ", "PARENT", ofp ? (ofp.id ? ofp.id : ofp.nodeName) : "NONE"),
                    //                    text.Text.conc(16, " ", "PARENT_C", calcedOff ? (calcedOff.id ? calcedOff.id : calcedOff.nodeName) : "NONE"),
                    
                    //                    text.Text.conc(18, " ", "SCROLL_C", scaleOff ? (scaleOff.id ? scaleOff.id : scaleOff.nodeName) : "NONE"),
                    //                    text.Text.conc(18, " ", "PARENT_B", calcedPar ? (calcedPar.id ? calcedPar.id : calcedPar.nodeName) : "NONE"),
                    
                    //                    text.Text.conc(18, " ", "OFFSET", node.offsetLeft, node.offsetTop),
                    //                    text.Text.conc(18, " ", "OFFSET_C", node.offset.x, node.offset.y),
                    //                    text.Text.conc(18, " ", "PRESERVED", node.isPreserved3d),
                    
                    //                    text.Text.conc(12, " ", "DISPLAY", node.style.display),
                    text.Text.conc(12, " ", "FORCED_2D", node.isForced2D),
                    //                    text.Text.conc(18, " ", "SCROLL", node.element.scrollLeft, node.element.scrollTop),
                    //                    text.Text.conc(18, " ", "TRANSFORMED", node.isTransformed, node.style.perspective),
                    //                    text.Text.conc(18, " ", "TRANSFORMED", node.style.transform),
                    //                    text.Text.conc(18, " ", "PRESERVED", node.isPreserved3dOrPerspective),//, node.style.transformStyle),
                    
                    //                    text.Text.conc(18, " ", "MARGIN", node.style.marginLeft, node.style.marginTop),
                    //                    text.Text.conc(18, " ", "BORDER", node.style.borderLeftWidth, node.style.borderTopWidth),
                    //                    text.Text.conc(18, " ", "PADDING", node.style.paddingLeft, node.style.paddingTop),
                    //                    text.Text.conc(18, " ", "OVERFLOW", node.style.overflow),
                    //                    text.Text.conc(18, " ", "POSITION", node.style.position, node.isSticked)
                ]).join(" ");
                console.log(res);
                node = node.child;
            }
        }

        //        private testObserver(): void {
        //            var d = document.createElement("div");
        //            d.textContent = "A";
        //            document.body.appendChild(d);
        //            var o = d[0];
        //            Object.observe(o, function(a): void {
        //                console.log(a);
        //            });
        //            o.style.width = "200px";
        //            o.style.height = "200px";
        //            o.style.backgroundColor = "#FF00FF";
        //            //ARRGHHH funzt nit
        //        }

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            //            d.bind("click.setup",(e: jsidea.events.IEvent) => console.log(e.eventType));
            //            d.trigger(".setup");
        }
    }
}