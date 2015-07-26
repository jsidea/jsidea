interface Element {
    _node: jsidea.layout.INode;
}
module jsidea.layout {
    export interface INode {
        style: CSSStyleDeclaration;
        element: HTMLElement;
        offsetParent: INode;
        offsetParentRaw: INode;
        parentScroll: INode;
        root: INode;
        isLeaf: boolean;
        child: INode;
        parent: INode;
        relation: INode;
        depth: number;
        offset: geom.Point2D;
        //offset - scroll 
        offsetUnscrolled: geom.Point2D;
        position: geom.Point2D;
        scrollOffset: geom.Point2D;
        offsetLeft: number;
        offsetTop: number;
        clientLeft: number;
        clientTop: number;
        paddingLeft: number;
        paddingTop: number;
        isRelative: boolean;
        isAbsolute: boolean;
        isStatic: boolean;
        isScrollable: boolean;
        isFixed: boolean;
        isFixedChild: boolean;
        isFixedWrong: boolean;
        isBody: boolean;
        isSticked: boolean;
        isStickedChild: boolean;
        isTransformed: boolean;
        isTransformedChild: boolean;
        isPerspectiveChild: boolean;
        perspective: number;
        isPreserved3dFixed: boolean;
        isPreserved3d: boolean;
        isBorderBox: boolean;
        isAccumulatable: boolean;
    }

    export class StyleChain {

        public node: INode = null;

        constructor() {
        }

        public static create(element: HTMLElement): StyleChain {
            var chain = new StyleChain();
            chain.update(element);
            return chain;
        }

        public update(element: HTMLElement): StyleChain {
            if (!element)
                return this.clear();
            this.node = StyleChain.extractStyleChain(element);
        }

        public clear(): StyleChain {
            this.node = null;
            return this;
        }

        public static qualifiedClassName(): string {
            return "jsidea.layout.StyleChain";
        }

        public toString(): string {
            return "[" + StyleChain.qualifiedClassName() + "]";
        }

        private static extractStyleChain(element: HTMLElement): INode {
            //collect computed styles/nodes up to html/root (including html/root)
            var root = document.body;

            //TODO: what about HTML-element ownerDocument.documentElement
            if (element == root.parentElement)
                return null;
            
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
            var nodes: INode[] = [];
            var isTransformedChild = false;
            var isPreserved3dChild = false;
            var l = elements.length;
            var isFixed = false;
            var isPerspectiveChild = false;
            for (var i = l - 1; i >= 0; --i) {
                element = elements[i];

                var style = window.getComputedStyle(element);

                var perspective = math.Number.parse(style.perspective, 0);
                
                //webkit ignores perspective set on scroll elements
                if (system.Caps.isWebkit && style.transform != "none" && style.overflow != "visible" && style.perspective != "none")
                    perspective = 0;

                var isPreserved3d = (style.transformStyle == "preserve-3d" || perspective > 0);
                //                    || (system.Caps.isWebkit && element.id == "b-cont")
                //                    || (system.Caps.isWebkit && element.id == "a-cont")
                //                    || (system.Caps.isWebkit && element.id == "content")
                //                    || (system.Caps.isWebkit && element.id == "view")
                ;
                if (system.Caps.isFirefox) {
                    //                    if (preserved3d && style.position == "fixed") {
                    //                        //make the element a containing-block
                    //                        element.style.position = "absolute";
                    //                        
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Fixed to absolute. Fixed in a 3d-context becomes absolute positioned.");
                    //                    }
                    
                    //                    if (style.display == "inline" && !(style.perspective == "none" && style.transform == "none")) {
                    //                        //make the element a containing-block
                    //                        element.style.perspective = "none";
                    //                        element.style.transform = "none";
                    //                        
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Inline elements cannot not have transform applied.");
                    //                    }
                    
                    //                    if (style.transform != "none" && (style.position == "static" || style.position == "auto")) {
                    //                        //make static relative
                    //                        //do it in this order should
                    //                        //prevent re-layouting
                    //                        element.style.left = "auto";
                    //                        element.style.top = "auto";
                    //                        element.style.position = "relative";
                    //                    
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Transform on static element. Element becomes relative and top/left becomes auto.");
                    //                    }
                    
                    //                    if (style.transform != "none" && (style.position == "static" || style.position == "auto")) {
                    //                        //make static relative
                    //                        //do it in this order should
                    //                        //prevent re-layouting
                    //                        element.style.left = "auto";
                    //                        element.style.top = "auto";
                    //                        element.style.position = "relative";
                    //                    
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Transform on static element. Element becomes relative and top/left becomes auto.");
                    //                    }

                    //                    if (isFixed && style.position == "fixed") {
                    //                        //make the element a containing-block
                    //                        element.style.position = "absolute";
                    //                                            
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Fixed to absolute. Fixed in a fixed container.");
                    //                    }
                }
                //webkit bugfix 
                if (system.Caps.isWebkit) {
                    //                    if ((perspective || style.transformStyle == "preserve-3d") && style.transform == "none") {
                    //                        //webkit bug with offset 100000
                    //                        //Fixed elements as an anchestor of an preserve-3d elemenent
                    //                        //without transform set
                    //                        //if preserve-3d is set 
                    //                        //and transform is not set
                    //                        //than it becomes very strange
                    //                        //this parent element with
                    //                        //make the element a containing-block
                    //                        element.style.transform = "translateX(0)";
                    //                        
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Preserve-3d without transform. Transform set to \"translateX(0)\".");
                    //                    }
                    //                    if (preserved3d && style.position == "fixed") {
                    //                        //make the element a containing-block
                    //                        element.style.position = "absolute";
                    //                        
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Fixed position on element in 3d-context. Set from fixed to absolute.");
                    //                    }
                    
                    //COMMENT IN IF NEEDED
                    //                    if (style.transform != "none" && (style.position == "static" || style.position == "auto")) {
                    //                        //make static relative
                    //                        //do it in this order should
                    //                        //prevent re-layouting
                    //                        element.style.left = "auto";
                    //                        element.style.top = "auto";
                    //                        element.style.position = "relative";
                    //                    
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Transform on static element. Element becomes relative and top/left becomes auto.");
                    //                    }
                    //                    else if (isTransformedChild && style.position == "fixed") {
                    //                    if (isTransformedChild && style.position == "fixed") {
                    //                        //webkit ignores fixed elements in an transformed context
                    //                        //making them absolute does not change anything visual
                    //                        //but the offsets and so on becomes correct
                    //                        element.style.position = "absolute";
                    //                        
                    //                        //refresh style
                    //                        style = window.getComputedStyle(element);
                    //                        console.warn("FIXED: Fixed to absolute. Fixed in a fixed container");
                    //                    }
                }
                
                

                //create the node-element
                //and set so many values as possible
                var node: INode = {
                    depth: nodes.length,
                    element: element,
                    isPreserved3d: style.transformStyle == "preserve-3d",
                    isPreserved3dFixed: isPreserved3d,
                    style: style,
                    root: null,
                    relation: null,
                    parent: null,
                    offsetParent: null,
                    offsetParentRaw: null,
                    parentScroll: null,
                    position: null,
                    child: null,
                    isAccumulatable: true,
                    perspective: perspective,
                    isPerspectiveChild: isPerspectiveChild,
                    offset: null,
                    offsetUnscrolled: null,
                    scrollOffset: null,
                    isFixed: style.position == "fixed",
                    isFixedWrong: false,
                    isLeaf: element.children.length == 0,
                    isFixedChild: isFixed,
                    isRelative: style.position == "relative",
                    isAbsolute: style.position == "absolute",
                    isStatic: style.position == "static",
                    isScrollable: style.overflow != "visible",
                    isBorderBox: style.boxSizing == "border-box",
                    isBody: element == document.body,
                    isSticked: false,
                    isStickedChild: false,
                    paddingLeft: math.Number.parse(style.paddingLeft, 0),
                    paddingTop: math.Number.parse(style.paddingTop, 0),
                    offsetLeft: element.offsetLeft,
                    offsetTop: element.offsetTop,
                    clientLeft: element.clientLeft,
                    clientTop: element.clientTop,
                    isTransformed: style.transform != "none",
                    isTransformedChild: isTransformedChild
                };
                
                //if the element has transform
                //the following elements are in transformed-context
                if (!isTransformedChild && node.isTransformed)
                    isTransformedChild = true;

                if (!isFixed && node.isFixed)
                    isFixed = true;

                if (!isPreserved3dChild && node.isPreserved3dFixed)
                    isPreserved3dChild = true;

                if (!isPerspectiveChild && node.perspective > 0)
                    isPerspectiveChild = true;

                element._node = node;
                
                //the lookup should be sorted from root to child
                //NOT vice versa
                nodes.push(node);
            }
            
            //set "isFixed" and "isFixedToAbsolut"
            var rootNode = nodes[0];
            var leafNode = nodes[nodes.length - 1];
            
            //set the references and some properties
            //be careful that the functions
            //do not need the node-properties
            //which are not already set
            node = rootNode;
            while (node) {
                //the node references
                node.root = rootNode;
                node.parent = nodes[node.depth - 1];
                node.child = nodes[node.depth + 1];
                node.offsetParentRaw = node.element.offsetParent ? node.element.offsetParent._node : null;
                node.isSticked = this.getIsSticked(node);
                //                if (node.isSticked)
                //                    console.log("NODE IS STICKED", node.element.id);
                node.isFixedWrong = node.isFixed && !node.isSticked;
                node.isStickedChild = this.getIsStickedChild(node);
                node.offsetParent = this.getOffsetParent(node);
                node.parentScroll = this.getParentScroll(node);
                node.isAccumulatable = this.getIsAccumulatable(node);
                node.scrollOffset = this.getScrollOffset(node);
                node.relation = this.getRelation(node);
                node.offset = this.getOffset(node);
                node.offsetUnscrolled = new geom.Point2D(node.offset.x + node.scrollOffset.x, node.offset.y + node.scrollOffset.y);
                node.position = this.getPosition(node);

                node = node.child;
            }

            return leafNode;
        }

        //returns the local position the direct parent
        private static getPosition(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (node.isSticked || node.isBody)
                return ret.setTo(node.offset.x, node.offset.y);
            return ret.setTo(node.offset.x - node.parent.offset.x, node.offset.y - node.parent.offset.y);
        }

        
        
        //TEST-AREA
        private static getOffsetParent(node: INode): INode {
            //            if (system.Caps.isFirefox)
            //                return node.element.offsetParent ? node.element.offsetParent._node : null;

            var isTransformedChild = node.isTransformedChild;

            //if its forced to have another parent
            if (node.isFixedWrong) {
                while (node = node.parent) {
                    if (node.isBody || node.isSticked)//isSticked is maybe to mouch
                        return node;
                    if (node.isStatic) {
                        if (node.isTransformed || node.isPreserved3dFixed)
                            return node;
                        else
                            continue;
                    }
                    //that is the trick
                    //if the element itself is wrongyl-fixed
                    //than this could not be the offset
                    if (node.isFixedWrong && !node.isTransformed && !node.isPreserved3dFixed) {
                        continue;
                    }
                    return node;
                }
                return null;
            }

            if (!node || node.isBody || node.isSticked)
                return null;
            while (node = node.parent) {
                if (!node.isStatic || node.isTransformed || node.isPreserved3dFixed || node.isSticked)//isSticked is maybe to mouch
                {
                    return node;
                }
            }
            return null;
        }

        private static getOffsetParent_BACKUP(node: INode): INode {

            if (system.Caps.isFirefox)
                return node.element.offsetParent ? node.element.offsetParent._node : null;

            if (!node || node.isBody || node.isSticked)
                return null;
            while (node = node.parent) {
                if (!node.isStatic || node.isTransformed || node.isPreserved3dFixed)// || (isFixed && node.isFixed))
                {
                    return node;
                }
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
            var excludeStaticParent = node.isAbsolute && !node.isTransformedChild;
            var leafNode: INode = node;

            //the first possible parent-scroll element is the direct parent
            node = node.parent;

            while (node) {
                //when can you skip it
                if (excludeStaticParent && node.isStatic && !node.isTransformed) {// && !node.isPreserved3d) {

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

        private static getIsStickedChild(node: INode): boolean {
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
            if (system.Caps.isIE)
                return node.isFixed;

            while (node = node.parent) {
                if (node.isTransformed || node.isPreserved3dFixed)
                    return false;
            }
            return true;
        }

        //if you subtract the scroll from the accumlated/summed offset
        //you get the real offset to window (initial-containing-block)
        private static getScrollOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.parent)
                return ret;
            
            //add scroll value only if reference of the element is the window not the body
            if (node.isStickedChild) {
                if (system.Caps.isWebkit) {
                    ret.x -= document.body.scrollLeft;
                    ret.y -= document.body.scrollTop;
                }
                else {
                    ret.x -= document.documentElement.scrollLeft;
                    ret.y -= document.documentElement.scrollTop;
                }
            }

            //skip body 
            //the body scroll is only needed for element which are fixed to window
            //so this value is added add the getOffset-function
            while ((node = node.parentScroll) && node.element != document.body) {
                ret.x += node.element.scrollLeft;
                ret.y += node.element.scrollTop;
            }
            return ret;
        }

        private static getOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            ret.x = 0;
            ret.y = 0;

            //the offset of void/null is 0 0
            if (!node)
                return ret;

            ret.x -= node.scrollOffset.x;
            ret.y -= node.scrollOffset.y;
            
            //if is really fixed, then just make it fast
            //wow, and the offsets are correct
            //if the element is really fixed
            if (node.isSticked) {
                this.getCorrectOffset(node, ret);
                return ret;
            }

            var leafNode = node;
            while (node) {
                //for webkit (if there is a wrong offserParent set,
                //then the offsets are also wrong... arghhh)
                //correct them here
                this.getCorrectOffset(node, ret);
                //                node = node.offsetParentRaw;
                if (system.Caps.isWebkit && !node.offsetParentRaw)
                    break;
                node = node.offsetParent;
            }
            return ret;
        }

        private static getCorrectOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node)
                return ret;

            ret.x += node.offsetLeft;
            ret.y += node.offsetTop;

            if (system.Caps.isWebkit) {
                this.correctWebkitOffset(node, ret);
            } else if (system.Caps.isFirefox) {
                this.correctFirefoxOffset(node, ret);
            } else if (system.Caps.isIE) {
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

        private static correctFirefoxOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            //no node no value
            if (!node)
                return ret;

            if (!node.offsetParent) {
                if (node.isStatic) {
                    ret.x += node.root.clientLeft;
                    ret.y += node.root.clientTop;
                }
                return ret;
            }

            if (!node.isBorderBox) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }

            if (
                (node.isAbsolute || (node.isFixedWrong))
                && node.offsetParent.isScrollable
                ) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }
            
            //if there is not bug to fix
            if (node.offsetParent.element == node.element.offsetParent)
                return ret;
            
            //this should not happen at all
            console.warn("The given offsetParent is maybe wrong.");

            return ret;
        }

        private static getRelation(node: INode): INode {
            if (!node.parent || node.isSticked)
                return null;
            while (node = node.parent) {
                if (node.isPreserved3d || node.isTransformed) {
                    //                    if(node.isStatic)
                    //                        continue;
                    return node;
                }
            }
            return null;
        }

        private static correctWebkitOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.offsetParent)
                return ret;

            //Why is chrome does not keep care of css-transform on static elements
            //when it comes to the right offsetParent and the offsetTop/offsetLeft values
            if (node.offsetParentRaw != node.offsetParent) {
                //console.warn("The given offsetParent is maybe wrong.");
                
                //trivial if there is a missing offsetParentRaw
                //than just add the already calculated "correct" offset here
                //that is possible because the calculation runs from body -> root
                //the offset sum calculation stops for webkit if the 
                //parentOffsetRaw is null
                //so we have to return the full-offset
                if (!node.offsetParentRaw) {
                    //&& node.isScrollable
                    //                    if ((node.relation.isFixedWrong && !node.parent.isScrollable && node.isTransformed && node.parent.isPreserved3d && !node.isLeaf)) {
                    //                        ret.x += node.parent.offsetLeft;
                    //                        ret.y += node.parent.offsetTop;
                    //                        return ret;
                    //                    }
//                    if (node.element.id == "c-cont") {
                      if (!node.parent.isTransformed && !node.relation.isStatic) {
                        ret.x += node.relation.offsetLeft;
                        ret.y += node.relation.offsetTop;
//                        console.log("---");
//                          console.log(node.element.id);
//                        console.log(node.relation.element.id);
//                        console.log(node.relation.relation.element.id);
                        return ret;
                    }
                    ret.x += node.relation.offsetUnscrolled.x;
                    ret.y += node.relation.offsetUnscrolled.y;
                }
                else {
                    if (node.isBody || (node.isAbsolute && node.offsetParentRaw.isBody)) {
                    }
                    else {
                        //                        if (node.isAbsolute && node.offsetParent == node.parent && node.parent.isTransformed) {
                        if (node.isAbsolute && node.offsetParent == node.parent && (node.parent.isStatic && !node.parent.isPreserved3dFixed)) {//preserved3d is maybe to much
                            ret.x += node.offsetParentRaw.clientLeft;
                            ret.y += node.offsetParentRaw.clientTop;
                        }
                        else {
                            //offset without scroll
                            //the scroll value is already applied or will be applied
                            //for the target node
                            ret.x -= node.offsetParent.offsetUnscrolled.x - node.offsetParentRaw.offsetLeft;
                            ret.y -= node.offsetParent.offsetUnscrolled.y - node.offsetParentRaw.offsetTop;
                            ret.x += node.offsetParentRaw.clientLeft;
                            ret.y += node.offsetParentRaw.clientTop;
                        }
                    }
                }
            }
            else {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }

            return ret;
        }

        private static getIsAccumulatable(node: INode): boolean {
            //in any case, if an element has only 2d-transforms or its the document-root item
            //the transform can be accumulated to the parent transform
            if (node.isBody || node.style.transform.indexOf("matrix3d") < 0)
                return true;

            var parent = node.parent;
            //tricky stuff: only firefox does reflect/compute the "correct" transformStyle value.
            //Firefox does NOT reflect the "grouping"-overrides and this is how its concepted.
            //But what about the "opacity"-property. Opacity does not override the preserve-3d (not always, webkit does under some conditions).
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if (parent.style.transformStyle == "flat" || parent.isScrollable)
                return false;

            return true;
        }
    }
}