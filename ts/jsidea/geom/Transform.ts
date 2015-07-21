interface HTMLElement {
    _node: jsidea.geom.INodeStyle;
}

module jsidea.geom {
    export interface INodeStyle {
        parent: INodeStyle;
        element: HTMLElement;
        offsetX: number;
        offsetY: number;
        style: CSSStyleDeclaration;
        offsetNode: INodeStyle;
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
            var offset = this.extractOffset(node);

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

        private static extractOffset(node: INodeStyle): geom.Point2D {

            var off = this.extractOffsetReal(node.element);

            //            if (this.isIE && this.isFixed(node.element))
            //            if (this.isIE && this.isFixed(node.element))
            //                return off;
            //
            //            else 
            if (this.isFixed(node.element))
                return off;

            var off2 = this.extractOffsetReal(node.parent ? node.parent.element : null);

            return off.sub(off2);
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
                    parent: null,
                    offsetX: 0,
                    offsetY: 0,
                    offsetNode: null
                };
                element._node = node;
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
                
                //                                if(node.parent && node.parent.style.position == "fixed")
                
                if (node && this.isFixed(node.element)) {
                    //                        last = m;
                    break;
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
        
        //TEST-AREA
        public static extractOffsetParentReal(element: HTMLElement): HTMLElement {
            
            //            return this.scrollParent(element);
            
            
            if (!element || element == document.body || element == document.body.parentElement)
                return null;

            //            if (this.isIE) {
            //                return <HTMLElement> element.offsetParent;
            //            }

            var style = window.getComputedStyle(element);
            //            if (this.extractIsFixedReal(element))
            if (style.position == "fixed")
                //            if (this.isFixed(element))
                return document.body;

            element = element.parentElement;
            while (element && element != document.body) {
                var style = window.getComputedStyle(element);
                if (style.position != "static" || style.transform != "none")
                    return element;
                element = element.parentElement;
            }

            return document.body;
        }
        
        //TEST-AREA
        public static getContainingBlock(element: HTMLElement): HTMLElement {
            if (!element || element == document.body || element == document.body.parentElement)
                return null;

            if (this.isIE) {
                return <HTMLElement> element.offsetParent;
            }

            var style = window.getComputedStyle(element);
            if (style.position == "static" || style.position == "relative")
                return element.parentElement;

            var html = document.body.parentElement;
            while ((element = element.parentElement) && element != html) {
                var style = window.getComputedStyle(element);
                //                if(style.position == "relative" || style.position == "absolute" || style.position == "fixed")
                if (style.position != "static" || style.transform != "none" || style.transformStyle == "preserve-3d")
                    return element;
            }

            return document.body.parentElement;
        }
        
        //TEST-AREA
        public static scrollParent(element: HTMLElement): HTMLElement {
            if (!element || element == document.body || element == document.body.parentElement)
                return null;

            //            if (this.isIE) {
            //                return <HTMLElement> element.offsetParent;
            //            }

            if (this.isFixed(element)) {
                //                console.log("REAL FIXED", element.id);
                return document.body.parentElement;
            }
            
            //            if(this.isFixed(element))
            //            {
            //                return document.body;    
            //            }
            
            //            if (this.isIE)
            //                element = element.parentElement;


            var overflowRegex = /(auto|scroll)/;
            var style = window.getComputedStyle(element);
            var position = style.position;
            var excludeStaticParent = position === "absolute";// || (position == "fixed" && this.extractIsFixedReal(element));
            var isFixedToAbsolute = position == "fixed" && !this.isFixed(element);

            
            //            if (isFixedToAbsolute) {
            //                //                console.log(element.id);
            //                return document.body;//scrollParent ? scrollParent.pareElement : null;
            //            }
            
            //            if(isFixedToAbsolute)
            //                excludeStaticParent = true;
            //            if (this.isWebkit)
            element = element.parentElement;

            //            var el = element;
            
            var scrollParent = null;
            while (element && element != document.body) {
                var style = window.getComputedStyle(element);
                if (excludeStaticParent && style.position === "static" && style.transform == "none") {

                }
                else {
                    //style.transform != "none" || 
                    if ((overflowRegex).test(style.overflow + style.overflowY + style.overflowX)) {
                        scrollParent = element;
                        break;
                    }
                }
                element = element.parentElement;
            }

            scrollParent = !scrollParent ? document.body : scrollParent;
            if (isFixedToAbsolute)
            {
                return this.scrollParent(scrollParent);
//                return scrollParent.parentElement;    
            }



            return scrollParent;
            //            return this.extractIsFixedReal(el) || !scrollParent ? document.body : scrollParent;
        }

        private static extractIsFixedRealAsso(element: HTMLElement): boolean {
            if (this.isIE)
                return this.isFixed(element);

            while (element && element != document.body) {
                if (this.isFixed(element))
                    return true;
                element = element.parentElement;
            }
            return false;
        }

        private static isFixed(element: HTMLElement): boolean {
            var style = window.getComputedStyle(element);
            var isFixed = style.position == "fixed";
            
            //ie does it right
            if (this.isIE)
                return isFixed;

            //just skip if the element itself has not fixed
            if (!isFixed)
                return false;

            var el = element;
            while ((element = element.parentElement) && element != document.body) {
                var style = window.getComputedStyle(element);
                //if (style.transform != "none")// || style.position != "static")
                //                if (style.transform != "none" || style.position != "static")
                if (style.transform != "none" || style.position != "static")// || style.overflow != "visible")
                    return false;
            }
            //            console.log("REALLY FIXED", el.id);
            return true;
        }
        
        //FOR IE11
        public static extractScrollRealIE(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!element || !element.parentElement)
                return ret;

            element = <HTMLElement> this.scrollParent(element);

            while (element && element != document.body) {
                var style = window.getComputedStyle(element);
                ret.x += element.scrollLeft;
                ret.y += element.scrollTop;
                element = <HTMLElement> this.scrollParent(element);
            }
            return ret;
        }
        
        //FOR WEBKIT AND IE11 (MAYBE firefox too)
        public static extractScrollRealWebkit(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!element || !element.parentElement)
                return ret;

            //            if (!this.isFixed(element))
            //                element = element.parentElement;
            //            element = <HTMLElement> this.scrollParent(element);
            
            element = <HTMLElement> this.scrollParent(element);

            while (element && element != document.body) {
                var style = window.getComputedStyle(element);
                ret.x += element.scrollLeft;
                ret.y += element.scrollTop;
                element = <HTMLElement> this.scrollParent(element);
            }
            return ret;
        }
        
        //        //FOR WEBKIT AND IE11 (MAYBE firefox too)
        //        public static extractScrollReal(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
        //            if (!element || !element.parentElement)
        //                return ret;
        //
        //            var style = window.getComputedStyle(element);
        //            if (style.position != "static")// || this.extractIsFixedReal(element))//style.position == "fixed")
        //                element = <HTMLElement> this.extractOffsetScroll(element);
        //            else
        //                element = element.parentElement;
        //
        //            while (element && element != document.body) {
        //                var style = window.getComputedStyle(element);
        //                ret.x += element.scrollLeft;
        //                ret.y += element.scrollTop;
        //                if (style.position != "static")// || this.extractIsFixedReal(element))//style.position == "fixed")
        //                    element = <HTMLElement> this.extractOffsetScroll(element);
        //                else
        //                    element = element.parentElement;
        //            }
        //            return ret;
        //        }

        public static extractOffsetReal(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            ret.x = 0;
            ret.y = 0;

            var sc = this.isIE ? this.extractScrollRealIE(element) : this.extractScrollRealWebkit(element);
            ret.x -= sc.x;
            ret.y -= sc.y;
            //            console.log(sc.x, sc.y);

            if (this.isIE) {
                ret.x += document.documentElement.scrollLeft;
                ret.y += document.documentElement.scrollTop;
            }

            //add scroll value only if reference of the element is the window not the body
            //if is really fixed, then just make it fast
            if (this.extractIsFixedRealAsso(element)) {
                if (this.isWebkit) {
                    ret.x += document.body.scrollLeft;
                    ret.y += document.body.scrollTop;
                }
                else if (this.isFirefox) {
                    ret.x += document.documentElement.scrollLeft;
                    ret.y += document.documentElement.scrollTop;
                }
            }
            
            //wow, ie11 and the offsets are correct
            //if the element is really fixed
            if (this.isFixed(element)) {
                ret.x += element.offsetLeft;
                ret.y += element.offsetTop;
                return ret;
            }

            while (element && element != document.body) {
                ret.x += element.offsetLeft;
                ret.y += element.offsetTop;
                
                //for webkit (if there is a wrong offserParent set,
                //then the offsets are also wrong... arghhh)
                //correct them here
                this.correctOffset(element, ret);

                //go up
                var par = this.extractOffsetParentReal(element);
                ret.x += par ? par.clientLeft : 0;
                ret.y += par ? par.clientTop : 0;
                element = <HTMLElement> par;
            }

            return ret;
        }

        public static correctOffset(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (this.isWebkit) {
                this.correctWebkitOffset(element, ret);
            } else if (this.isFirefox) {
                this.correctFirefoxOffset(element, ret);
                //                this.correctWebkitOffset(element, ret);
            }
            return ret;
        }

        public static correctFirefoxOffset(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            var style = window.getComputedStyle(element);
            var par = this.extractOffsetParentReal(element);
            var parentStyle = element.parentElement ? window.getComputedStyle(element.parentElement) : null;



            if (par && style.position == "absolute") {
                ret.x += par.clientLeft;
                ret.y += par.clientTop;
            }
            else if (parentStyle && style.position == "fixed" && parentStyle.position == "fixed") {
                ret.x -= element.parentElement.offsetLeft;
                ret.y -= element.parentElement.offsetTop;
                ret.x -= element.parentElement.clientLeft;
                ret.y -= element.parentElement.clientTop;
            }
            //            else if (par && parentStyle && style.position == "fixed" && parentStyle.position == "static") {
            ////                ret.x -= element.parentElement.offsetLeft;
            ////                ret.y -= element.parentElement.offsetTop;
            ////                ret.x += math.Number.parse(parentStyle.marginLeft, 0);
            ////                ret.y += math.Number.parse(parentStyle.marginTop, 0);
            //                ret.x += par.clientLeft;
            //                ret.y += par.clientTop;
            //                
            //                if (parentStyle.position == "relative" || parentStyle.position == "absolute") {
            //                    ret.x -= par.clientLeft;
            //                    ret.y -= par.clientTop;
            //
            //                    ret.x -= math.Number.parse(style.marginLeft, 0);
            //                    ret.y -= math.Number.parse(style.marginTop, 0);
            //                }
            //                else {
            //                    //                    ret.x -= element.parentElement.offsetLeft;
            //                    //                    ret.y -= element.parentElement.offsetTop;
            //                    //                     console.log("AHHH", element);
            //                    
            //                    ret.x -= par.offsetLeft;
            //                    ret.y -= par.offsetTop;
            ////                    console.log("AHHH", element);
            //                }
            //            }
            else if (par && parentStyle && style.position == "fixed" && !this.isFixed(element)) {

                if (parentStyle.position == "relative" || parentStyle.position == "absolute") {
                    //                    ret.x -= par.clientLeft;
                    //                    ret.y -= par.clientTop;
                    //
                    //                    ret.x -= math.Number.parse(style.marginLeft, 0);
                    //                    ret.y -= math.Number.parse(style.marginTop, 0);
                    
                    
                    ret.x -= element.parentElement.offsetLeft;
                    ret.y -= element.parentElement.offsetTop;
                    ret.x -= element.parentElement.clientLeft;
                    ret.y -= element.parentElement.clientTop;


                }
                else {
                    //                    ret.x -= element.parentElement.offsetLeft;
                    //                    ret.y -= element.parentElement.offsetTop;
                    var parStyle = par ? window.getComputedStyle(par) : null;
                    if (element.parentElement != par && parStyle.position == "static") {
                        //                        if(element.id == "a-cont")
                        //                        {
                        ret.x += par.clientLeft;
                        ret.y += par.clientTop;
                        //                        }
                        //                         console.log("AHHH", element.id);
                    }
                    
                    //                     console.log("AHHH", element);
                    //                    ret.x += element.parentElement.clientLeft;
                    //                    ret.y += element.parentElement.clientTop;
                    //                    ret.x -= par.offsetLeft;
                    //                    ret.y -= par.offsetTop;
                    
                    //                    ret.x += element.clientLeft;
                    //                    ret.y += element.clientTop;                   
                    
                    
                    //                    ret.x += math.Number.parse(style.marginLeft, 0);
                    //                    ret.y += math.Number.parse(style.marginTop, 0);
                    //                    //                    
                    //                                                            ret.x -= math.Number.parse(style.paddingLeft, 0);
                    //                                                            ret.y -= math.Number.parse(style.paddingTop, 0);
                    
                    
                    //                    ret.x -= element.parentElement.offsetLeft;
                    //                    ret.y -= element.parentElement.offsetTop;
                    //                    ret.x -= par.clientLeft;
                    //                    ret.y -= par.clientTop;
                    
                    //                    ret.x -= element.parentElement.clientLeft;
                    //                    ret.y -= element.parentElement.clientTop;
                    
                    //                    ret.x -= math.Number.parse(style.marginLeft, 0);
                    //                    ret.y -= math.Number.parse(style.marginTop, 0);
                    //                    ret.x += math.Number.parse(style.paddingLeft, 0);
                    //                    ret.y += math.Number.parse(style.paddingTop, 0);
                    
                    //                    ret.x += math.Number.parse(parentStyle.marginLeft, 0);
                    //                    ret.y += math.Number.parse(parentStyle.marginTop, 0);
                    
                    //                                       console.log("AHHH", element);
                }
                
                //                ret.x -= element.parentElement.offsetLeft;
                //                ret.y -= element.parentElement.offsetTop;
                
                //                ret.x += math.Number.parse(parentStyle.marginLeft, 0);
                //                ret.y += math.Number.parse(parentStyle.marginTop, 0);
                
                //                ret.x += par.clientLeft;
                //                ret.y += par.clientTop;
                
                //                ret.x -= par.clientLeft;
                //                ret.y -= par.clientTop;
                
                //                ret.x -= math.Number.parse(style.paddingLeft, 0);
                //                ret.y -= math.Number.parse(style.paddingTop, 0);

                //                ret.x += math.Number.parse(style.marginLeft, 0);
                //                ret.y += math.Number.parse(style.marginTop, 0);
                
                //                ret.x -= math.Number.parse(style.paddingLeft, 0);
                //                ret.y -= math.Number.parse(style.paddingTop, 0);
                
                //                ret.x -= element.parentElement.offsetLeft;
                //                ret.y -= element.parentElement.offsetTop;
                
                //                ret.x -= element.parentElement.clientLeft;
                //                ret.y -= element.parentElement.clientTop;
            }

            return ret;
        }

        public static correctWebkitOffset(element: HTMLElement, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            var par = this.extractOffsetParentReal(element);

            if (par == element.offsetParent)
                return ret;

            var style = window.getComputedStyle(element);
            var parentStyle = window.getComputedStyle(element.parentElement);
            var parStyle = par ? window.getComputedStyle(par) : null;
            var forceAbsolute = style.position == "fixed" && !this.isFixed(element);

            //            console.log("AHHH", element);
            
            if (forceAbsolute) {

                //                ret.x -= element.parentElement.clientLeft;
                //                ret.y -= element.parentElement.clientTop;
                //                ret.x -= element.parentElement.offsetLeft;
                //                ret.y -= element.parentElement.offsetTop;

                return ret;
                
                //                ret.x -= element.offsetLeft;
                //                ret.y -= element.offsetTop;
                //                ret.x += element.parentElement.offsetLeft;
                //                ret.y += element.parentElement.offsetTop;
                //                ret.x -= element.parentElement.clientLeft;
                //                ret.y -= element.parentElement.clientTop;
                
                //                ret.x -= element.offsetLeft;
                //                ret.y -= element.offsetTop;
                //                ret.x -= element.clientLeft;
                //                ret.y -= element.clientTop;
                //                
                //                ret.x -= par.offsetLeft;
                //                ret.y -= par.offsetTop;
                //                ret.x -= par.clientLeft;
                //                ret.y -= par.clientTop;
                
                //                ret.x -= element.parentElement.clientLeft;
                //                ret.y -= element.parentElement.clientTop;
                //                ret.x -= element.parentElement.offsetLeft;
                //                ret.y -= element.parentElement.offsetTop;
                
                //                if(this.extractIsFixedRealAsso(element))
                //                {
                //                    console.log(element.id);    
                //                }
                
                return ret;
            }
            else if (style.position == "absolute" && parentStyle.position == "fixed")
                return ret;
            else if (style.position == "fixed" && parentStyle.position == "static")
                return ret;
            else if (style.position == "fixed" && parentStyle.position == "absolute")
                return ret;
            else if (style.position == "fixed" && parentStyle.position == "fixed")
                return ret;


            else if (par && style.position == "absolute") {
                ret.x -= par.clientLeft;
                ret.y -= par.clientTop;
                ret.x += element.offsetParent.clientLeft;
                ret.y += element.offsetParent.clientTop;
            }
            else if (par && style.position == "static" && element.offsetParent == element.parentElement) {
                ret.x -= par.clientLeft;
                ret.y -= par.clientTop;
                ret.x -= math.Number.parse(parStyle.marginLeft, 0);
                ret.y -= math.Number.parse(parStyle.marginTop, 0);
            }
            else if (par && style.position == "static" || style.position == "relative") {
                ret.x -= par.clientLeft;
                ret.y -= par.clientTop;
                ret.x -= par.offsetLeft;
                ret.y -= par.offsetTop;
            }
            else if (par && style.position == "fixed" && !this.isFixed(element)) {
                ret.x -= par.clientLeft;
                ret.y -= par.clientTop;

                if (parentStyle.position != "static") {
                    if (parentStyle.position == "relative" || parentStyle.position == "absolute") {
                        //                        ret.x += math.Number.parse(style.marginLeft, 0);
                        //                        ret.y += math.Number.parse(style.marginTop, 0);
                        //                        ret.x -= math.Number.parse(style.paddingLeft, 0);
                        //                        ret.y -= math.Number.parse(style.paddingTop, 0);
                    }
                    ret.x -= element.parentElement.offsetLeft;
                    ret.y -= element.parentElement.offsetTop;
                }
                else {
                    //                    ret.x -= element.parentElement.offsetLeft;
                    //                    ret.y -= element.parentElement.offsetTop;
                    //                     console.log("AHHH", element);
                    
                    ret.x -= par.offsetLeft;
                    ret.y -= par.offsetTop;
                    
                    //                    console.log(element);
                
                    //                ret.x += math.Number.parse(parentStyle.marginLeft, 0);
                    //                ret.y += math.Number.parse(parentStyle.marginTop, 0);
                
                    //                                ret.x += par.clientLeft;
                    //                                ret.y += par.clientTop;
                
                    //                                ret.x += par.clientLeft;
                    //                                ret.y += par.clientTop;
                
                    //                ret.x -= math.Number.parse(style.paddingLeft, 0);
                    //                ret.y -= math.Number.parse(style.paddingTop, 0);

                    //                                ret.x += math.Number.parse(parentStyle.marginLeft, 0);
                    //                                ret.y += math.Number.parse(parentStyle.marginTop, 0);
                    //                
                    //                                ret.x -= math.Number.parse(style.paddingLeft, 0);
                    //                                ret.y -= math.Number.parse(style.paddingTop, 0);
                
                    //                ret.x -= element.parentElement.offsetLeft;
                    //                ret.y -= element.parentElement.offsetTop;
                
                    //                                ret.x -= element.parentElement.clientLeft;
                    //                                ret.y -= element.parentElement.clientTop;
                    //                    console.log("AAAA", element.id);
                }
            }
            else {
                //                console.log("WEBKIT-NO-BUG", element);
            }
            return ret;
        }
    }
}