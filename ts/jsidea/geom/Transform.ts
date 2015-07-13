module jsidea.geom {
    export interface ITransformElement {
        element: HTMLElement;
        matrix: geom.Matrix3D;
        preserve3D: boolean;
        is2D: boolean;
    }
    export class Transform {

        private static isWebkit = /chrome/.test(navigator.userAgent.toLowerCase());
        private static isFirefox = /firefox/.test(navigator.userAgent.toLowerCase());

        public static getGlobalToLocal(visual: HTMLElement, x: number, y: number, ret: Point2D = new Point2D()): jsidea.geom.IPoint2DValue {
            //collect
            var chain: ITransformElement[] = this.extractChain(visual);

            //transform
            var pt = new geom.Point3D(x, y, 0);
            var l = chain.length;
            //            console.log(chain.length);
            for (var i = l - 1; i >= 0; --i) {
                chain[i].matrix.invert();
                //                console.log(chain[i].preserve3D, pt);
                if (chain[i].preserve3D) {
                    pt = chain[i].matrix.project(pt);
                }
                else
                    pt = chain[i].matrix.transform2D(pt);
            }

            return pt;
        }
        
        //        private static unp(screen: geom.Point3D, vp: geom.Viewport, m: geom.Matrix3D): geom.Point3D {
        //            m = m.clone();
        //            
        //            m.project
        //
        //            //unproject
        //            var dir = new geom.Point3D(screen.x, screen.y, -1);
        //            dir.unproject(vp.focalLength, vp.origin);
        //            //create plane
        //            var pl = new geom.Plane3D();
        //            pl.fromPoints(
        //                m.transform(new geom.Point3D(0, 0, 0)),
        //                m.transform(new geom.Point3D(1, 0, 0)),
        //                m.transform(new geom.Point3D(0, 1, 0))
        //                );
        //            
        //            //intersect plane -- extract z
        //            var fin: geom.Point3D = pl.intersectLine(screen, dir);
        //            fin.z *= -1;
        //            fin.x = screen.x;
        //            fin.y = screen.y;
        //            
        //            //unproject intersection to get the final position in scene space
        //            fin.unproject(vp.focalLength, vp.origin);
        //            
        //            //transform from scene to local
        //            m.invert();
        //            return m.transform(fin);
        //        }

        public static getLocalToGlobal(visual: HTMLElement, lpt: geom.IPoint2DValue, ret: Point2D = new Point2D()): jsidea.geom.Point3D {
            //collect
            var chain: ITransformElement[] = this.extractChain(visual);

            //transform
            var pt = new geom.Point3D(lpt.x, lpt.y, 0);
            var l = chain.length;
            for (var i = 0; i < l; ++i) {
                if (chain[i].preserve3D)
                    pt = chain[i].matrix.transform3D(pt);
                else
                    pt = chain[i].matrix.transform2D(pt);
            }
            return pt;
        }

        private static extractChain(visual: HTMLElement): geom.ITransformElement[] {
            //collect
            var chain: ITransformElement[] = [];
            while (visual && visual != document.body) {
                chain.push(this.extractTransform(visual));
                visual = visual.parentElement;
            }

            //accumulate
            var l = chain.length;
            var b = l;
            for (var i = 0; i < l; ++i) {
                if (i < (l - 1)
                    && (chain[i].is2D || chain[i].preserve3D)) {
                    chain[i + 1].matrix.prepend(chain[i].matrix);
                    l--;
                    chain.splice(i, 1);
                }
            }
            return chain;
        }

        private static extractTransformMatrix(style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration, a: HTMLElement): geom.Matrix3D {
            var result = new geom.Matrix3D();
            if (!a)
                return result;

            //------
            //transform
            //------
            var origin = style.transformOrigin.split(" ");
            var originX = math.Number.parseRelation(origin[0], a.offsetWidth, 0);
            var originY = math.Number.parseRelation(origin[1], a.offsetHeight, 0);
            var originZ = math.Number.parseRelation(origin[2], 0, 0);

            result.appendPositionRaw(-originX, -originY, -originZ);
            result.appendCSS(style.transform);
            result.appendPositionRaw(originX, originY, originZ);
            
            //------
            //offset
            //------
            result.appendPositionRaw(a.offsetLeft, a.offsetTop, 0);

            //------
            //parent borders
            //------
            var borderParentX = math.Number.parse(parentStyle.borderLeftWidth, 0);
            var borderParentY = math.Number.parse(parentStyle.borderTopWidth, 0);
            //tricky stuff (if parent has border-box add parents border NOT here if you are in firefox)
            //hmmmm firefox integrates the border into the offset????? just check it
            if (!this.isFirefox || parentStyle.boxSizing != "border-box") {
                result.appendPositionRaw(borderParentX, borderParentY, 0);
            }
            
            //-------
            //perspective
            //-------
            var perspective = math.Number.parse(parentStyle.perspective, 0);
            if (!perspective)
                return result;

            var perspectiveOrigin = parentStyle.perspectiveOrigin.split(" ");
            var perspectiveOriginX = math.Number.parseRelation(perspectiveOrigin[0], a.parentElement.offsetWidth, 0);
            var perspectiveOriginY = math.Number.parseRelation(perspectiveOrigin[1], a.parentElement.offsetHeight, 0);

            result.appendPositionRaw(-perspectiveOriginX, -perspectiveOriginY, 0);
            result.appendPerspective(perspective);
            result.appendPositionRaw(perspectiveOriginX, perspectiveOriginY, 0);

            return result;
        }

        private static extractTransform(a: HTMLElement): geom.ITransformElement {
            var style = window.getComputedStyle(a);
            var parentStyle = window.getComputedStyle(a.parentElement);

            var preserve3d = a.parentElement == document.body || (parentStyle.transformStyle == "preserve-3d");
            var is2D = style.transform.indexOf("matrix3d") < 0;
            var matrix = this.extractTransformMatrix(style, parentStyle, a);

            return {
                element: a,
                matrix: matrix,
                preserve3D: preserve3d,
                is2D: is2D,
            };
        }
    }
}