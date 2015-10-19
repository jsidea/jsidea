interface HTMLElement {
    matches(selector: string): boolean;
}

interface Window {
    JSON: JSON;
}

interface Object {
    observe(beingObserved: any, callback: (update: any) => any, types?: string[]): void;
}

interface CSSStyleDeclaration {
    willChange: string;
}

interface MSStyleCSSProperties {
    willChange: string;
}

interface CanvasRenderingContext2D {
    getTransform(): number[];
}

interface HTMLCanvasElement {
    hasContext(): string;
}