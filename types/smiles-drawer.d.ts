declare module 'smiles-drawer' {
    type SmilesTree = object;

    class SvgDrawer {
        public constructor(options?: { width?: number; height?: number }, clear?: boolean);
        public draw(tree: SmilesTree, target: SVGSVGElement, themeName?: 'light' | 'dark'): SVGSVGElement;
    }

    export default class SmilesDrawer {
        public static readonly SvgDrawer: typeof SvgDrawer;
        public static parse(smiles: string, successCallback: (tree: SmilesTree) => void, errorCallback?: (error: Error) => void): void;
    }
}
