interface HTMLElement {
    _node: jsidea.geom.INode;
}

module jsidea.geom {
    export interface INode {
        child: INode;
        parent: INode;
        root: INode;
        leaf: INode;
        index: number;
        offsetParent: INode;
        parentScroll: INode;
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
        isBody: boolean;
        isSticked: boolean;
        isTransformed: boolean;
        isTransformedAssociative: boolean;
        isStickedAssociative: boolean;
        isFixedToAbsolute: boolean;
        style: CSSStyleDeclaration;
        lookup: INode[];
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

        private static extractMatrix(node: INode, matrix: geom.Matrix3D = null): geom.Matrix3D {
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

        public static extractStyleChain(element: HTMLElement, root: HTMLElement = null): INode {
            //collect computed styles/nodes up to html/root (including html/root)
            root = root ? root : document.body;
            
            //collect from child to root
            var elements: HTMLElement[] = [];
            while (element && element != root.parentElement) {
                elements.push(element);
                element = element.parentElement;
            }
            
            //run from root to child
            //this should prevent that if the parent element
            //has the webkit-bug and an element changed
            //from static to relative position
            //the offsets of the possible children are wrong
            //and this order prevents it (root to child)
            var lookup: INode[] = [];
            var isTransformedAssociative = false;
            var l = elements.length;
            for (var i = l - 1; i >= 0; --i) {
                element = elements[i];

                var style = window.getComputedStyle(element);
                
                //webkit bugfix 
                if (this.isWebkit) {

                    if (style.transformStyle == "preserve-3d" && style.transform == "none") {
                        //webkit bug with offset 100000
                        //Fixed elements as an anchestor of an preserve-3d elemenent
                        //without transform set
                        //if preserve-3d is set 
                        //and transform is not set
                        //than it becomes very strange
                        //this parent element with

                        //make the element a containing-block
                        element.style.transform = "translateX(0)";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                    }
                    if (style.transform != "none" && (style.position == "static" || style.position == "auto")) {
                        //make static relative
                        //do it in this order should
                        //prevent re-layouting
                        element.style.left = "auto";
                        element.style.top = "auto";
                        element.style.position = "relative";
                    
                        //refresh style
                        style = window.getComputedStyle(element);
                    }
                    else if (isTransformedAssociative && style.position == "fixed") {
                        //webkit ignores fixed elements in an transformed context
                        //making them absolute does not change anything visual
                        //but the offsets and so on becomes correct
                        element.style.position = "absolute";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                    }
                }

                //create the node-element
                //and set so many values as possible
                var node: INode = {
                    index: lookup.length,
                    lookup: lookup,
                    element: element,
                    style: style,
                    parent: null,
                    offsetParent: null,
                    parentScroll: null,
                    child: null,
                    root: null,
                    leaf: null,
                    offsetX: 0,
                    offsetY: 0,
                    isFixed: style.position == "fixed",
                    isRelative: style.position == "relative",
                    isAbsolute: style.position == "absolute",
                    isStatic: style.position == "static",
                    isScrollable: style.overflow != "visible",
                    isBody: element == document.body,
                    isSticked: false,
                    isStickedAssociative: false,
                    isFixedToAbsolute: false,
                    offsetLeft: element.offsetLeft,
                    offsetTop: element.offsetTop,
                    clientLeft: element.clientLeft,
                    clientTop: element.clientTop,
                    isTransformed: style.transform != "none",
                    isTransformedAssociative: isTransformedAssociative
                };
                
                //if the element has transform
                //the following elements are in transformed-context
                if (!isTransformedAssociative && style.transform != "none")
                    isTransformedAssociative = true;

                //for better handling
                //TODO: garbage collection
                element._node = node;

                //the lookup should be sorted from root to child
                //NOT vice versa
                lookup.push(node);
            }
            
            //set "isFixed" and "isFixedToAbsolut"
            var rootNode = lookup[0];
            var leafNode = lookup[lookup.length - 1];
            
            //set the references and some properties
            //be careful the the functions
            //do not need the node-properties
            //which are not already set
            node = leafNode;
            while (node) {
                //the node references
                node.root = rootNode;
                node.leaf = leafNode;
                node.parent = lookup[node.index - 1];
                node.child = lookup[node.index + 1];

                node.isSticked = this.getIsSticked(node);
                node.isFixedToAbsolute = node.isFixed && !node.isSticked;
                node = node.parent;
            }

            //set "isFixedAssociative"
            //the "isFixed" properties need to be set before
            //so this is a antoher loop/path
            node = leafNode;
            while (node) {
                node.isStickedAssociative = this.getIsStickedAssociative(node);
                node.offsetParent = this.getParentOffset(node);
                node.parentScroll = this.getParentScroll(node);
                node = node.parent;
            }

            return leafNode;
        }

        private static extractAccumulatedMatrices(node: INode): geom.Matrix3D[] {
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

        private static isAccumulatable(node: INode): boolean {
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
        private static getPosition(node: INode): geom.Point2D {
            var off = this.getOffset(node);
            if (node.isSticked)
                return off;
            var off2 = this.getOffset(node.parent ? node.parent : null);
            return off.sub(off2);
        }
        
        //TEST-AREA
        private static getParentOffset(node: INode): INode {
            if (!node || node.isBody)// || node.element == document.body.parentElement)
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

        private static getParentScroll(node: INode): INode {
            //important: if the node is really sticked, then there could not be any scrolling
            if (!node || node.isSticked || !node.parent)
                return null;

            //this makes the trick
            //if the element is in an transform-context
            //the parent cannot be skipped by only evaluating
            //the position value only
            var excludeStaticParent = node.isAbsolute && !node.isTransformedAssociative;
            var leafNode: INode = node;

            //            if (node.isStatic)
            //                node = node.offsetParent;
            //            else
            node = node.parent;

            while (node) {
                //when can you skip it
                if (excludeStaticParent && node.isStatic && !node.isTransformed) {

                }
                //if the element is really sticked, it cannot not be scrolled up there
                //so stop here
                else if (node.isScrollable || node.isSticked || (node.isAbsolute || node.isFixed)) {
                    return node;
                }
                node = node.parent;
            }

            return null;
        }

        private static getIsStickedAssociative(node: INode): boolean {
            while (node) {
                if (node.isSticked)
                    return true;
                node = node.parent;
            }
            return false;
        }

        private static getIsSticked(node: INode): boolean {
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

        private static getScrollOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
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

        public static getOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            ret.x = 0;
            ret.y = 0;

            //the offset of void/null is 0 0
            if (!node)
                return ret;

            //if you subtract the scroll from the accumlated/summed offset
            //you get the real offset to window (initial-containing-block)
            var sc = this.getScrollOffset(node);
            ret.x -= sc.x;
            ret.y -= sc.y;

            //add scroll value only if reference of the element is the window not the body
            if (node.isStickedAssociative) {
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

            var leafNode = node;
            while (node) {
                ret.x += node.offsetLeft;
                ret.y += node.offsetTop;
                
                //for webkit (if there is a wrong offserParent set,
                //then the offsets are also wrong... arghhh)
                //correct them here
                this.getOffsetCorrection(node, ret);
                node = node.offsetParent;
            }

            //set for easy access
            leafNode.offsetX = ret.x;
            leafNode.offsetY = ret.y;

            return ret;
        }

        private static getOffsetCorrection(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (this.isWebkit) {
                this.correctWebkitOffset(node, ret);
            } else if (this.isFirefox) {
                this.correctFirefoxOffset(node, ret);
            } else if (this.isIE) {
                this.correctIEOffset(node, ret);
            }
            return ret;
        }

        private static correctIEOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.offsetParent)
                return ret;
            ret.x += node.offsetParent.clientLeft;
            ret.y += node.offsetParent.clientTop;
        }

        private static correctWebkitOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node)
                return ret;

            if (!node.offsetParent)
                return;

            if (!node.offsetParent.isStatic) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }

            //if there is not bug to fix
            if (node.offsetParent.element == node.element.offsetParent)
                return ret;
            
            //Why is chrome does not keep care of css-transform on static elements
            //when it comes to the right offsetParent and the offsetTop/offsetLeft
            //values
            console.warn("The given offsetParent is maybe wrong.");
        }

        private static correctFirefoxOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
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