module jsidea.geom {
    export interface ITransformElement {
        element: HTMLElement;
        matrix: geom.Matrix3D;
        preserve3D: boolean;
        is2D: boolean;
        //        perspective: number;
        style: CSSStyleDeclaration;
        parentStyle: CSSStyleDeclaration;
    }

    export class TransformChain {
        public chain: ITransformElement[] = [];
        public chainRaw: ITransformElement[] = [];

        public collect(element: HTMLElement): void {
            
            //clear chaing
            this.chain.splice(0, this.chain.length);
            this.chainRaw.splice(0, this.chainRaw.length);
            
            //collect computed styles up to body.parent ==> html-container
            var styles: CSSStyleDeclaration[] = [];
            var visual = element;
            while (visual && visual != document.body.parentElement) {
                styles.push(window.getComputedStyle(visual));
                visual = visual.parentElement;
            }

            //collect transforms up to body
            var stylesIndex: number = 0;
            var chainRaw: ITransformElement[] = [];
            visual = element;
            while (visual && visual != document.body) {
                chainRaw.push(Transform.extractTransform(visual, styles[stylesIndex++], styles[stylesIndex]));
                visual = visual.parentElement;
            }

            //accumulate if possible
            //TODO: do it whenever possible?
            var chain = chainRaw.slice(0, chainRaw.length);
            var l = chain.length;
            var b = l;
            for (var i = 0; i < l; ++i) {
                if (i < (l - 1) && (chain[i].is2D || chain[i].preserve3D)) {
                    chain[i + 1].matrix.prepend(chain[i].matrix);
                    l--;
                    chain.splice(i, 1);
                    i--;
                }
            }            
            
            //set the finals
            this.chain = chain;
            this.chainRaw = chainRaw;
        }

        public toString(): void {
            var chain = this.chainRaw;
            var l = chain.length;
            for (var i = 0; i < l; ++i) {
                console.log(
                    chain[i].element.id,
                    "   \tOFFSET", chain[i].element.offsetLeft,
                    chain[i].element.offsetTop,
                    "   \tSIZE", chain[i].element.offsetWidth,
                    chain[i].element.offsetHeight,
                    "   \tBORDER", chain[i].style.borderLeftWidth,
                    chain[i].style.borderTopWidth,
                    "   \tPRESERVED", Transform.extractPreserve(chain[i].parentStyle),
                    "   \tPERSPECTIVE", chain[i].style.perspective
                    );
            }
        }
    }
    export class Transform {

        private static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        public static getGlobalToLocal(element: HTMLElement, x: number, y: number, z: number = 0): jsidea.geom.Point3D {
            //get chain
            var chain: ITransformElement[] = this.extractChain(element).chain;

            //invert and transform/project from parent to child
            var pt = new geom.Point3D(x, y, 0);
            var l = chain.length;
            for (var i = l - 1; i >= 0; --i) {
                chain[i].matrix.invert();
                pt = chain[i].matrix.project(pt);
            }

            var style = window.getComputedStyle(element);
            var paddingX = math.Number.parse(style.paddingLeft, 0);
            var paddingY = math.Number.parse(style.paddingTop, 0);
            pt.x -= paddingX;
            pt.y -= paddingY;

            var parentStyle = window.getComputedStyle(element.parentElement);
            var parentBorderX = math.Number.parse(parentStyle.borderLeftWidth, 0);
            var parentBorderY = math.Number.parse(parentStyle.borderTopWidth, 0);
            pt.x -= parentBorderX;
            pt.y -= parentBorderY;

            return pt;
        }

        public static getLocalToGlobal(element: HTMLElement, x: number, y: number, z: number = 0, out: boolean = false): jsidea.geom.Point3D {
            //get chain
            var tr = this.extractChain(element);
            var chain: ITransformElement[] = tr.chain;

            //transform from child to parent
            var pt = new geom.Point3D(x, y, 0);
            var l = chain.length;
            for (var i = 0; i < l; ++i) {
                pt = chain[i].matrix.unproject(pt, pt);
            }


            if (out)
                tr.toString();

            return pt;
        }

        private static extractChain(element: HTMLElement): geom.TransformChain {
            var chain = new TransformChain();
            chain.collect(element);
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

            //handle fixed elements (look what ie11 is doing???? very strange or consequent)
            if (element.parentElement && this.isWebkit && style.position == "fixed") {
                offsetX -= element.parentElement.clientLeft;
                offsetY -= element.parentElement.clientTop;
            }

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

        public static extractPreserve(style: CSSStyleDeclaration): boolean {
            var preserve3d = style.transformStyle == "preserve-3d";
            
            //tricky stuff: only firefox does reflect/compute the "correct" transformStyle value.
            //Firefox does NOT reflect the "grouping"-overrides and this is how its concepted.
            //But what about the "opacity"-property. Opacity does not override the preserve-3d (not always, webkit does under some conditions).
            //http://dev.w3.org/csswg/css-transforms/#grouping-property-values
            if (preserve3d && style.overflow != "visible")
                preserve3d = false;

            return preserve3d;
        }

        public static extractTransform(a: HTMLElement, style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration): geom.ITransformElement {
            var preserve3d = this.extractPreserve(parentStyle);
            
            //there is this case where webkit ignores transform-style: none. 
            //So when the elements parent has preserve3d and the element itself has no transform set.
            if (this.isWebkit && !preserve3d && parentStyle.transform == "none" && a.parentElement.parentElement) {
                var app = window.getComputedStyle(a.parentElement.parentElement);
                var p = this.extractPreserve(app);
                if (app)
                    preserve3d = true;
            }

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