module jsidea.geom {
    export interface INodeStyle {
        parent: INodeStyle;
        element: HTMLElement;
        style: CSSStyleDeclaration;
    }

    export class TransformChain {
        private _matrices: geom.Matrix3D[] = [];
        private _element: HTMLElement;
        private _style: CSSStyleDeclaration;
        private _parentStyle: CSSStyleDeclaration;

        constructor(element: HTMLElement) {
            this._element = element;
            this._matrices = Transform.extractAccumulatedMatrices(element);
            this._style = window.getComputedStyle(this._element);
            this._parentStyle = window.getComputedStyle(this._element.parentElement);
        }

        public globalToLocal(x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //invert and transform/project from parent to child
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = l - 1; i >= 0; --i)
                pt = nodes[i].invertProject(pt, pt);

            //padding
            pt.x -= math.Number.parse(this._style.paddingLeft, 0);
            pt.y -= math.Number.parse(this._style.paddingTop, 0);

            //parent border
            pt.x -= math.Number.parse(this._parentStyle.borderLeftWidth, 0);
            pt.y -= math.Number.parse(this._parentStyle.borderTopWidth, 0);

            return pt;
        }

        public localToGlobal(x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //transform from child to parent
            var nodes: geom.Matrix3D[] = this._matrices;
            var pt = new geom.Point3D(x, y, z);
            var l = nodes.length;
            for (var i = 0; i < l; ++i)
                pt = nodes[i].unproject(pt, pt);

            return pt;
        }
    }
    export class Transform {

        private static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());
        private static isIE = (navigator.userAgent.indexOf("MSIE") != -1) || !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);

        public static getGlobalToLocal(element: HTMLElement, x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            return new TransformChain(element).globalToLocal(x, y, z);
        }

        public static getLocalToGlobal(element: HTMLElement, x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            return new TransformChain(element).localToGlobal(x, y, z);
        }

        public static extractMatrix(node: INodeStyle): geom.Matrix3D {
            var result = new geom.Matrix3D();
            if (!node)
                return result;

            var element: HTMLElement = node.element;
            var style: CSSStyleDeclaration = node.style;
            
            //------
            //transform
            //------
            var origin = style.transformOrigin.split(" ");
            var originX = math.Number.parseRelation(origin[0], element.offsetWidth, 0);
            var originY = math.Number.parseRelation(origin[1], element.offsetHeight, 0);
            var originZ = math.Number.parseRelation(origin[2], 0, 0);

            result.appendPositionRaw(-originX, -originY, -originZ);
            result.appendCSS(style.transform);
            result.appendPositionRaw(originX, originY, originZ);
            
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

            result.appendPositionRaw(offsetX, offsetY, 0);
            
            //-------
            //perspective
            //-------
            var perspective = math.Number.parse(parentStyle.perspective, 0);
            if (!perspective)
                return result;

            var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
            var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
            var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

            result.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
            result.appendPerspective(perspective);
            result.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);

            return result;
        }

        public static extractAccumulatedMatrices(element: HTMLElement): geom.Matrix3D[] {
            //collect computed styles/nodes up to html/root (including html/root)
            var root = document.body.parentElement;
            var nodes: INodeStyle[] = [];
            var visual = element;
            var lastNode: INodeStyle = null;
            while (visual && visual != root.parentElement) {
                var node = {
                    element: visual,
                    style: window.getComputedStyle(visual),
                    parent: null
                };
                if (visual != root)
                    nodes.push(node);
                if (lastNode)
                    lastNode.parent = node;
                lastNode = node;
                visual = visual.parentElement;
            }

            //collect transforms up to body
            var l = nodes.length;
            var matrices: geom.Matrix3D[] = [];
            var isAcc: boolean[] = [];
            for (var i = 0; i < l; ++i) {
                node = nodes[i];
                isAcc.push(this.isAccumulatable(node));
                matrices.push(this.extractMatrix(node));
            }

            //accumulate if possible
            for (var i = 0; i < l; ++i) {
                if (i < (l - 1) && isAcc[i]) {
                    matrices[i + 1].prepend(matrices[i]);
                    matrices.splice(i, 1);
                    isAcc.splice(i, 1);
                    l--;
                    i--;
                }
            }
            return matrices;
        }

        private static isAccumulatable(node: INodeStyle): boolean {
            //            if (this.isIE) {
            //                return false;
            //            }

            
//            if (node.element.id == "a-cont")
//            {
//                console.log(node.parent.style.transformStyle, node.style.transform.indexOf("matrix3d"));
//                return false;
//                }

            if (!node.parent)// || node.style.transform.indexOf("matrix3d") < 0)
                return true;



            var parent = node.parent;
            var preserve3d = parent.style.transformStyle == "preserve-3d";
            
            //tricky stuff: only firefox does reflect/compute the "correct" transformStyle value.
            //Firefox does NOT reflect the "grouping"-overrides and this is how its concepted.
            //But what about the "opacity"-property. Opacity does not override the preserve-3d (not always, webkit does under some conditions).
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if (preserve3d && parent.style.overflow != "visible")
                preserve3d = false;
            
            //there is this case where webkit ignores transform-style: flat. 
            //So when the elements parent has preserve-3d and the element itself has no transform set.
            if (!preserve3d && this.isWebkit && parent.style.transform == "none" && parent.parent) {
                preserve3d = this.isAccumulatable(parent.parent);
            }

            return preserve3d;
        }
    }
}