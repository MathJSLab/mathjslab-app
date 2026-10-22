import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ESLint } from 'eslint';
import YAML from 'yaml';

test('CI validates the locked checkout without replacing project configuration', async () => {
    const config = YAML.parse(await readFile('.circleci/config.yml', 'utf8'));
    const commands = config.jobs.build.steps.flatMap((step) => step.run?.command ?? []).join('\n');
    assert.match(commands, /npm ci/);
    assert.doesNotMatch(commands, /clone:copy:clean:repository/);
    const copy = JSON.parse(await readFile('copy.repo.config.json', 'utf8'));
    const destinations = copy.files.map((entry) => (typeof entry === 'string' ? entry : (entry.dest ?? entry.src)));
    for (const file of ['eslint.config.cjs', 'eleventy.build.mjs']) {
        assert.ok(!destinations.includes(file), `${file} must remain project-owned`);
    }
    const pkg = JSON.parse(await readFile('package.json', 'utf8'));
    assert.doesNotMatch(pkg.scripts['precopy:repository'], /copy\.repo\.config\.json/);
    assert.doesNotMatch(pkg.scripts['clean:copy'], /rm -rf copy\.repo\.config\.json/);
});

test('browser validation scripts parse with the effective ESLint configuration', async () => {
    const eslint = new ESLint({ fix: false });
    for (const filePath of ['script/test-hdl-browser.mjs', 'script/test-release-menu.mjs']) {
        const source = (await readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
        for (const endOfLine of ['\n', '\r\n']) {
            const [result] = await eslint.lintText(source.replace(/\n/g, endOfLine), { filePath });
            assert.equal(result.errorCount, 0, `${filePath} (${JSON.stringify(endOfLine)}): ${JSON.stringify(result.messages)}`);
        }
    }
    const [invalid] = await eslint.lintText('await ( ;\n', { filePath: 'script/test-hdl-browser.mjs' });
    assert.ok(invalid.fatalErrorCount > 0, 'invalid syntax must still fail');
});
