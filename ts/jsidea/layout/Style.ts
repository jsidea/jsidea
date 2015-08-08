module jsidea.layout {
    export class Style {
        public static create(element: HTMLElement): CSSStyleDeclaration {
            //old safari 5.1.7
            //its immutable???
            //            var style = window.getComputedStyle(element);
            //            if(system.Caps.isSafari && system.Caps.isWindows)
            //                style.transform = style["webkitTransform"];
            return window.getComputedStyle(element);
        }
    }
}