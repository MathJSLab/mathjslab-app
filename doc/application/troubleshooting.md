# Rendering diagnostics and troubleshooting

Use current builds and reproducible tests when investigating rendering. Saved
screenshots and historical test counts describe one run and are not a contract.

## Maps with gaps despite successful image requests

A tile can return HTTP 200 and still be incorrectly positioned. Leaflet's CSS
must be available inside the component's Shadow DOM. In the consumer webpack
build, `leaflet.css?inline` must use `asset/source` and be excluded from
generic SCSS/CSS loader rules. A linked package may resolve outside the app's
`node_modules`, so that directory exclusion alone is insufficient.

Restart the development server after changing loader configuration. The
`markdown-map-grid.spec.ts` regression checks absolute tile positioning and
coverage at 81 viewport points on desktop and at 390 pixels. Ordinary tests use
deterministic tiles; live provider checks are opt-in.

## Empty extension output or missing resources

Inspect the document's `markdown-diagnostic` events, local alerts and network
requests. The package retains source text when an extension fails. A diagnostic
can include the extension, code, document URL and source location. Relative
resources resolve against the loaded document, not the surrounding page.

Extension styles must be installed in the correct Shadow DOM. SVG music output
must retain referenced definitions; a canvas node alone does not prove that a
3D model was drawn. Browser audit tests check noteheads, computed highlight
colors, actual geometry pixels, local errors and neighboring extension output.

Map failures should leave vector features visible and report a local warning.
Provider selection and attribution belong to each map instance. The app's
default configuration is separate from the package's vector-only default.

## Timing, resize and disposal

Renderer animation and resource cleanup belong to the installed Markdown
package. When investigating persistent work, check visibility, pending frames
and disposal with the browser lifecycle tests. A long-task warning from a
layout library is not automatically a rendering exception.

Replacing a document aborts obsolete operations. `net::ERR_ABORTED` may be an
expected cancellation; verify that the current document completes and that
there is no stale output. External badges in the startup README are recorded
separately from the document under test.

## Test fixtures and results

The full extension exercise is `test/browser/fixtures/extension-showcase.md`.
It is test input, not an API manual. The audit and map-grid tests use it in the
standalone component and in the application.

```sh
npm run test:browser
```

After the builds exist, focused runs can use:

```sh
npx playwright test test/browser/markdown-extension-audit.spec.ts test/browser/markdown-map-grid.spec.ts --project chromium
```

Generated JSON, screenshots, traces and videos live in
`test/result/playwright`. Chunk measurements live in
`test/result/chunk-baseline.json`. Re-run checks after relevant changes;
historical audit logs are not maintained documentation.
