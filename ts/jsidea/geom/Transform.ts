module jsidea.geom {
    export interface ITransformElement {
        element: HTMLElement;
        matrix: geom.Matrix3D;
        preserve3D: boolean;
        is2D: boolean;
        perspective: number;
        style: CSSStyleDeclaration;
        parentStyle: CSSStyleDeclaration;
    }
    export class Transform {

        private static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        public static getGlobalToLocal(element: HTMLElement, x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //get chain
            var chain: ITransformElement[] = this.extractChain(element);

            //invert and transform/project from parent to child
            var pt = new geom.Point3D(x, y, 0);
            var l = chain.length;
            for (var i = l - 1; i >= 0; --i) {
                chain[i].matrix.invert();
                if (chain[i].preserve3D)// || chain[i].perspective > 0)
                    pt = chain[i].matrix.project(pt);
                else
                    pt = chain[i].matrix.transform2D(pt);
            }

            //            var paddingX = math.Number.parse(chain[0].style.paddingLeft, 0);
            //            var paddingY = math.Number.parse(chain[0].style.paddingTop, 0);
            //            pt.x -= paddingX;
            //            pt.y -= paddingY;

            return pt;
        }

        public static getLocalToGlobal(element: HTMLElement, x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //get chain
            var chain: ITransformElement[] = this.extractChain(element);

            //transform from child to parent
            var pt = new geom.Point3D(x, y, 0);
            var l = chain.length;
            for (var i = 0; i < l; ++i) {
                if (chain[i].preserve3D)// || chain[i].perspective > 0)
                    pt = chain[i].matrix.transform3D(pt, pt);
                else
                    pt = chain[i].matrix.transform2D(pt);
            }
            return pt;
        }

        private static extractChain(element: HTMLElement): geom.ITransformElement[] {
            //collect computed styles up to body.parent ==> html-container
            var styles: CSSStyleDeclaration[] = [];
            var visual = element;
            while (visual && visual != document.body.parentElement) {
                styles.push(window.getComputedStyle(visual));
                visual = visual.parentElement;
            }

            //collect transforms up to body
            var stylesIndex: number = 0;
            var chain: ITransformElement[] = [];
            visual = element;
            while (visual && visual != document.body) {
                chain.push(this.extractTransform(visual, styles[stylesIndex++], styles[stylesIndex]));
                visual = visual.parentElement;
            }

            //accumulate if possible
            //TODO: do it whenever possible?
            //            var l = chain.length;
            //            var b = l;
            //            for (var i = 0; i < l; ++i) {
            //                if (i < (l - 1) && (chain[i].is2D || chain[i].preserve3D)) {
            //                    chain[i + 1].matrix.prepend(chain[i].matrix);
            //                    l--;
            //                    chain.splice(i, 1);
            //                }
            //            }
            return chain;
        }

        private static extractTransformMatrix(element: HTMLElement, style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration): geom.Matrix3D {
            var result = new geom.Matrix3D();
            if (!element)
                return result;

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
            if (element.parentElement && this.isWebkit && style.position == "fixed") {
                offsetX -= element.parentElement.clientLeft;
                offsetY -= element.parentElement.clientTop;
            }
            result.appendPositionRaw(offsetX, offsetY, 0);

            //skip if its the body
            if (!parentStyle)
                return result;

            //------
            //parent borders
            //------
            var borderParentX = math.Number.parse(parentStyle.borderLeftWidth, 0);
            var borderParentY = math.Number.parse(parentStyle.borderTopWidth, 0);
            //tricky stuff (if parent has border-box and you are in firefox then add parents border NOT)
            //hmmmm firefox integrates the border into the offset????? just check it
            if (!this.isFirefox || parentStyle.boxSizing != "border-box") {
                result.appendPositionRaw(borderParentX, borderParentY, 0);
            }
            
            //-------
            //perspective
            //-------
            var perspective = math.Number.parse(parentStyle.perspective, 0);
//            var preserve3d = element.parentElement == document.body || (parentStyle.transformStyle == "preserve-3d");
//            var preserve3d = parentStyle.transformStyle == "preserve-3d";
//            if(element.parentElement == document.body)
//                preserve3d = false;
            
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if(this.isWebkit && parentStyle.overflow != "visible")
                perspective = 0;
            
            if (!perspective)// || preserve3d)
                return result;

            var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
            var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], element.parentElement.offsetWidth, 0);
            var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], element.parentElement.offsetHeight, 0);

            result.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
            result.appendPerspective(perspective);
            result.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);

            return result;
        }

        private static extractTransform(a: HTMLElement, style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration): geom.ITransformElement {
//            var preserve3d = a.parentElement == document.body || (parentStyle.transformStyle == "preserve-3d");
            var preserve3d = parentStyle.transformStyle == "preserve-3d";
            var is2D = style.transform.indexOf("matrix3d") < 0;
            var matrix = this.extractTransformMatrix(a, style, parentStyle);
            var perspective = math.Number.parse(parentStyle.perspective, 0);

            return {
                element: a,
                matrix: matrix,
                preserve3D: preserve3d,
                is2D: is2D,
                perspective: perspective,
                style: style,
                parentStyle: parentStyle
            };
        }
    }
}