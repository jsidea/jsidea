//@REQUIRE[libs/canvas_get_transform.js]
//@REQUIRE[libs/canvas_has_context.js]
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