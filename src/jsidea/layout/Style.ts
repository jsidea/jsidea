module jsidea.layout {
    export class Style {
        public static create(element: HTMLElement): CSSStyleDeclaration {
            return window.getComputedStyle(element);
        }
    }
}