interface HTMLElement {
    matches(selector: string): boolean;
}

interface Object {
    observe(beingObserved: any, callback: (update: any) => any, types?: string[]): void;
}

interface CanvasRenderingContext2D {
    getTransform(): number[];
}

interface CSSStyleDeclaration {
    willChange: string;
}


interface MSStyleCSSProperties {
    willChange: string;
}

interface HTMLCanvasElement {
    hasContext(): string;
}