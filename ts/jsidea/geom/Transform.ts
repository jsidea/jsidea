module jsidea.geom {
    interface INodeStyle {
        parent: INodeStyle;
        element: HTMLElement;
        style: CSSStyleDeclaration;
    }
    export class Transform {

        private static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
        private static isIE = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);

        public toBox: string = "border";
        public fromBox: string = "border";

        private _matrices: geom.Matrix3D[] = [];
        private _inverted: boolean = false;
        private _box: geom.BoxModel = new geom.BoxModel();

        constructor(element: HTMLElement, root: HTMLElement = null) {
            this.update(element, root);
        }

        private update(element: HTMLElement, root: HTMLElement = null): void {
            var chain = Transform.extractStyleChain(element, root);
            this._inverted = false;
            this._matrices = Transform.extractAccumulatedMatrices(chain);
            this._box.parse(element, chain.style);
        }

        private invert(): void {
            this._inverted = !this._inverted;
            this._matrices.reverse();
            var l = this._matrices.length;
            for (var i = 0; i < l; ++i)
                this._matrices[i].invert();
        }

        public localToLocalPoint(to: HTMLElement, pt: geom.Point3D, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            return this.localToLocal(to, pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public localToLocal(to: HTMLElement, x: number, y: number, z: number = 0, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            //check if to contains element
            //check if element contains to
            //if so shorten the way here
            var gl = this.localToGlobal(x, y, z, "border", fromBox);
            return Transform.extract(to).globalToLocalPoint(gl, toBox, "border");
        }

        public globalToLocalPoint(pt: geom.Point3D, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            return this.globalToLocal(pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public globalToLocal(x: number, y: number, z: number = 0, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            //we need the globalToLocal matrices
            if (!this._inverted)
                this.invert();
            
            //apply box model transformations
            if (toBox == "auto")
                toBox = this.toBox;
            if (fromBox == "auto")
                fromBox = this.fromBox;
            this._box.point(pt, "border", fromBox);
            
            //project from parent to child
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].project(pt, pt);

            //apply box model transformations
            this._box.point(pt, toBox, "border");

            return pt;
        }

        public localToGlobalPoint(pt: geom.Point3D, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            return this.localToGlobal(pt.x, pt.y, pt.z, toBox, fromBox);
        }

        public localToGlobal(x: number, y: number, z: number = 0, toBox: string = "auto", fromBox: string = "auto"): jsidea.geom.Point3D {
            //we need the localToGlobal matrices
            if (this._inverted)
                this.invert();

            var pt = new geom.Point3D(x, y, z);
            
            //apply box model transformations
            if (toBox == "auto")
                toBox = this.toBox;
            if (fromBox == "auto")
                fromBox = this.fromBox;
            this._box.point(pt, "border", fromBox);            
            
            //unproject from child to parent
            var nodes: geom.Matrix3D[] = this._matrices;
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].unproject(pt, pt);
            
            //apply box model transformations
            this._box.point(pt, toBox, "border");

            return pt;
        }

        public static extract(element: HTMLElement, root: HTMLElement = null): geom.Transform {
            return new Transform(element, root);
        }

        private static extractMatrix(node: INodeStyle, matrix: geom.Matrix3D = null): geom.Matrix3D {
            if (!matrix)
                matrix = new geom.Matrix3D();
            if (!node)
                return matrix;

            var element: HTMLElement = node.element;
            var style: CSSStyleDeclaration = node.style;
            var parentStyle: CSSStyleDeclaration = node.parent.style;
            
            //------
            //transform
            //------
            var origin = style.transformOrigin.split(" ");
            var originX = math.Number.parseRelation(origin[0], element.offsetWidth, 0);
            var originY = math.Number.parseRelation(origin[1], element.offsetHeight, 0);
            var originZ = math.Number.parseRelation(origin[2], 0, 0);

            matrix.appendPositionRaw(-originX, -originY, -originZ);
            matrix.appendCSS(style.transform);
            matrix.appendPositionRaw(originX, originY, originZ);
            
            //------
            //offset
            //------

            //            var offset = new geom.Point2D(element.offsetLeft, element.offsetTop);


            

            var offset = this.extractOffset(element);
            //            console.log(offset);

            //            if (element.parentElement && element.offsetParent && element.offsetParent != element.parentElement) {
            //                offset = this.extractOffset(element.parentElement, offset);
            ////                offset.x -= element.parentElement.clientLeft;
            ////                offset.y -= element.parentElement.clientTop;
            //            }
            //            else {
            //                offset.x += element.parentElement.clientLeft;
            //                offset.y += element.parentElement.clientTop;
            //            }

            
            //add scrolling offsets
            //webkit has the scroll-values set on html not on the body?
            if (this.isWebkit) {
                if (false && node.parent.element != document.body) {
//                    if (node.style.display != "static") {
                        if (node.element.offsetParent != node.parent.element) {
                        offset.x -= node.parent.element.scrollLeft;
                        offset.y -= node.parent.element.scrollTop;
                    }
                    else {
                        offset.x -= node.element.scrollLeft;
                        offset.y -= node.element.scrollTop;
                    }
                }
            }
            else if (node.element != document.body) {
                offset.x -= node.parent.element.scrollLeft;
                offset.y -= node.parent.element.scrollTop;
            }

            //append the offset to the transform-matrix
            matrix.appendPositionRaw(offset.x, offset.y, 0);
            
            //-------
            //perspective
            //-------
            var perspective = math.Number.parse(parentStyle.perspective, 0);
            if (!perspective)
                return matrix;

            var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
            var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
            var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

            matrix.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
            matrix.appendPerspective(perspective);
            matrix.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);

            return matrix;
        }

        //FOR WEBKIT AND IE11
        
        //return one for subtract
        //and 1 for add
        //and 0 for don change offset (keep like firefox give it)
        private static needBorderSubtract(element: HTMLElement): number {
            if (!element || !element.parentElement)
                return 0;

            var style = window.getComputedStyle(element);
            var parentStyle = window.getComputedStyle(element.parentElement);

            var ret = 1;

            var check = style.position == "absolute"
                && parentStyle.position == "static"
                && parentStyle.overflow == "scroll"
                && element.offsetParent != element.parentElement.offsetParent;
            if (style.boxSizing == "content-box" && check

                ) {
                return 1;
            }
            else if (style.boxSizing == "border-box" && !check) {
                return -1;
            }

            return 0;
            //            return element.id == "a-cont" ? ret : 0;
        }
        
        //FOR WEBKIT AND IE11
        private static extractOffset(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {

            ret.x = element.offsetLeft;
            ret.y = element.offsetTop;

            var sub = 0;
            if (this.isFirefox) {
                if (element.offsetParent && (sub = this.needBorderSubtract(element))) {
                    ret.x += sub * element.offsetParent.clientLeft;
                    ret.y += sub * element.offsetParent.clientTop;
                }
            }

            if (element.parentElement && element.offsetParent && element.offsetParent != element.parentElement) {
                if (this.isFirefox) {
                    //
                    if (element.parentElement.offsetParent && (sub = this.needBorderSubtract(element.parentElement))) {

                        ret.x -= element.parentElement.offsetLeft + sub * element.parentElement.offsetParent.clientLeft;
                        ret.y -= element.parentElement.offsetTop + sub * element.parentElement.offsetParent.clientTop;
                    }
                    else {
                        ret.x -= element.parentElement.offsetLeft;
                        ret.y -= element.parentElement.offsetTop;
                    }
                }
                else {
                    ret.x -= element.parentElement.offsetLeft;
                    ret.y -= element.parentElement.offsetTop;
                }
            }
            else {
                ret.x += element.parentElement.clientLeft;
                ret.y += element.parentElement.clientTop;
            }
            return ret;
        }

        private static extractOffset2(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (
                (window.getComputedStyle(element).boxSizing == "border-box")
                && element.parentElement
                && element.offsetParent
                ) {


                if (element.id != "a-cont") {
                    ret.x -= element.offsetParent.clientLeft;
                    ret.y -= element.offsetParent.clientTop;
                }
                //                    
                //                                    console.log("BUG-FIX-C: add offsetParentClient " + (element.id ? element.id : element.nodeName));

            }

            //            if (this.isFirefox) {
            //                if ((style.position == "absolute" || style.position == "relative") && parentStyle.overflow != "visible" && parentStyle.position != "static") {
            //                    offsetX += element.parentElement.clientLeft;
            //                    offsetY += element.parentElement.clientTop;
            //                    console.log("BUG-FIX-A: add borderParentClient");
            //                }
            //
            //                if (
            //                    (style.boxSizing == "border-box")
            //                    && element.parentElement
            //                    && element.offsetParent
            //                    ) {
            //
            //
            //                    if (element.id != "a-cont") {
            //                        offsetX -= element.offsetParent.clientLeft;
            //                        offsetY -= element.offsetParent.clientTop;
            //                    }
            ////                    
            ////                    console.log("BUG-FIX-C: add offsetParentClient " + (element.id ? element.id : element.nodeName));
            //
            //                }
            //
            //                else if (
            //                    (style.position == "absolute" || style.position == "relative")
            //                    && parentStyle.position == "static"
            //                    && element.parentElement
            //                    && element.offsetParent
            //                    && element.offsetParent != element.parentElement
            //                    && window.getComputedStyle(element.offsetParent).overflow != "visible"
            //                    ) {
            //
            //                    offsetX += element.offsetParent.clientLeft;
            //                    offsetY += element.offsetParent.clientTop;
            //
            //                    console.log("BUG-FIX-B: add offsetParentClient " + (element.id ? element.id : element.nodeName));
            //
            //                }
            //            }    
            
            return ret;
        }

        private static extractStyleChain(element: HTMLElement, root: HTMLElement = null): INodeStyle {
            //collect computed styles/nodes up to html/root (including html/root)
            root = root ? root : document.body.parentElement;
            var lastNode: INodeStyle = null;
            var leaf: INodeStyle = null;
            while (element && element != root.parentElement) {
                var node = {
                    element: element,
                    style: window.getComputedStyle(element),
                    parent: null
                };
                if (!leaf)
                    leaf = node;
                if (lastNode)
                    lastNode.parent = node;
                lastNode = node;
                element = element.parentElement;
            }
            return leaf;
        }

        private static extractAccumulatedMatrices(node: INodeStyle): geom.Matrix3D[] {
            //collect matrices up to root
            //accumulate if possible
            var matrices: geom.Matrix3D[] = [];
            var last: geom.Matrix3D = null;
            while (node.parent) {
                //if last is not null, last becomes the base for the transformation
                //its like appending the current node.transform (parent-transform) to the last transform (child-transform)
                var m: geom.Matrix3D = this.extractMatrix(node, last);
                if (node.parent && this.isAccumulatable(node)) {
                    last = m;
                }
                else {
                    last = null;
                    matrices.push(m);
                }
                node = node.parent;
            }
            if (last)
                matrices.push(last);
            return matrices;
        }

        private static isAccumulatable(node: INodeStyle): boolean {
            //in any case, if an element has only 2d-transforms or its the document-root item
            //the transform can be accumulated to the parent transform
            if (!node.parent || node.style.transform.indexOf("matrix3d") < 0)
                return true;

            var parent = node.parent;
            if (parent.style.transformStyle == "flat")
                return false;

            //if the parent is preserve-3d than it normally should be accumlatable, but ...
            var preserve3d = parent.style.transformStyle == "preserve-3d";
            
            //tricky stuff: only firefox does reflect/compute the "correct" transformStyle value.
            //Firefox does NOT reflect the "grouping"-overrides and this is how its concepted.
            //But what about the "opacity"-property. Opacity does not override the preserve-3d (not always, webkit does under some conditions).
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if (preserve3d && parent.style.overflow != "visible")
                preserve3d = false;
            
            //there is this case where webkit ignores transform-style: flat. 
            //So when the elements parent has preserve-3d and the element itself has no transform set.
            if (!preserve3d && this.isWebkit && parent.style.transform == "none" && parent.parent)
                preserve3d = this.isAccumulatable(parent.parent);

            return preserve3d;
        }
    }
}