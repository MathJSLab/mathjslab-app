# Markdown browser tests

These tests load the standalone ESM distribution through a real HTTP server.
Chromium is the default project. Install it once with:

```console
npx playwright install chromium
```

Run the default suite with `npm run test:browser`. To exercise every configured
engine after installing their browser binaries, run `npm run test:browser:all`.
Artifacts from failed tests are written to `test-results/playwright`; the HTML
report used in CI is written to `playwright-report`.

The accessibility suite covers fragment and collection navigation, focus after
page changes, live announcements, `aria-current`, keyboard shortcuts, arrow
navigation in tables of contents, the narrow container layout, and reduced
motion scrolling.
