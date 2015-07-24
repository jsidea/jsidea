//interface HTMLElement {
//    _node: jsidea.layout.INode;
//}

module jsidea.layout {
    export interface INode {
        style: CSSStyleDeclaration;
        element: HTMLElement;
        offsetParent: INode;
        parentScroll: INode;
        root: INode;
        child: INode;
        parent: INode;
        depth: number;
        offset: geom.Point2D;
        position: geom.Point2D;
        scrollOffset: geom.Point2D;
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
        isStickedChild: boolean;
        isTransformed: boolean;
        isTransformedChild: boolean;
        hasPerspective: boolean;
        perspective: number;
        isPreserved3d: boolean;
        isBorderBox: boolean;
        isAccumulatable: boolean;
    }

    export class StyleChain {

        public node: INode = null;

        constructor(public element: HTMLElement) {
            this.node = StyleChain.extractStyleChain(element);
        }

        public static create(element: HTMLElement): StyleChain {
            return new StyleChain(element);
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
            var preserved3d = false;
            var l = elements.length;
            var isFixed = false;
            var isInlined = false;
            var hasPerspective = false;
            for (var i = l - 1; i >= 0; --i) {
                element = elements[i];

                var style = window.getComputedStyle(element);

                var perspective = math.Number.parse(style.perspective, 0);
                if (system.Caps.isFirefox) {
                    if (preserved3d && style.position == "fixed") {
                        //make the element a containing-block
                        element.style.position = "absolute";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                        console.warn("FIXED: Fixed to absolute. Fixed in a 3d-context becomes absolute positioned.");
                    }
                    
                    //                        console.log(isInlined);
                    if (style.display == "inline" && !(style.perspective == "none" && style.transform == "none")) {
                        //make the element a containing-block
                        element.style.perspective = "none";
                        element.style.transform = "none";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                        console.warn("FIXED: Inline elements cannot not have transform applied.");
                    }

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
                    if ((perspective || style.transformStyle == "preserve-3d") && style.transform == "none") {
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
                        console.warn("FIXED: Preserve-3d without transform. Transform set to \"translateX(0)\".");
                    }

                    if (preserved3d && style.position == "fixed") {
                        //make the element a containing-block
                        element.style.position = "absolute";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                        console.warn("FIXED: Fixed position on element in 3d-context. Set from fixed to absolute.");
                    }
                    
                    //maybe not the hard way, just check an set the perspective to none (-> 0 here)
                    if (style.transform != "none" && style.overflow != "visible" && style.perspective != "none") {
                        //webkit ignores perspective set on scroll elements
                        //make the element a containing-block
                        //                        element.style.perspective = "none";
                        //                        
                        //                        //refresh style
                        //                        style = window.getComputedStyle(element);
                        //                        console.warn("FIXED: Disable perspective on overflow elements.");
                        
                        perspective = 0;
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
                        console.warn("FIXED: Transform on static element. Element becomes relative and top/left becomes auto.");
                    }
                    else if (isTransformedChild && style.position == "fixed") {
                        //webkit ignores fixed elements in an transformed context
                        //making them absolute does not change anything visual
                        //but the offsets and so on becomes correct
                        element.style.position = "absolute";
                        
                        //refresh style
                        style = window.getComputedStyle(element);
                        console.warn("FIXED: Fixed to absolute. Fixed in a fixed container");
                    }
                }

                //create the node-element
                //and set so many values as possible
                var node: INode = {
                    depth: nodes.length,
                    element: element,
                    isPreserved3d: style.transformStyle == "preserve-3d" || perspective > 0,
                    style: style,
                    root: null,
                    parent: null,
                    offsetParent: null,
                    parentScroll: null,
                    position: null,
                    child: null,
                    perspective: perspective,
                    hasPerspective: hasPerspective,
                    offset: null,
                    scrollOffset: null,
                    isAccumulatable: true,
                    isFixed: style.position == "fixed",
                    isRelative: style.position == "relative",
                    isAbsolute: style.position == "absolute",
                    isStatic: style.position == "static",
                    isScrollable: style.overflow != "visible",
                    isBorderBox: style.boxSizing == "border-box",
                    isBody: element == document.body,
                    isSticked: false,
                    isStickedChild: false,
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

                if (!preserved3d && node.isPreserved3d)
                    preserved3d = true;
                
                if(!hasPerspective && node.perspective > 0)
                    hasPerspective = true;
                
                //                if(!isInlined && node.style.display == "inline")
                //                    isInlined = true;    

                //for better handling
                //TODO: garbage collection
//                element._node = node;

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
                node.isSticked = this.getIsSticked(node);
                node.isStickedChild = this.getIsStickedChild(node);
                node.offsetParent = this.getOffsetParent(node);
                node.parentScroll = this.getParentScroll(node);
                node.isAccumulatable = this.getIsAccumulatable(node);
                node.scrollOffset = this.getScrollOffset(node);
                node.offset = this.getOffset(node);
                node.position = this.getPosition(node);

                node = node.child;
            }

            return leafNode;
        }

        private static getIsAccumulatable(node: INode): boolean {
            return true;
            
            //in any case, if an element has only 2d-transforms or its the document-root item
            //the transform can be accumulated to the parent transform
            if (node.isBody || node.style.transform.indexOf("matrix3d") < 0)
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
            if (preserve3d && parent.isScrollable)
                preserve3d = false;
            
            //there is this case where webkit ignores transform-style: flat. 
            //So when the elements parent has preserve-3d and the element itself has no transform set.
            if (!preserve3d && system.Caps.isWebkit && !parent.isTransformed && !parent.isBody)
                preserve3d = this.getIsAccumulatable(parent.parent);

            return preserve3d;
        }

        //returns the local position the direct parent
        private static getPosition(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (node.isSticked || node.isBody)
                return ret.setTo(node.offset.x, node.offset.y);
            return ret.setTo(node.offset.x - node.parent.offset.x, node.offset.y - node.parent.offset.y);
        }
        
        //TEST-AREA
        private static getOffsetParent(node: INode): INode {
            if (!node || node.isBody || node.isSticked)
                return null;

            while (node = node.parent) {
                if (!node.isStatic || node.isTransformed || node.isPreserved3d)
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
                if (node.isTransformed || node.isPreserved3d)
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
                //hmmmm
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
                node.isAbsolute
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

        private static correctWebkitOffset(node: INode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.offsetParent)
                return ret;

            if (!node.offsetParent.isStatic) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }

            //if there is not bug to fix
            if (node.offsetParent.element == node.element.offsetParent)
                return ret;
            
            //Why is chrome does not keep care of css-transform on static elements
            //when it comes to the right offsetParent and the offsetTop/offsetLeft values
            console.warn("The given offsetParent is maybe wrong.");
        }

    }
}