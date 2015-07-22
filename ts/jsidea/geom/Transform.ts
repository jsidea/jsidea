interface HTMLElement {
    _node: jsidea.geom.INodeStyle;
}

module jsidea.geom {
    export interface INodeStyle {
        child: INodeStyle;
        parent: INodeStyle;
        offsetParent: INodeStyle;
        parentScroll: INodeStyle;
        element: HTMLElement;
        offsetX: number;
        offsetY: number;
        offsetLeft: number;
        offsetTop: number;
        clientLeft: number;
        clientTop: number;
        isRelative: boolean;
        isAbsolute: boolean;
        isStatic: boolean;
        isScrollable: boolean;
        isFixed: boolean;
        isSticked: boolean;
        isTransformed: boolean;
        isFixedAssociative: boolean;
        isFixedToAbsolute: boolean;
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
            var position = this.getPosition(node);

            //append the offset to the transform-matrix
            matrix.appendPositionRaw(position.x, position.y, 0);
            
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

        public static extractStyleChain(element: HTMLElement, root: HTMLElement = null): INodeStyle {
            //collect computed styles/nodes up to html/root (including html/root)
            root = root ? root : document.body;//document.body.parentElement
            var lastNode: INodeStyle = null;
            var leaf: INodeStyle = null;
            while (element && element != root.parentElement) {
                var style = window.getComputedStyle(element);
                var node: INodeStyle = {
                    element: element,
                    style: style,
                    parent: null,
                    offsetParent: null,
                    parentScroll: null,
                    child: lastNode,
                    offsetX: 0,
                    offsetY: 0,
                    isFixed: style.position == "fixed",
                    isRelative: style.position == "relative",
                    isAbsolute: style.position == "absolute",
                    isStatic: style.position == "static",
                    isScrollable: style.position != "visible",
                    isSticked: false,
                    isFixedAssociative: false,
                    isFixedToAbsolute: false,
                    offsetLeft: element.offsetLeft,
                    offsetTop: element.offsetTop,
                    clientLeft: element.clientLeft,
                    clientTop: element.clientTop,
                    isTransformed: style.transform != "none"
                };

                //for better handling
                //TODO: garbage collection
                element._node = node;
                if (!leaf)
                    leaf = node;
                //bind nodes from child to parent
                if (lastNode)
                    lastNode.parent = node;
                lastNode = node;
                element = element.parentElement;
            }

            //set "isFixed" and "isFixedToAbsolut"
            node = leaf;
            while (node) {
                node.isSticked = this.getIsSticked(node);
                node.isFixedToAbsolute = node.isFixed && !node.isSticked;
                node = node.parent;
            }

            //set "isFixedAssociative"
            //the "isFixed" properties need to be set before
            //so this is a antoher loop/path
            node = leaf;
            while (node) {
                node.isFixedAssociative = this.getIsFixedAssociative(node);
                node.offsetParent = this.getParentOffset(node);
                node.parentScroll = this.getParentScroll(node);
                node = node.parent;
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

                if (node && node.isSticked) {
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

        //returns the local position the direct parent
        private static getPosition(node: INodeStyle): geom.Point2D {
            var off = this.getOffset(node);
            if (node.isSticked)
                return off;
            var off2 = this.getOffset(node.parent ? node.parent : null);
            return off.sub(off2);
        }
        
        //TEST-AREA
        private static getParentOffset(node: INodeStyle): INodeStyle {
            if (!node || node.element == document.body)// || node.element == document.body.parentElement)
                return null;

            //            if (node.isFixed)
            if (node.isSticked)// || node.isFixed)
                return null;

            while (node = node.parent) {
                if (!node.isStatic || node.isTransformed)
                    return node;
            }

            return null;
        }

        private static getParentScroll(node: INodeStyle): INodeStyle {
            if (!node || !node.parent || node.element == document.body.parentElement)
                return null;

            if (node.isSticked) {
                //                if (node.isFixed) {
                //                console.log("IS REALLY FIXED", node.element);
                return null;
            }

            var excludeStaticParent = node.isAbsolute;
            var leaf: INodeStyle = node;

            node = node.parent;

            var scrollParent: INodeStyle = null;
            while (node) {
                if (excludeStaticParent && node.isStatic && !node.isTransformed) {

                }
                else if (node.isScrollable) {
                    scrollParent = node;
                    break;
                }
                node = node.parent;
            }

            scrollParent = !scrollParent ? null : scrollParent;
            //            if (leaf.isFixedToAbsolute) {
            //                if (leaf.parent.isFixed)
            //                    return scrollParent;
            //                else {
            //                    var z = this.getParentScroll(scrollParent);
            //                    return z ? z.parent : null;
            //                }
            //            }
            return scrollParent;
        }

        private static getIsFixedAssociative(node: INodeStyle): boolean {
            //            if (this.isIE)
            //                return node.isSticked;

            while (node) {
                if (node.isSticked)
                    return true;
                node = node.parent;
            }
            return false;
        }

        private static getIsSticked(node: INodeStyle): boolean {
            //just skip if the element itself has not fixed
            if (!node.isFixed)
                return false;
            
            //ie does it right
            if (this.isIE)
                return node.isFixed;

            while (node = node.parent) {
                //                if (!node.isStatic || node.isTransformed)
                if (node.isTransformed)// || node.isFixed)
                    return false;
            }
            return true;
        }
        
        //FOR WEBKIT AND IE11 (MAYBE firefox too)
        private static getScrollOffset(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.parent)
                return ret;

            //skip body 
            //the body scroll is only needed for element which are fixed to window
            //so this value is added add the getOffset-function
            while ((node = node.parentScroll) && node.element != document.body) {
                ret.x += node.element.scrollLeft;
                ret.y += node.element.scrollTop;
            }
            return ret;
        }

        public static getOffset(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            ret.x = 0;
            ret.y = 0;

            if (!node) {

                return ret;
            }

            //if you subtract the scroll from the accumlated/summed offset
            //you get the real offset to window (initial-containing-block)
            var sc = this.getScrollOffset(node);
            ret.x -= sc.x;
            ret.y -= sc.y;            

            //add scroll value only if reference of the element is the window not the body
            if (node.isFixedAssociative) {
                if (this.isWebkit) {
                    ret.x += document.body.scrollLeft;
                    ret.y += document.body.scrollTop;
                }
                else if (this.isFirefox) {
                    ret.x += document.documentElement.scrollLeft;
                    ret.y += document.documentElement.scrollTop;
                }
                else if (this.isIE) {
                    ret.x += document.documentElement.scrollLeft;
                    ret.y += document.documentElement.scrollTop;
                }
            }
            
            //if is really fixed, then just make it fast
            //wow, and the offsets are correct
            //if the element is really fixed
            if (node.isSticked) {
                //            if (node.isFixed) {
                ret.x += node.offsetLeft;
                ret.y += node.offsetTop;

                this.getOffsetCorrection(node, ret);
                
                //set for easy access
                node.offsetX = ret.x;
                node.offsetY = ret.y;
                return ret;
            }

            var leaf = node;
            while (node) {
                ret.x += node.offsetLeft;
                ret.y += node.offsetTop;
                
                //for webkit (if there is a wrong offserParent set,
                //then the offsets are also wrong... arghhh)
                //correct them here
                this.getOffsetCorrection(node, ret);

                //go up to parentOffset and subtract its borderLeft/clientLeft and borderTop/clientTop
                //                var par = node.offsetParent;
                //                ret.x += par ? par.clientLeft : 0;
                //                ret.y += par ? par.clientTop : 0;
                
                node = node.offsetParent;
            }

            //set for easy access
            leaf.offsetX = ret.x;
            leaf.offsetY = ret.y;

            return ret;
        }

        private static getOffsetCorrection(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (this.isWebkit) {
                this.correctWebkitOffset(node, ret);
            } else if (this.isFirefox) {
                this.correctFirefoxOffset(node, ret);
            } else if (this.isIE) {
                this.correctIEOffset(node, ret);
            }
            return ret;
        }

        private static correctIEOffset(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.offsetParent)
                return ret;
            ret.x += node.offsetParent.clientLeft;
            ret.y += node.offsetParent.clientTop;
        }

        private static correctWebkitOffset(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.offsetParent)
                return ret;
            //            ret.x += node.offsetParent.clientLeft;
            //            ret.y += node.offsetParent.clientTop;
            
            //            if(node.element.id == "c-cont")
            //            {
            //                ret.x += node.parent.clientLeft;
            //                ret.y += node.parent.clientTop;    
            //            }
            
            //            if(node.isStatic)// && node.parent.isFixed)// && node.offsetParent.element == node.element.offsetParent)
            //            {
            //                ret.x += node.parent.clientLeft;
            //                ret.y += node.parent.clientTop;            
            //            }
            
            
            if (node.offsetParent.element == node.element.offsetParent) {

                if (node.isStatic)// && node.parent.isFixed)// && node.offsetParent.element == node.element.offsetParent)
                {
                    ret.x += node.parent.clientLeft;
                    ret.y += node.parent.clientTop;
                }

                return ret;
            }


            if (!node.element.offsetParent && !node.isStatic) {
                ret.x -= node.offsetParent.offsetLeft;
                ret.y -= node.offsetParent.offsetTop;
            }

            if (!node.element.offsetParent && node.isFixed) {

            }


            return ret;

            //            if (true || node.isFixedToAbsolute) {
            //                var pt = new geom.Point2D(node.offsetLeft, node.offsetTop);
            //                this.correctWebkitOffset(node.offsetParent, pt);
            //                ret.x -= pt.x;
            //                ret.y -= pt.y;
            //            ret.x -= node.offsetParent.clientLeft;
            //            ret.y -= node.offsetParent.clientTop;

            //            if (node.element.id == "a-cont") {
            if (node.isFixedToAbsolute && !node.parent.isFixedToAbsolute) {
                ret.x -= node.parent.offsetLeft;
                ret.y -= node.parent.offsetTop;
            }

            //            if (node.element.id == "c-cont") {
            if (node.isStatic) {
                ret.x += node.parent.clientLeft;
                ret.y += node.parent.clientTop;
            }
            
            //            if (node.element.id == "d-cont") {
            if (node.isFixedToAbsolute && !node.parent.isFixedToAbsolute && node.parent.isStatic) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
                ret.x -= node.offsetParent.offsetLeft;
                ret.y -= node.offsetParent.offsetTop;
                ret.x += math.Number.parse(node.parent.style.paddingLeft, 0);
                ret.y += math.Number.parse(node.parent.style.paddingTop, 0);
            }
            
            //            if (node.isFixedToAbsolute && !node.offsetParent.isFixedToAbsolute) {
            //                ret.x -= node.offsetParent.offsetLeft;
            //                ret.y -= node.offsetParent.offsetTop;
            //            }
            
            return ret;

            var op = <HTMLElement> node.element.offsetParent;
            var z = node.offsetParent;
            while (z && z.element != op) {

                //                var pt = new geom.Point2D(z.offsetLeft, z.offsetTop);
                //                this.correctWebkitOffset(z, pt);
                //                ret.x -= pt.x;
                //                ret.y -= pt.y;
                //                ret.x -= z.clientLeft;
                //                ret.y -= z.clientTop;
                    
                //                    ret.x -= z.offsetLeft;
                //                    ret.y -= z.offsetTop;
                    
                z = z.offsetParent;
            }
                
            //                //                                ret.x += node.offsetParent.offsetLeft;
            //                //                                ret.y += node.offsetParent.offsetTop;
            //            }
            //            else {
            //                //                console.log(node);    
            //            }
            //            if (!node.isFixedToAbsolute) {
            //                ret.x -= node.offsetParent.clientLeft;
            //                ret.y -= node.offsetParent.clientTop;
            //            }
            //                node.offsetParent = null;
            //            }
            
            //            return ret;
            


            //            if (node.isAbsolute && node.offsetParent) {
            //                ret.x -= node.offsetParent.clientLeft;
            //                ret.y -= node.offsetParent.clientTop;
            //            }


            if (node.isFixedToAbsolute) {
                ret.x -= node.offsetParent.clientLeft;
                ret.y -= node.offsetParent.clientTop;
                if (!node.parent.isStatic) {
                    ret.x -= node.parent.offsetLeft;
                    ret.y -= node.parent.offsetTop;
                }
                else {
                    //                    if (node.parentOffset.isTransformed) {
                    ret.x -= node.offsetParent.offsetLeft;
                    ret.y -= node.offsetParent.offsetTop;
                    //                    }
                }
                //                ret.x += node.parentOffset.clientLeft;
                //                ret.y += node.parentOffset.clientTop;
                return ret;
            }
            else if (node.isAbsolute && node.parent.isFixed)
                return ret;
            else if (node.isFixed && node.parent.isStatic)
                return ret;
            else if (node.isFixed && node.parent.isAbsolute)
                return ret;
            else if (node.isFixed && node.parent.isFixed)
                return ret;
            else if (node.offsetParent && node.isAbsolute) {
                ret.x -= node.offsetParent.clientLeft;
                ret.y -= node.offsetParent.clientTop;
                ret.x += node.element.offsetParent.clientLeft;
                ret.y += node.element.offsetParent.clientTop;
            }
            else if (node.offsetParent && node.isStatic || node.isRelative) {
                ret.x -= node.offsetParent.clientLeft;
                ret.y -= node.offsetParent.clientTop;
                ret.x -= node.offsetParent.offsetLeft;
                ret.y -= node.offsetParent.offsetTop;
            }
            else if (node.offsetParent && node.isStatic && node.element.offsetParent == node.element.parentElement) {
                ret.x -= node.offsetParent.clientLeft;
                ret.y -= node.offsetParent.clientTop;
                ret.x -= math.Number.parse(node.parent.style.marginLeft, 0);
                ret.y -= math.Number.parse(node.parent.style.marginTop, 0);
            }
            else {
                //console.log("WEBKIT-NO-BUG", element);
            }
            return ret;
        }

        private static correctFirefoxOffset(node: INodeStyle, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (node.offsetParent && node.isAbsolute) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }
            else if (node.parent && node.isFixed && node.parent.isFixed) {
                ret.x -= node.parent.offsetLeft;
                ret.y -= node.parent.offsetTop;
                ret.x -= node.parent.clientLeft;
                ret.y -= node.parent.clientTop;
            }
            //else if (node.parentOffset && node.parent && node.isFixed && !node.isSticked) {
            else if (node.offsetParent && node.parent && node.isFixedToAbsolute) {

                if (node.parent.isRelative || node.parent.isAbsolute) {
                    ret.x -= node.parent.offsetLeft;
                    ret.y -= node.parent.offsetTop;
                    ret.x -= node.parent.clientLeft;
                    ret.y -= node.parent.clientTop;
                }
                else if (node.parent != node.offsetParent && node.offsetParent.isStatic) {
                    ret.x += node.offsetParent.clientLeft;
                    ret.y += node.offsetParent.clientTop;
                }
            }
            else {
                //console.log("FIREFOX-NO-BUG", element);
            }
            return ret;
        }
    }
}