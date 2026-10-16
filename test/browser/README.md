# Markdown browser tests

These tests load the standalone ESM distribution through a real HTTP server.
Chromium is the default project. Install it once with:

```console
npx playwright install chromium
```

Run the default suite with `npm run test:browser`. To exercise every configured
engine after installing their browser binaries, run `npm run test:browser:all`.
Both commands build the standalone component, the test Worker and the consumer
application. A direct `npx playwright test` assumes those builds already exist.
The fixture server resolves the installed `mathjslab` package; it does not need
a sibling kernel repository. `npm run test:browser:serve` uses the same server
for manual investigation. Artifacts from failed tests are written to
`test/result/playwright`; the HTML report used in CI is written to
`playwright-report`.

Chromium diagnostic logs are written to `report/chromium-debug.log`. Store
captured command output in `report/` as well, rather than creating `.log` files
at the repository root. For example, in PowerShell:

```powershell
New-Item -ItemType Directory -Path report -Force | Out-Null
npm run test:unit *> report/unit-tests.log
```

The accessibility suite covers fragment and collection navigation, focus after
page changes, live announcements, `aria-current`, keyboard shortcuts, arrow
navigation in tables of contents, the narrow container layout, and reduced
motion scrolling.

The corpus under `test/markdown/` supplies music, maps and 3D fixtures and is
also checked through the application facade. The live map-provider test remains
opt-in (`MARKDOWN_LIVE_MAPS=1`); ordinary map tests use deterministic tiles.
WebGL checks may be skipped when the browser does not provide a usable context.
