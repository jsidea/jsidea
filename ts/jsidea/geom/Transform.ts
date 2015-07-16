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

        private _matrices: geom.Matrix3D[] = [];
        private _element: HTMLElement;
        private _style: CSSStyleDeclaration;
        private _parentStyle: CSSStyleDeclaration;
        private _inverted: boolean = false;
        private _root: HTMLElement;

        constructor(element: HTMLElement, root: HTMLElement = null) {
            this._element = element;
            this._root = root;
            this.update();
        }

        private update(): void {
            var chain = Transform.extractStyleChain(this._element, this._root);
            this._matrices = Transform.extractAccumulatedMatrices(chain);
            this._style = chain.style;
            this._parentStyle = chain.parent.style;
            this._inverted = false;
        }

        private invert(): void {
            this._inverted = !this._inverted;
            this._matrices.reverse();
            var l = this._matrices.length;
            for (var i = 0; i < l; ++i)
                this._matrices[i].invert();
        }

        private applyBoxModel(pt: Point3D, boxModel: string): void {
            //padding
            if (boxModel == "content-box") {
                pt.x -= math.Number.parse(this._style.paddingLeft, 0);
                pt.y -= math.Number.parse(this._style.paddingTop, 0);
            }
            
            if (boxModel == "content-box" || boxModel == "padding-box") {
                pt.x -= math.Number.parse(this._style.borderLeftWidth, 0);
                pt.y -= math.Number.parse(this._style.borderTopWidth, 0);
            }
            
            if (boxModel == "margin-box") {
                pt.x += math.Number.parse(this._style.marginLeft, 0);
                pt.y += math.Number.parse(this._style.marginTop, 0);
            }
        }

        public localToLocalPoint(to: HTMLElement, pt: geom.Point3D, boxModel: string = "content-box"): jsidea.geom.Point3D {
            return this.localToLocal(to, pt.x, pt.y, pt.z, boxModel);
        }

        public localToLocal(to: HTMLElement, x: number, y: number, z: number = 0, boxModel: string = "content-box"): jsidea.geom.Point3D {
            //check if to contains element
            //check if element contains to
            //if so shorten the way here
            var gl = this.localToGlobal(x, y, z);
            return Transform.extract(to).globalToLocalPoint(gl, boxModel);
        }

        public globalToLocalPoint(pt: geom.Point3D, boxModel: string = "content-box"): jsidea.geom.Point3D {
            return this.globalToLocal(pt.x, pt.y, pt.z, boxModel);
        }

        public globalToLocal(x: number, y: number, z: number = 0, boxModel: string = "content-box"): jsidea.geom.Point3D {
            //we need the globalToLocal matrices
            if (!this._inverted)
                this.invert();
            
            //project from parent to child
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].project(pt, pt);

            this.applyBoxModel(pt, boxModel);

            return pt;
        }

        public localToGlobalPoint(pt: geom.Point3D): jsidea.geom.Point3D {
            return this.localToGlobal(pt.x, pt.y, pt.z);
        }

        public localToGlobal(x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //we need the localToGlobal matrices
            if (this._inverted)
                this.invert();
            
            //unproject from child to parent
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].unproject(pt, pt);

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
            var offsetX = element.offsetLeft;
            var offsetY = element.offsetTop;

            //handle fixed elements (look what ie11 is doing???? very strange or consequent)
            if (element.parentElement && this.isWebkit && style.position == "fixed") {
                offsetX -= element.parentElement.clientLeft;
                offsetY -= element.parentElement.clientTop;
            }

            var parentStyle: CSSStyleDeclaration = node.parent.style;

            //integrate parent borders
            var borderParentX = math.Number.parse(parentStyle.borderLeftWidth, 0);
            var borderParentY = math.Number.parse(parentStyle.borderTopWidth, 0);

            if (!this.isFirefox) {
                offsetX += borderParentX;
                offsetY += borderParentY;
            }
            //tricky stuff: if parent has border-box and you are NOT in firefox then add parents border.
            //Firefox integrates the border to the offsetLeft and offsetTop values.
            else if (this.isFirefox) {
                if (parentStyle.boxSizing != "border-box") {
                    offsetX += borderParentX;
                    offsetY += borderParentY;
                }
                //WORK-A-ROUND: FF-Bug -> DOUBLE BORDER? in offset and border
                if (parentStyle.overflow != "visible") {
                    offsetX += borderParentX;
                    offsetY += borderParentY;
                }
            }
            
            //add scrolling offsets
            //webkit has the scroll-values set on html not on the body?
            if (this.isWebkit) {
                if (node.parent.element != document.body) {
                    offsetX -= node.parent.element.scrollLeft;
                    offsetY -= node.parent.element.scrollTop;
                }
            }
            else if (node.element != document.body) {
                offsetX -= node.parent.element.scrollLeft;
                offsetY -= node.parent.element.scrollTop;
            }

            //append the offset to the transform-matrix
            matrix.appendPositionRaw(offsetX, offsetY, 0);
            
            
            if(element instanceof  HTMLCanvasElement)
            {
                var can = <HTMLCanvasElement> element;
//                matrix.appendPositionRaw(offsetX, offsetY, 0);
//                matrix.appendPositionRaw(400, 400, 0);
                console.log(matrix.toString());
            }
            
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
                //its like appending the current node.transform to the last transform (child-transform)
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
            if(last)
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