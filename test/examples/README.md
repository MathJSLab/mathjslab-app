# Example manifests and directory navigation

Run the focused checks with:

```sh
node --test test/examples/example-assets.test.cjs
node --experimental-vm-modules node_modules/jest/bin/jest.js --selectProjects example-tests --runInBand
npm run test:examples
npx tsc --project tsconfig.build.json --noEmit
npm run build
npx playwright test test/browser/examples.spec.ts --project chromium
```

The asset tests use temporary directories. They check that validation completes
before stale files can be deleted or the bundled first example replaced. The
browser test uses the production build and saves screenshots for desktop and
mobile widths in both themes.

The runtime catalogue checks also verify translated reference URLs when a
template declares `comments.reference`, including preservation in the generated
files. The newest browser scenario loads an algorithm, a data structure and
examples from learning, geometry, images and simulation, checking that
directory navigation preserves edited content until a file is selected.

Markdown launchers are evaluated with a captured `markdown()` host function in
the headless runner. Each generated script must call the exact raw GitHub URL
for its locale once. Browser coverage uses the real application command with
deterministic remote-document and relative-image responses in all three
locales.

Manifest files retain `{ file, caption, description }`. A directory uses
`{ directory, caption, description, children }`, where `children` is another
record of entries. Paths are relative to the parent directory; templates live
at `example/<accumulated directories>/<file>.njk`. The generated localized
files live at `dist/example/<locale>/<accumulated directories>/<file>`. Only
declared entries appear in the browser, in manifest order. Initial selection is
the first file in depth-first order, skipping empty directories.
