/** Text may be shared across locales or translated. */
export type LocalizedText = string | Record<string, string>;

interface ExampleMetadata {
    caption: LocalizedText;
    description: LocalizedText;
}

export interface ExampleFile extends ExampleMetadata {
    file: string;
    directory?: never;
    children?: never;
}

export interface ExampleDirectory extends ExampleMetadata {
    directory: string;
    children: Record<string, ExampleEntry>;
    file?: never;
}

export type ExampleEntry = ExampleFile | ExampleDirectory;

export interface ExampleLeaf {
    keys: string[];
    path: string;
    entry: ExampleFile;
}
