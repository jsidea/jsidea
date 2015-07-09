module jsidea.test {
    export class TestApplication extends jsidea.core.Application {

        constructor() {
            super();
        }

        //@override abstract
        public create(): void {
            this.testMatrix3D5();
        }

        private testMatrix3D5(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 1024;
            can.height = 1024;
            var ctx = can.getContext("2d");

            a.appendChild(b);
            b.appendChild(bc);
            con.appendChild(a);
            document.body.appendChild(can);
            
            this.drawBoundingBox3(ctx, a);
            this.drawBoundingBox3(ctx, b);
            this.drawBoundingBox3(ctx, bc);
        }

        private testMatrix3D4(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var ac = document.createElement("div");
            ac.id = "ac-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            var can = document.createElement("canvas");
            can.id = "can";
            can.width = 1024;
            can.height = 1024;
            var ctx = can.getContext("2d");

            a.appendChild(b);
            b.appendChild(bc);

            con.appendChild(a);
            con.appendChild(ac);
            con.appendChild(can);

            $(document).bind("mousemove",(evt) => {

                ctx.clearRect(0, 0, can.width, can.height);

                var fin = new geom.Matrix3D();//
                
                //                var parent = this.extractP(a);
                //                fin.prepend(parent);
                //                this.drawBoundingBox(ctx, fin, a);
                //
                //                var child = this.extractP(b);
                //                fin.prepend(child);
                //                this.drawBoundingBox(ctx, fin, b);
                
                var parent = geom.Transform.extract(a).matrix;
                fin.prepend(parent);
                this.drawBoundingBox(ctx, fin, a);

                var child = geom.Transform.extract(b).matrix;
                fin.prepend(child);
                this.drawBoundingBox(ctx, fin, b);

                this.drawBoundingBox2(ctx, child, parent, b);
            }
                );
            $(document).trigger("mousemove");
        }
        
        private drawBoundingBox3(ctx: CanvasRenderingContext2D, e: HTMLElement): void {
            var or: geom.Point2D = geom.Point2D.extractPerspectiveOrigin(e);
            
            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);
            var orp = new geom.Point3D(or.x, or.y, 0);

            a = geom.Transform.getLocalToGlobal(e, a);
            b = geom.Transform.getLocalToGlobal(e, b);
            c = geom.Transform.getLocalToGlobal(e, c);
            d = geom.Transform.getLocalToGlobal(e, d);
            orp = geom.Transform.getLocalToGlobal(e, orp);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            //x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean
            ctx.moveTo(orp.x + 5, orp.y);
            ctx.arc(orp.x, orp.y, 5, 0, 360);
            ctx.stroke();

            ctx.fillText("(" + orp.x.toFixed(2) + ", " + orp.y.toFixed(2) + ") ", orp.x + 5, orp.y - 5);
        }

        private drawBoundingBox(ctx: CanvasRenderingContext2D, pm: geom.Matrix3D, e: HTMLElement): void {
            var or: geom.Point2D = geom.Point2D.extractPerspectiveOrigin(e);
            //            e.textContent = "HELLO WORLD";
            //            console.log(or);
            
            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);
            var orp = new geom.Point3D(or.x, or.y, 0);

            a = pm.transform3D(a);
            b = pm.transform3D(b);
            c = pm.transform3D(c);
            d = pm.transform3D(d);
            orp = pm.transform3D(orp);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            //x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean
            ctx.moveTo(orp.x + 5, orp.y);
            ctx.arc(orp.x, orp.y, 5, 0, 360);
            ctx.stroke();

            ctx.fillText("(" + orp.x.toFixed(2) + ", " + orp.y.toFixed(2) + ") " + pm.getPerspective().toFixed(2), orp.x + 5, orp.y - 5);
        }

        private drawBoundingBox2(ctx: CanvasRenderingContext2D, child: geom.Matrix3D, par: geom.Matrix3D, e: HTMLElement): void {
            var or: geom.Point2D = geom.Point2D.extractPerspectiveOrigin(e);
            //            e.textContent = "HELLO WORLD";
            //            console.log(or);
            
            var a = new geom.Point3D(0, 0, 0);
            var b = new geom.Point3D(e.offsetWidth, 0, 0);
            var c = new geom.Point3D(e.offsetWidth, e.offsetHeight, 0);
            var d = new geom.Point3D(0, e.offsetHeight, 0);
            var orp = new geom.Point3D(or.x, or.y, 0);

            a = child.transform2D(a);
            b = child.transform2D(b);
            c = child.transform2D(c);
            d = child.transform2D(d);
            orp = child.transform2D(orp);
            
            //            a.z = 0;
            //            b.z = 0;
            //            c.z = 0;
            //            d.z = 0;
            //            orp.z = 0;
            //            a.w = 1;
            //            b.w = 1;
            //            c.w = 1;
            //            d.w = 1;
            //            orp.w = 1;
            //            console.log(a.toString());

            a = par.transform3D(a);
            b = par.transform3D(b);
            c = par.transform3D(c);
            d = par.transform3D(d);
            orp = par.transform3D(orp);
            
            
            //            a.z = 0;
            //            b.z = 0;
            //            c.z = 0;
            //            d.z = 0;
            //            orp.z = 0;
            //            a.w = 1;
            //            b.w = 1;
            //            c.w = 1;
            //            d.w = 1;
            //            orp.w = 1;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.lineTo(a.x, a.y);
            //x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean
            ctx.moveTo(orp.x + 5, orp.y);
            ctx.arc(orp.x, orp.y, 5, 0, 360);
            ctx.stroke();

            ctx.fillText("(" + orp.x.toFixed(2) + ", " + orp.y.toFixed(2) + ") " + child.getPerspective().toFixed(2), orp.x + 5, orp.y - 5);
        }

        private extractP(a: HTMLElement): geom.Matrix3D {
            var fin = new geom.Matrix3D();

            var ma = geom.Matrix3D.extract(a);
            var or = geom.Point3D.extractOrigin(a);
            var po = geom.Point2D.extractPosition(a);
            var por = geom.Point2D.extractPerspectiveOrigin(a.parentElement);
            var pers = math.Number.parse(window.getComputedStyle(a.parentElement).perspective, 0);
            var preserve = window.getComputedStyle(a.parentElement).transformStyle == "preserve-3d";

            //if there is set perspective but the transformStyle is not set to preserve-3d
            if (!preserve && pers) {
            }

            //if no perspective and disabled 3d (no preserve-3d)
            if (!preserve && !pers) {
                ma.setMatrix2D(ma.getMatrix2D());
            }

            //transform
            fin.appendPositionRaw(-or.x, -or.y, -or.z);
            fin.append(ma);
            fin.appendPositionRaw(or.x, or.y, or.z);
            
            //offset
            fin.appendPositionRaw(po.x, po.y, 0);
            
            //perspective
            fin.appendPositionRaw(-por.x, -por.y, 0);
            if (pers)
                fin.appendPerspective(pers);
            fin.appendPositionRaw(por.x, por.y, 0);

            return fin;
        }

        private testMatrix3D3(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var ac = document.createElement("div");
            ac.id = "ac-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            con.appendChild(a);
            a.appendChild(b);
            con.appendChild(ac);
            b.appendChild(bc);

            $(document).bind("mousemove",(evt) => {
                var fin = this.getResMat(a, new geom.Point2D());
                //                var pt = new geom.Point3D(64, 96, -256);
                var pt = new geom.Point3D();
                var tl = fin.transform3D(pt);
                this.applyPos(tl, ac);

                console.log(fin.toString(), tl.toString(), fin.getPerspective(),(1 / fin.m34) * fin.m31);
            }
                );
            $(document).trigger("mousemove");
            
            //            console.log(this.getOffestToCrossDoc(b, con));
        }

        //http://code.metager.de/source/xref/mozilla/B2G/gecko/layout/base/nsDisplayList.cpp#perspective
        private getResMat(aFrame: HTMLElement, aOrigin: geom.Point2D = new geom.Point2D()): geom.Matrix3D {


            if (!aFrame)
                return new geom.Matrix3D();

            var parentDisp = aFrame.parentElement;

            var toMozOrigin = geom.Point3D.extractOrigin(aFrame);
            var newOrigin = new geom.Point3D(aOrigin.x, aOrigin.y, 0);
            //            var bounds = geom.Box2D.extract(aFrame);

            var result = geom.Matrix3D.extract(aFrame);

            var p = parentDisp ? math.Number.parse(window.getComputedStyle(parentDisp).perspective, 0) : 0;
            if (parentDisp && p > 0) {
                var perspective = new geom.Matrix3D();
                perspective.m34 = -1 / p;
                //                perspective.m33 = 0;
                
                //                var toPerspectiveOrigin = geom.Point2D.extractPerspectiveOrigin(aFrame);
                var toPerspectiveOrigin = geom.Point2D.extractPerspectiveOrigin(parentDisp);
                perspective.changeBasis(toPerspectiveOrigin.clone().sub(toMozOrigin));
                result.append(perspective);
            }

            //            if (window.getComputedStyle(aFrame).transformStyle != "none") {
            //                if (parentDisp && window.getComputedStyle(parentDisp).transformStyle != "none") {
            if (parentDisp && window.getComputedStyle(parentDisp).transformStyle == "preserve-3d") {
                var pos = geom.Point2D.extractPosition(aFrame);
                var parent = this.getResMat(parentDisp, aOrigin.clone().sub(pos));
                result.changeBasis(newOrigin.clone().add(toMozOrigin));
                return result.append(parent);
            }
            
            //            result.app
            
            return result.changeBasis(newOrigin.clone().add(toMozOrigin));
        }

        private getOffestToCrossDoc(f: HTMLElement, aOther: HTMLElement | Window): geom.Point2D {
            var top: number = 0;
            var left: number = 0;
            while (f && f != aOther) {
                left += f.offsetLeft;
                top += f.offsetTop;
                var par = f.parentElement;
                if (par) {
                    f = par;
                }
                else {

                }
            }

            return new geom.Point2D(left, top);
        }

        private projectVector(m: geom.Matrix3D, v: geom.Point3D): geom.Point3D {

            var r: geom.Point3D = new geom.Point3D();
            var x: number = v.x;
            var y: number = v.y;
            var z: number = v.z;

            if (z == 0)
                z = 0.00001;

            var e: number[] = m.getData();
            var d: number = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]); // perspective divide
            
            r.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * d;
            r.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * d;
            r.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d;
            return r;
        }

        //        public GetResultingTransformMatrix(aFrame, aOrigin): void {
        //            //            NS_PRECONDITION(aFrame, "Cannot get transform matrix for a null frame!");
        //
        //            //            if (aOutAncestor) {
        //            //      var aOutAncestor = nsLayoutUtils::GetCrossDocParentFrame(aFrame);
        //            //            }
        //
        //            /* Account for the -moz-transform-origin property by translating the
        //             * coordinate space to the new origin.
        //             */
        //            var toMozOrigin = GetDeltaToMozTransformOrigin(aFrame, aAppUnitsPerPixel, aBoundsOverride);
        //            var newOrigin = new Point3D(aOrigin.x, aOrigin.y, 0.0);
        //
        //            /* Get the underlying transform matrix.  This requires us to get the
        //             * bounds of the frame.
        //             */
        //            var disp = aFrame.GetStyleDisplay();
        //            var bounds = (aBoundsOverride ? aBoundsOverride :
        //                nsDisplayTransform::GetFrameBoundsForTransform(aFrame));
        //
        //            /* Get the matrix, then change its basis to factor in the origin. */
        //            var dummy;
        //            var result;
        //            /* Transformed frames always have a transform, or are preserving 3d (and might still have perspective!) */
        //            if (disp .mSpecifiedTransform) {
        //                result = nsStyleTransformMatrix::ReadTransforms(disp ->mSpecifiedTransform,
        //                    aFrame.GetStyleContext(),
        //                    aFrame.PresContext(),
        //                    dummy, bounds, aAppUnitsPerPixel);
        //            } else {
        //                NS_ASSERTION(aFrame.GetStyleDisplay().mTransformStyle == NS_STYLE_TRANSFORM_STYLE_PRESERVE_3D ||
        //                    aFrame.GetStyleDisplay().mBackfaceVisibility == NS_STYLE_BACKFACE_VISIBILITY_HIDDEN,
        //                    "If we don't have a transform, then we must have another reason to have an nsDisplayTransform created");
        //            }
        //
        //            var nsStyleDisplay parentDisp = nsnull;
        //            nsStyleContext * parentStyleContext = aFrame ->GetStyleContext() ->GetParent();
        //            if (parentStyleContext) {
        //                parentDisp = parentStyleContext ->GetStyleDisplay();
        //            }
        //            if (nsLayoutUtils::Are3DTransformsEnabled() &&
        //            parentDisp && parentDisp ->mChildPerspective.GetUnit() == eStyleUnit_Coord &&
        //            parentDisp ->mChildPerspective.GetCoordValue() > 0.0) {
        //                gfx3DMatrix perspective;
        //                perspective._34 =
        //                -1.0 / NSAppUnitsToFloatPixels(parentDisp ->mChildPerspective.GetCoordValue(),
        //                    aAppUnitsPerPixel);
        //                /* At the point when perspective is applied, we have been translated to the transform origin.
        //                 * The translation to the perspective origin is the difference between these values.
        //                 */
        //                gfxPoint3D toPerspectiveOrigin = GetDeltaToMozPerspectiveOrigin(aFrame, aAppUnitsPerPixel);
        //                result = result * nsLayoutUtils::ChangeMatrixBasis(toPerspectiveOrigin - toMozOrigin, perspective);
        //            }
        //
        //            if (aFrame ->Preserves3D() && nsLayoutUtils::Are3DTransformsEnabled()) {
        //                // Include the transform set on our parent
        //                NS_ASSERTION(aFrame ->GetParent() &&
        //                    aFrame ->GetParent() ->IsTransformed() &&
        //                    aFrame ->GetParent() ->Preserves3DChildren(),
        //                    "Preserve3D mismatch!");
        //                gfx3DMatrix parent = GetResultingTransformMatrix(aFrame ->GetParent(), aOrigin - aFrame ->GetPosition(),
        //                    aAppUnitsPerPixel, nsnull, aOutAncestor);
        //                return nsLayoutUtils::ChangeMatrixBasis(newOrigin + toMozOrigin, result) * parent;
        //            }
        //
        //            return nsLayoutUtils::ChangeMatrixBasis
        //                (newOrigin + toMozOrigin, result);
        //        }
        //    }

        private testMatrix3D2(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var ac = document.createElement("div");
            ac.id = "ac-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            con.appendChild(a);
            a.appendChild(b);
            con.appendChild(ac);
            b.appendChild(bc);

            console.log(this.getOffestToCrossDoc(a, con));

            $(document).bind("mousemove",(evt) => {


                //                var fin = this.getResMat(a, new geom.Point2D());
                //                //                fin.invert();
                //                //                console.log(fin.toString());
                //
                //                var pt = new geom.Point3D();//256, 256, -256);
                //                //                var tl = this.projectVector(fin, pt);
                //                var tl = fin.transform3D(pt);
                //                //                                tl.x /= tl.w;
                //                //                                tl.y /= tl.w;
                //                //                                tl.z /= tl.w;
                //                console.log(tl.toString());
                //                this.applyPos(tl, ac);
                //
                //                return;
                
                //                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);

                //                //A
                //                var cam = new geom.Matrix3D();
                //                cam.appendPositionRaw(256, 256, 0);
                //                
                //                var obj = new geom.Matrix3D();
                //                obj.append(geom.Matrix3D.extract(a));
                //                
                //                var mod = new geom.Matrix3D();
                //                mod.append(obj);
                //                mod.append(cam.clone().invert());
                //                
                //                var per = new geom.Matrix3D();
                //                per.appendPerspective(600);
                //                
                //                
                //                //B
                //                cam.appendPositionRaw(64, 0, 0);
                //                
                //                obj.append(geom.Matrix3D.extract(b));
                //                
                //                mod.identity();
                //                mod.append(obj);
                //                mod.append(cam.clone().invert());
                
                //A
                var cam = new geom.Matrix3D();
                //                cam.appendPositionRaw(256, 256, 0);
                //                cam.appendPositionRaw(64, 0, 0);
                
                var per = new geom.Matrix3D();

                var ma = geom.Matrix3D.extract(a);
                var mb = geom.Matrix3D.extract(b);


                cam.identity();
                //                cam.appendPositionRaw(0, 0, 0);
                //                per.append(cam.clone().invert());
                //                per.appendPerspective(600);
                //                per.append(cam);
                
                //                cam.identity();
                //                cam.appendPositionRaw(256, 0, 0);
                //                per.append(cam.clone().invert());
                //                per.appendPerspective(600);
                //                per.append(cam);

                //                console.log((1 / per.m34) * per.m31);
                //                console.log((1 / per.m34) * per.m32);

                //                var val = (1 / 600) + (1 / 300);
                
                //                console.log(1 / val);
                
                cam.identity();
                cam.appendPositionRaw(128, 0, 0);
                per.append(cam.clone().invert());
                per.appendPerspective(300);
                per.append(cam);

                //                console.log((1 / per.m34) * per.m31);
                //                console.log((1 / per.m34) * per.m32);
                
                //                console.log(per.getPerspective());
                //                console.log(per.toString());

                var obj = new geom.Matrix3D();
                //                obj.append(ma);
                obj.append(mb);
                
                //                var mod = new geom.Matrix3D();
                //                mod.append(obj);
                //                mod.append(cam.clone().invert());
                
                var fin = new geom.Matrix3D();
                fin.append(obj);
                fin.append(per);
                
                //                var vp = new geom.Viewport();
                //                vp.focalLength = fin.getPerspective();
                //                vp.width = 512;
                //                vp.height = 512;
                //                vp.origin.x = (1 / -fin.m34) * fin.m31;
                //                vp.origin.y = (1 / -fin.m34) * fin.m32; 
                //                var un = this.unp(screen, vp, fin);
                //                console.log(un);
                
                var tl = fin.transformRaw(512, 0, 0);
                tl.x /= tl.w;
                tl.y /= tl.w;
                tl.z /= tl.w;
                
                //                tl.x += 128;
                //                tl = cam.transform(tl);
                
                //                console.log(tl);
                
                this.applyPos(tl, ac);
            }
                );
        }

        private testMatrix3D(): void {
            var con = document.getElementById("content");

            var a = document.createElement("div");
            a.id = "a-cont";
            var b = document.createElement("div");
            b.id = "b-cont";
            var ac = document.createElement("div");
            ac.id = "ac-cont";
            var bc = document.createElement("div");
            bc.id = "bc-cont";

            con.appendChild(a);
            a.appendChild(b);
            a.appendChild(ac);
            b.appendChild(bc);

            $(document).bind("mousemove",(evt) => {
                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);

                var vp = new geom.Viewport();
                var focalMatrix = new geom.Matrix3D();

                var ma = geom.Matrix3D.extract(a);
                vp.fromElement(con);

                vp.focalLength = focalMatrix.prependPerspective(vp.focalLength).getPerspective();
                var locA = this.applyPos(this.unp(screen, vp, ma), ac);

                var mb = geom.Matrix3D.extract(b);

                var accm = new geom.Matrix3D();
                accm.append(ma);
                accm.append(mb);

                vp.fromElement(b.parentElement);

                var tes = new geom.Matrix3D();
                
                //                var val = (1 / 800) + (1 / 300);
                //                console.log(1 / val);
                //                
                //                tes.prependPerspective(800);
                //                tes.prependPerspective(300);
                //                console.log(tes.getPerspective());
                
                //calc new focal length
                //                var val = (1 / 600) + (1 / 300);
                //                val = (1 / val);
                //                console.log(val);
                
                //                tes.prependPerspective(800);
                //                tes.prependPerspective(300);
                //                console.log(tes.getPerspective());
                
                //A -> perspective-origin: 256px 256px; PERS: 600
                //B -> perspective-origin: 0px 0px; PERS: 300
                //FOC -> 200
                //PERS-> 85px 85px
                
                //                var te = new geom.Point3D(128, 128, 1);
                //                te.unproject(vp.focalLength, new geom.Point2D(0, 0));
                //                console.log(te.toString());
                
                var t1 = new geom.Matrix3D();
                
                //                var pos = new geom.Point3D(256, 128, 64);
                var pos = ma.transform(new geom.Point3D());
                var sco = new geom.Point2D(256, 256);
                pos.project(600, sco);
                pos.z = 0;
                console.log(pos);
                //                var test = ma.transformRaw(0, 0, 0);
                
                //                t1.appendPosition(pos);
                t1.appendPositionRaw(256, 256, 0);
                t1.appendPerspective(600);
                t1.appendPositionRaw(-256, -256, 0);
                //                pos.scaleBy(-1);
                //                t1.appendPosition(pos);
                
                var t2 = new geom.Matrix3D();
                t2.appendPositionRaw(64, 0, 0);
                t2.appendPerspective(300);
                t2.appendPositionRaw(-64, 0, 0);
                var t3 = geom.Matrix3D.multiply(t1, t2);
                //                t3.prepend(accm);
                
                //                var t1 = geom.Matrix3D.extractPerspective(con);
                //                var t2 = geom.Matrix3D.extractPerspective(a);
                //                var t3 = geom.Matrix3D.multiply(t1, t2);
               
                //                t3.append(ma);
                
                //                console.log(vp.width);
                //                console.log(t3.toString());
                vp.focalLength = t3.getPerspective();
                vp.origin.x = (1 / -t3.m34) * t3.m31;
                vp.origin.y = (1 / -t3.m34) * t3.m32;
                //                console.log(vp.toString());
                
                //                vp.origin.x += 200;
                
                //                vp.origin.x = mb.transform(new geom.Point3D(vp.origin.x, vp.origin.y, 0)).x;
                //                vp.origin.y = mb.transform(new geom.Point3D(vp.origin.x, vp.origin.y, 0)).y;
                
                //                vp.origin.x += 200;
                //                vp.origin.x += 3
                
                //                screen.x -= 200;
                //                vp.origin.x += 200;
                
                //                screen.x -= 256;
                //                this.applyPos(this.unp(screen, vp, accm), bc);
                
                //                locA = t1.transform(locA);
                this.applyPos(this.unp(locA, vp, mb), bc);
            });
        }

        private applyPos(pos: geom.Point3D, visual: HTMLElement): geom.Point3D {
            var x = math.Number.clamp(pos.x, -2048, 2048);
            var y = math.Number.clamp(pos.y, -2048, 2048);
            visual.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
            return pos;
        }

        private unp(screen: geom.Point3D, vp: geom.Viewport, m: geom.Matrix3D): geom.Point3D {
            m = m.clone();

            //unproject
            var dir = new geom.Point3D(screen.x, screen.y, -1);
            dir.unproject(vp.focalLength, vp.origin);
            //create plane
            var pl = new geom.Plane3D();
            pl.fromPoints(
                m.transform(new geom.Point3D(0, 0, 0)),
                m.transform(new geom.Point3D(1, 0, 0)),
                m.transform(new geom.Point3D(0, 1, 0))
                );
            
            //intersect plane -- extract z
            var fin: geom.Point3D = pl.intersectLine(screen, dir);
            fin.z *= -1;
            fin.x = screen.x;
            fin.y = screen.y;
            
            //unproject intersection to get the final position in scene space
            fin.unproject(vp.focalLength, vp.origin);
            
            //transform from scene to local
            m.invert();
            return m.transform(fin);
        }

        private testMatrix3DOLD(): void {
            var a = $("<div id='a-cont'></div>");
            $("#content").append(a);

            var b = $("<div id='b-cont'></div>");
            a.append(b);

            var ac = $("<div id='ac-cont'></div>");
            a.append(ac);

            var bc = $("<div id='bc-cont'></div>");
            b.append(bc);

            var vp = new geom.Viewport();
            vp.fromElement($("#content")[0]);

            $(document).bind("mousemove",(evt) => {

                var screen = new geom.Point3D(evt.pageX, evt.pageY, 0);

                //create concatenated matrix
                var m: geom.Matrix3D = geom.Matrix3D.extract(a[0]);
                m.prepend(geom.Matrix3D.extract(b[0]));
                //unproject
                var dir = new geom.Point3D(screen.x, screen.y, 1);
                dir.unproject(vp.focalLength, vp.origin);
                //create plane
                var pl = new geom.Plane3D();
                pl.fromPoints(
                    m.transform(new geom.Point3D(0, 0, 0)),
                    m.transform(new geom.Point3D(1, 0, 0)),
                    m.transform(new geom.Point3D(0, 1, 0)));
                //intersect plane -- extract z
                var fin: geom.Point3D = pl.intersectLine(screen, dir);
                fin.z *= -1;
                fin.x = screen.x;
                fin.y = screen.y;
                //unproject intersection to get the final position in scene space
                fin.unproject(vp.focalLength, vp.origin);
                //transform from scene to local                
                m.invert();
                var loc: geom.Point3D = m.transform(fin);
                loc.x = math.Number.clamp(loc.x, -1024, 1024);
                loc.y = math.Number.clamp(loc.y, -1024, 1024);
                bc.css("transform", "translate(" + Math.round(loc.x) + "px," + Math.round(loc.y) + "px)");
            });
        }

        private testObserver(): void {

            var d = $("<div>A</div>");
            $("body").append(d);
            var o = d[0];
            Object.observe(o, function(a): void {
                console.log(a);
            });
            o.style.width = "200px";
            o.style.height = "200px";
            o.style.backgroundColor = "#FF00FF";
            //ARRGHHH funzt nit
        }

        private testPosition(): void {
            //            //$("body").css("overflow", "hidden");
            //            $("body").css("height", "200%");
            //
            //            var a = $("<div id='a-cont'>A</div>");
            //            $("#content").append(a);
            //
            //            var e = $("<div id='b-cont'>B</div>");
            //            e.css("position", "absolute");
            //            a.append(e);
            //            //$("#content").append(e);
            //
            //            var p = new jsidea.layout.Position();
            //            p.my.px = "left";
            //            p.my.py = "top";
            ////            p.my.x = "-50%";
            ////            p.my.y = "-50%";
            //            p.of = window;
            //            $(document).bind("mousemove",(evt) => {
            //                p.at.x = this.pageX;
            //                p.at.y = this.pageY;
            //                //p.apply(e[0]);
            //                p.transform(e[0]);
            //            });
            //$("body").css("overflow", "hidden");

            var a = $("<div id='a-cont'></div>");
            $("#content").append(a);
            var e = $("<div id='b-cont'></div>");
            e.css("position", "absolute");
            a.append(e);
            
            //            var mt = geom.Matrix3D.extract(a[0]);
            //            mt.invert();
            
            $(document).bind("mousemove",(evt) => {
                var pt = a.globalToLocal(this.pageX, this.pageY);
                //                var pt = mt.transformRaw(this.pageX, this.pageY, 0);
                e.css("transform", "translate(" + Math.round(pt.x) + "px, " + Math.round(pt.y) + "px)");
                //                e.css("top", Math.round(pt.y) + "px");
                //                e.css("left", Math.round(pt.x) + "px");
            });

            //https://gist.github.com/turbodrive/dede2748fadb7e8dfb13
            var viewportWidth = 1280;
            var focalLength = 28;
            var filmWidth = 36;
            //var cssPerspective = viewportWidth / (filmWidth / focalLength);
            var cssPerspective = viewportWidth / (2 * Math.tan(Math.atan(filmWidth / (2 * focalLength))));
        }

        private testXMLConverter(): void {
            var x = new jsidea.model.conversion.XMLConverter();
        }

        private testPoint(): void {
            var p = new jsidea.geom.Point2D(5, 5);
            p.x = 5;
            p.y = 5;
            console.log(p.toString());
            console.log(p.length());
            p.normalize();
            console.log(p.length());
        }

        private testEventDispatcher(): void {
            var d = new jsidea.events.EventDispatcher();
            d.bind("click.setup",(e: jsidea.events.IEvent) => console.log(e.eventType));
            d.trigger(".setup");
        }

        private testMatrix(): void {
            //            var m = new jsidea.geom.Matrix2D();
            //            m.appendPositionRaw(-100, -100);
            //            m.appendScaleRaw(2, 2);
            //            m.appendRotation(45);
            //            m.appendPositionRaw(100, 100);
            //            console.log(m.decompose());
            //
            //            var div = $("<div></div>");
            //            div.css({ backgroundColor: "#FF00FF", width: "200px", height: "200px", top: "0", left: "0", position: "absolute", transformOrigin: "0% 0%", transition: "all 1s" });
            //            $("#content").append(div);
            //            console.log(m.getCSS());
            //            div.delay(500).queue(() => div.css({ transform: m.getCSS() }));
            //
            //            div.append($("<div style='top:50%; left:50%; position:absolute; width:10px; height:10px; background-color:#FF0000'></div>"));
            //            var p = m.transform(0, 0);
            //            console.log(p.toString());
            
            var m = new geom.Matrix2D();
            m.appendPositionRaw(100, 80);
            m.appendScaleRaw(2, 4);
            m.appendRotation(45);
            var ma = m.getMatrix3D();
            var mat = ma.getMatrix2D();

            var p = new geom.Point2D(1, 1);
            var pt = new geom.Point3D(1, 1);

            console.log(m.transformRaw(p.x, p.y));
            console.log(ma.transform(pt));
            console.log(mat.transformRaw(p.x, p.y));
        }

        public toString(): string {
            return "[" + this.qualifiedClassName() + "]";
        }
    }
}

interface JQuery {
    globalToLocal(x: number, y: number): jsidea.geom.IPoint2DValue;
    localToGlobal(x: number, y: number): jsidea.geom.IPoint2DValue;
}

(function($) {
    $.fn.globalToLocal = function(x: number, y: number) {
        return jsidea.geom.Transform.getGlobalToLocal(this[0], x, y);
    };
    $.fn.localToGlobal = function(x: number, y: number) {
        return jsidea.geom.Transform.getLocalToGlobal(this[0], x, y);
    };
} (jQuery));