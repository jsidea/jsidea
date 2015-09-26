module jsidea.layout {
    export class StyleNode {
        public static create(element: HTMLElement): IStyleNode {
            if (!element)
                return null;
            return StyleNode.extractStyleChain(element);
        }

        private static extractStyleChain(element: HTMLElement): IStyleNode {
            var body = element.ownerDocument.body;
            var html = element.ownerDocument.documentElement;
            
            //collect from child to root
            var nodes: IStyleNode[] = [];
            while (element) {
                var style = window.getComputedStyle(element);
                var node: IStyleNode = <any>{};
                node.element = element;
                node.first = null;
                node.child = null;
                node.parent = null;
                node.last = null;
                node.isTransformed = style.transform != "none";
                node.isTransformed3D = style.transform.indexOf("matrix3d") >= 0;
                node.isPreserved3d = style.transformStyle == "preserve-3d";
                node.isScrollable = style.overflow != "visible";
                node.depth = 0;
                node.perspective = 0;
                node.isHTML = element == html;
                node.isBody = element == body;
                node.style = style;
                node.isForced2D = false;
                
                //maybe its not needed
                if (system.Browser.isInternetExplorer)
                    node.isPreserved3d = false;
                
                //webkit ignores perspective set on scroll elements
                node.perspective = (system.Engine.isWebKit && node.isTransformed && node.isScrollable) ? 0 : math.Number.parse(style.perspective, 0);

                (<any>element)._node = <IStyleNode>node;
                nodes.push(node);
                element = element.parentElement;
            }

            var first = nodes[nodes.length - 1];
            var last = nodes[0];
            var depth = 0;
            node = first;
            while (node) {
                node.first = first;
                node.last = last;
                node.depth = depth++;
                node.child = nodes[(nodes.length - node.depth) - 1];
                node.parent = nodes[(nodes.length - node.depth) + 1];
                node.isForced2D = this.getIsForced2D(node);
                node = node.child;
            }

            var chain = last;
            
            //run from root to child
            //this should prevent that if the parent element
            //has the webkit-bug and an element changed
            //from static to relative position
            //the offsets of the possible children are wrong
            //and this order prevents it (root to child)
            var isTransformedChild = false;
            var isPreserved3dChild = false;
            var isFixedChild = false;
            var isPerspectiveChild = false;
            var node = <IStyleNode>chain.first;
            while (node) {
                var style = node.style;
                var element = node.element;

                node.isPreserved3dChild = isPreserved3dChild;
                node.isPreserved3dOrPerspective = node.isPreserved3d || (node.perspective > 0);
                node.isPerspectiveChild = isPerspectiveChild;
                node.isFixedZombie = false;
                node.isFixed = style.position == "fixed";
                node.isFixedChild = isFixedChild;
                node.isRelative = style.position == "relative";
                node.isAbsolute = style.position == "absolute";
                node.isStatic = style.position == "static";
                node.isBorderBox = style.boxSizing == "border-box";
                node.offsetLeft = element.offsetLeft;
                node.offsetTop = element.offsetTop;

                if (system.Engine.isWebKit) {
                    if (node.isHTML) {
                        node.offsetLeft = node.element.ownerDocument.body.offsetLeft;
                        node.offsetTop = node.element.ownerDocument.body.offsetTop;
                    }
                    else if (node.isBody) {
                        node.offsetLeft = 0;
                        node.offsetTop = 0;
                    }
                }

                node.clientLeft = element.clientLeft;
                node.clientTop = element.clientTop;
                node.isTransformedChild = isTransformedChild;
                node.offsetParentRaw = node.element.offsetParent ? (<any>node.element.offsetParent)._node : null;
                node.isSticked = this.getIsSticked(node);
                node.isFixedZombie = node.isFixed && !node.isSticked;
                node.isStickedChild = this.getIsStickedChild(node);
                node.offsetParent = this.getOffsetParent(node);
                node.parentScroll = system.Browser.isFirefox ? this.getParentScrollFirefox(node) : this.getParentScroll(node);
                node.scrollOffset = this.getScrollOffset(node);
                node.offset = this.getOffset(node);
                node.offsetUnscrolled = new geom.Point2D(node.offset.x + node.scrollOffset.x, node.offset.y + node.scrollOffset.y);
                node.position = this.getPosition(node);
                
                //if the element has transform
                //the following elements are in transformed-context
                if (!isTransformedChild && node.isTransformed)
                    isTransformedChild = true;

                if (!isFixedChild && node.isFixed)
                    isFixedChild = true;

                if (!isPreserved3dChild && node.isPreserved3d)
                    isPreserved3dChild = true;

                if (!isPerspectiveChild && node.perspective > 0)
                    isPerspectiveChild = true;

                node = node.child;
            }

            return <IStyleNode>chain;
        }

        //returns the local position the direct parent
        private static getPosition(node: IStyleNode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (node.isSticked || !node.parent)
                return ret.setTo(node.offset.x, node.offset.y);
            return ret.setTo(node.offset.x - node.parent.offset.x, node.offset.y - node.parent.offset.y);
        }

        private static getOffsetParent(node: IStyleNode): IStyleNode {
            //            if (system.Caps.isFirefox)
            //                return node.element.offsetParent ? node.element.offsetParent._node : null;

            //if its forced to have another parent
            if (node.isFixedZombie) {
                while (node = node.parent) {
                    if (node.isBody || node.isSticked)
                        return node;

                    if (node.isStatic) {
                        if (node.isTransformed || node.isPreserved3dOrPerspective)
                            return node;
                        else
                            continue;
                    }
                    
                    //that is the trick
                    //if the element itself is wrongyl-fixed
                    //than this could not be the offset
                    if ((node.isFixedZombie || !node.isPerspectiveChild) && !node.isTransformed && !node.isPreserved3dOrPerspective) {
                        continue;
                    }

                    return node;
                }
                return null;
            }

            if (!node || node.isBody || node.isSticked)
                return null;
            while (node = node.parent) {
                if (!node.isStatic || node.isTransformed || node.isPreserved3dOrPerspective || node.isSticked) {
                    return node;
                }
            }
            return null;
        }

        private static getParentScroll(node: IStyleNode): IStyleNode {
            //important: if the node is really sticked, then there could not be any scrolling
            if (!node || node.isSticked || !node.parent)
                return null;

            //TODO: FIND THE BUG
            //if its forced to have another parent
            if (node.isFixedZombie)
                return node.offsetParent;

            var excludeStaticParent = node.isAbsolute;
            while ((node = node.parent) && node.parent) {
                if (node.isBody || node.isSticked)
                    return node;
                if (excludeStaticParent && (node.isStatic && !node.isTransformed))
                    continue;
                return node;
            }
            return null;
        }

        private static getParentScrollFirefox(node: IStyleNode): IStyleNode {
            //important: if the node is really sticked, then there could not be any scrolling
            if (!node || node.isSticked || !node.parent)
                return null;

            //TODO: FIND THE BUG
            //if its forced to have another parent
            if (node.isFixedZombie)
                return node.offsetParent;

            var excludeStaticParent = node.isAbsolute;
            while ((node = node.parent) && node.parent) {
                if (node.isBody || node.isSticked)
                    return node;
                if (excludeStaticParent && (node.isStatic && !node.isTransformedChild))
                    continue;
                return node;
            }
            return null;
        }

        private static getIsStickedChild(node: IStyleNode): boolean {
            while (node) {
                if (node.isSticked)
                    return true;
                node = node.parent;
            }
            return false;
        }

        private static getIsSticked(node: IStyleNode): boolean {
            //just skip if the element itself has not fixed
            if (!node.isFixed)
                return false;
            
            //ie does it right
            if (system.Browser.isInternetExplorer || system.Browser.isEdge)
                return node.isFixed && !(node.isPerspectiveChild || node.isPreserved3dOrPerspective);

            while (node = node.parent) {
                if (node.isTransformed || node.isPreserved3dOrPerspective)
                    return false;
            }
            return true;
        }

        //if you subtract the scroll from the accumlated/summed offset
        //you get the real offset to window (initial-containing-block)
        private static getScrollOffset(node: IStyleNode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node || !node.parent)
                return ret;
            
            //add scroll value only if reference of the element is the window not the body
            if (node.isStickedChild) {
                if (system.Engine.isWebKit) {
                    ret.x -= node.element.ownerDocument.body.scrollLeft;
                    ret.y -= node.element.ownerDocument.body.scrollTop;
                }
                else {
                    ret.x -= node.element.ownerDocument.documentElement.scrollLeft;
                    ret.y -= node.element.ownerDocument.documentElement.scrollTop;
                }
            }

            //skip body 
            //the body scroll is only needed for elemente which are fixed to window
            //so this value is added add the getOffset-function
            while ((node = node.parentScroll) && !node.isBody) {
                ret.x += node.element.scrollLeft;
                ret.y += node.element.scrollTop;
            }
            return ret;
        }

        private static getOffset(node: IStyleNode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            ret.x = 0;
            ret.y = 0;

            //the offset of void/null is 0 0
            if (!node)
                return ret;

            ret.x -= node.scrollOffset.x;
            ret.y -= node.scrollOffset.y;
            
            //if it is really fixed, then just make it fast
            //wow, and the offsets are correct
            //if the element is really fixed
            if (node.isSticked) {
                this.addCorrectOffset(node, ret);
                return ret;
            }

            var leafNode = node;
            while (node) {
                //for webkit (if there is a wrong offserParent set,
                //then the offsets are also wrong... arghhh)
                //correct them here
                this.addCorrectOffset(node, ret);
                if (!node.offsetParentRaw)
                    break;
                node = node.offsetParent;
            }
            return ret;
        }

        private static getIsForced2D(node: IStyleNode): boolean {
            //ie11 has no "working" preserve-3d, but window.getComputedStyle includes the preserve-3d value? 
            if (system.Browser.isInternetExplorer)
                return false;
            
            //in any case, if an element has only 2d-transforms or its the document-root item
            //the transform can be accumulated to the parent transform
            if (node.isBody || !node.isTransformed3D)
                return false;

            //tricky stuff: only firefox does reflect/compute the "correct" transformStyle value.
            //Firefox does NOT reflect the "grouping"-overrides and this is how its concepted.
            //But what about the "opacity"-property. Opacity does not override the preserve-3d (not always, webkit does under some conditions).
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if (!node.parent.isPreserved3d && node.parent.perspective == 0)
                return true;

            if (node.parent.isScrollable)
                return true;

            return false;
        }

        private static addCorrectOffset(node: IStyleNode, ret: geom.Point2D = new geom.Point2D()): geom.Point2D {
            if (!node)
                return ret;

            ret.x += node.offsetLeft;
            ret.y += node.offsetTop;

            if (system.Engine.isWebKit) {
                this.getCorrectOffsetWebkit(node, ret);
            } else if (system.Browser.isFirefox) {
                this.getCorrectOffsetFirefox(node, ret);
            } else if (system.Browser.isInternetExplorer) {
                this.getCorrectOffsetInternetExplorer(node, ret);
            } else if (system.Browser.isEdge) {
                this.getCorrectOffsetEdge(node, ret);
            }

            return ret;
        }

        private static getCorrectOffsetEdge(node: IStyleNode, ret: geom.Point2D): geom.Point2D {
            if (!node || !node.offsetParent || node.isBody)
                return ret;

            if (node.offsetParent.element != node.element.offsetParent) {
                //coming soon...
                return ret;
            }

            ret.x += node.offsetParent.clientLeft;
            ret.y += node.offsetParent.clientTop;
        }

        private static getCorrectOffsetInternetExplorer(node: IStyleNode, ret: geom.Point2D): geom.Point2D {
            if (!node || !node.offsetParent || node.isBody)
                return ret;

            //bla bla ... if an element ist position "fixed" the offsetParent is always zero ....
            //in perspective the getBoundingClientRect() will fail too
            if (node.offsetParent.element != node.element.offsetParent) {
                //UNSOLVABLE if wrong
                return ret;
            }

            ret.x += node.offsetParent.clientLeft;
            ret.y += node.offsetParent.clientTop;
        }

        private static getCorrectOffsetFirefox(node: IStyleNode, ret: geom.Point2D): geom.Point2D {
            //no node no value
            if (!node)
                return ret;

            if (!node.offsetParent) {
                if ((node.isStatic || node.isRelative) && !node.isHTML) {
                    ret.x += node.element.ownerDocument.body.clientLeft;
                    ret.y += node.element.ownerDocument.body.clientTop;
                }
                return ret;
            }

            if (!node.offsetParent.isBorderBox) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }

            if (
                (node.isAbsolute || node.isFixedZombie)
                && node.offsetParent.isScrollable
            ) {
                ret.x += node.offsetParent.clientLeft;
                ret.y += node.offsetParent.clientTop;
            }
            
            //if there is no bug to fix
            if (node.offsetParent.element == node.element.offsetParent)
                return ret;
            
            //this should not happen at all
            console.warn("The given offsetParent is maybe wrong.");

            return ret;
        }

        private static getCorrectOffsetWebkit(node: IStyleNode, ret: geom.Point2D): geom.Point2D {
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
                    ret.x += node.offsetParent.offsetUnscrolled.x;
                    ret.y += node.offsetParent.offsetUnscrolled.y;
                }
                else {
                    //do nothing if...
                    if (node.isBody || node.isAbsolute || node.offsetParent.isBody) {
                    }
                    //we need to re-calc the offset
                    //just subtract the difference of the wrong-offset and correct-offset
                    else {
                        //offset without scroll
                        //the scroll value is already applied or will be applied
                        //for the target node
                        ret.x -= node.offsetParent.offsetUnscrolled.x - node.offsetParentRaw.offsetLeft;
                        ret.y -= node.offsetParent.offsetUnscrolled.y - node.offsetParentRaw.offsetTop;
                    }
                }
            }
            else if (node.offsetParent) {
                if (node.offsetParent.isBody || node.isFixedZombie) {
                }
                else if (!node.offsetParent.isStatic) {
                    ret.x += node.offsetParent.clientLeft;
                    ret.y += node.offsetParent.clientTop;
                }
            }

            return ret;
        }
    }
}