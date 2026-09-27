declare module 'vega-embed' {
    type Result = {
        view: { resize(): unknown; runAsync(): Promise<unknown> };
        finalize(): void;
    };
    export default function embed(element: HTMLElement | string, spec: object, options?: object): Promise<Result>;
}

declare module 'verovio/wasm' {
    export default function createVerovioModule(): Promise<unknown>;
}

declare module 'verovio/esm' {
    export class VerovioToolkit {
        public constructor(module: unknown);
        public setOptions(options: object): void;
        public loadData(data: string): boolean;
        public renderToSVG(page: number, options?: object): string;
        public destroy(): void;
    }
}
