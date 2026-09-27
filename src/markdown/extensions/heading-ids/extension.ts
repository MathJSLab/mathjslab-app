import type { MarkdownExtension } from '../../../MarkdownEngine';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { headingIdsManifest } from './manifest';

export const headingIdsExtension = (): MarkdownExtension => ({
    name: headingIdsManifest.name,
    manifest: headingIdsManifest,
    marked: gfmHeadingId(),
});
