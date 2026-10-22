import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import Eleventy from '@11ty/eleventy';
import { configureEleventyData } from '../../script/helper/eleventy-data.mjs';

test('runtime catalogue is not inherited; global JSON and explicit paginated directory data still work', async (t) => {
    // Eleventy resolves input paths against cwd; keep the fixture on its drive.
    const fixtureRoot = path.resolve('report');
    await mkdir(fixtureRoot, { recursive: true });
    const directory = await mkdtemp(path.join(fixtureRoot, 'mathjslab-eleventy-data-'));
    t.after(async () => {
        assert.equal(path.dirname(directory), fixtureRoot);
        assert.ok(path.basename(directory).startsWith('mathjslab-eleventy-data-'));
        await rm(directory, { recursive: true, force: true });
    });
    const input = path.join(directory, 'input');
    const output = path.join(directory, 'output');
    await mkdir(path.join(input, 'example'), { recursive: true });
    await mkdir(path.join(input, 'data'));
    await writeFile(path.join(input, 'data/site.json'), '{"label":"global JSON"}');
    await writeFile(path.join(input, 'example/example.json'), '{"leaked":"runtime catalogue"}');
    await writeFile(
        path.join(input, 'example/example.11tydata.mjs'),
        `export default {
        languages: ['en', 'es', 'pt'],
        pagination: { data: 'languages', size: 1, alias: 'lang' },
        eleventyExcludeFromCollections: true,
        permalink: (data) => data.lang + '/lesson.txt',
    };`,
    );
    await writeFile(path.join(input, 'example/lesson.njk'), '{{ site.label }}|{{ lang }}|{{ leaked | default("absent") }}');
    const configPath = path.join(directory, 'eleventy.cjs');
    await writeFile(configPath, 'module.exports = () => ({dir: {data: "data"}, templateFormats: ["njk"]});');
    const eleventy = new Eleventy(path.relative(process.cwd(), input), path.relative(process.cwd(), output), {
        configPath,
        quietMode: true,
        config: (configuration) => {
            // The disposable fixture intentionally lives in ignored report/.
            configuration.setUseGitIgnore(false);
            configureEleventyData(configuration);
        },
    });
    await eleventy.write();
    for (const locale of ['en', 'es', 'pt']) {
        assert.equal(await readFile(path.join(output, locale, 'lesson.txt'), 'utf8'), `global JSON|${locale}|absent`);
    }
});
