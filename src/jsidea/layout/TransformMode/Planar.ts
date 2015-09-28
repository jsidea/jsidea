namespace jsidea.layout.TransformMode {
    class Planar implements ITransformMode {
        public extract(transform: Transform, matrix: geom.Matrix3D): void {
            var element = transform.element;
            var globalBounds = geom.Rect2D.getBounds(element);
                        
            //collect elements
            var elements: HTMLElement[] = [];
            while (element) {
                elements.push(element);
                element = element.parentElement;
            }
            elements.reverse();

            //accumulate matrix
            var parentStyle: CSSStyleDeclaration = null;
            var l = elements.length;
            for (var i = 0; i < l; ++i) {
                element = elements[i];
                var style = window.getComputedStyle(element);
                var isForced2D = this.getIsForced2D(element, style, parentStyle);
                matrix.prependCSS(style.transform, isForced2D);
                parentStyle = style;
            }
            
            //transform to fit
            element = transform.element;
            var localBounds = matrix.bounds(0, 0, element.offsetWidth, element.offsetHeight);
            var scX = globalBounds.width / localBounds.width;
            var scY = globalBounds.height / localBounds.height;
            matrix.appendScaleRaw(scX, scY, 1);
            matrix.appendPositionRaw(-localBounds.x, -localBounds.y, 0);
            matrix.appendPositionRaw(globalBounds.x, globalBounds.y, 0);
        }

        //return true if the elements computed transform-style is "wrongly" set to an matrix3d but its not actually set
        private getIsForced2D(element: HTMLElement, style: CSSStyleDeclaration, parentStyle: CSSStyleDeclaration): boolean {
            if (!element.parentElement || system.Browser.isInternetExplorer || element.tagName == "body" || !(style.transform != "none"))
                return false;

            var isScrollable = parentStyle.overflow != "visible";
            var isTransformed = parentStyle.transform != "none";
            var perspective = (system.Engine.isWebKit && isTransformed && isScrollable) ? 0 : math.Number.parse(parentStyle.perspective, 0);
            var isPreserved3d = parentStyle.transformStyle == "preserve-3d";
            if ((!isPreserved3d && perspective == 0) || parentStyle.overflow != "visible")
                return true;

            return false;
        }
    }

    export var PLANAR: ITransformMode = new Planar();
}