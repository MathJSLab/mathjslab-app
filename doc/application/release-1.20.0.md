# Release 1.20.0 preparation

Date: 2026-10-20. This report concerns the installed, published
`mathjslab-markdown@0.7.1`, not the historical sibling development distribution.
No commit, push, npm publication or deployment is part of this preparation.

## Installation and runtime

The application retains `mathjslab-markdown: ^0.7.1`; package-lock.json resolves
0.7.1 from registry.npmjs.org with SHA-512 integrity. The installed directory
is a physical registry installation, not a sibling junction. `mathjslab`
remains installed and locked at 2.9.0. No unrelated dependency upgrade was run.

The HDL verifier now supports this registry installation, checks the installed
version against the lock, rejects development links in registry mode, verifies
the pinned compiler hashes and compares complete deployed inventories and bytes.
Sibling/tarball checks remain optional development paths. Historical vendor
artifacts remain on disk but are ignored by Git; the application does not
consume or deploy them. The optional pack helper now derives the archive name
from the sibling version instead of hardcoding 0.6.1.

Both Webpack pipelines preserve all **32 HDL files**, including NVC, GHDL,
Icarus runtime notices, libraries, loaders and Wasm. netlistsvg is resolved from
the installed Markdown package; its own ELK browser bundle is retained.
Authorization, document policies, session limits, scheduling and disposal are
unchanged. Compilation, synthesis and simulation remain client-side, with no
execution backend, token, storage setup, native visitor tools or COOP/COEP.

The published toolchain lock records corresponding Icarus sources and scoped
reproduction for Icarus, NVC and GHDL. Those facts supersede the historical
release blockers in the [older integration report](hdl-validation.md).
This application preparation verifies the published assets; it does not
independently rebuild the compilers or claim cross-platform reproducibility.
The package's supported VHDL-2008 library/digital-port profile still applies.

## Examples

The offline canonical audit found that all 105 teaching notes and localized
indexes were already represented. The new collection is separate from those
106 documents per language. Its Portuguese contents was added to the Markdown
electronics menu in all three locales. English/Spanish labels explicitly say
that the content is Portuguese. No translation or unwritten chapter is invented.
The contents links to the available introduction chapter using normal relative
Markdown navigation. Its public raw GitHub URL responded HTTP 200.

There are now **107 Markdown launchers, 486 templates and 1,458 generated
localized example scripts**. The launcher uses explicit
`markdownDirectory: "digital-electronics/pt"`; the other launchers continue
selecting their matching locale. Both interpreter and metadata audits validate
this intentional exception.

## Preparation workflow

`do:all` was deliberately not executed. It removes generated files/reports,
updates unrelated dependencies, formats the whole repository and ends in Git
add/commit/push. The requested safe steps were executed separately, preserving
existing changes and reports. Version metadata was advanced to **1.20.0** in
package.json and both root lockfile version fields. CHANGES.md describes the
resulting behavior; git-commit.config.json contains the prepared message only.

The first general run exposed a legacy VM DOM missing document.baseURI. Giving
that test DOM a normal localhost base fixed all 16 legacy tests without changing
the browser runtime. The first full example run exposed three test expectations
still assuming locale-specific directories for the shared contents. The generated
URLs were correct; the remaining assertion was updated and rerun.

Reports and screenshots are generated under report/release-1.20-* and the
registry-specific HDL report suffix. Acceptance results are recorded below
after the respective runs complete. Node/JSDOM results are complementary to
actual-browser verification, not a substitute for it.

## Executed checks

- `npm run build:script`: passed.
- General test chain: documentation, TypeScript, **35 unit tests in nine
  suites**, **5 infrastructure tests**, **16 legacy Markdown tests**, all passed.
  The final chain used `npm --ignore-scripts test` because its Eleventy/assets
  prerequisite had already completed; it skips duplicate lifecycle hooks, not
  the explicitly invoked checks in the test script.
- Full example validation: **486 templates, 1,458 successful locale executions,
  1,023 result assertions, 75 plot requests and 321 Markdown loads**. The separate
  canonical audit confirms 106 localized documents per language plus the one
  shared Portuguese contents launcher. The focused Markdown run also passed
  all 321 executions.
- Full project ESLint: **zero errors**, one existing console warning in
  src/main.ts. Generated report/result/cache directories are now excluded;
  otherwise the general lint command parsed old Webpack bundles and consumed
  excessive memory. Only line endings in components.ts needed formatting.
- Standalone component/declarations: passed, three dependency/bundle warnings,
  Webpack 276.681 s. Test Worker build: passed, three bundle warnings, 19.139 s.
- App development: passed, 35.208 s. App production: passed, three existing
  bundle/performance warnings, 228.401 s. The existing Eleventy/assets build
  from pretest was reused for `npm run build:production`; no clean/update or
  rebuild of the Markdown package occurred during browser acceptance.

### Published HDL in real browsers

| Stable distribution | Installed browser | Passed | Page errors | Requests |
| --- | --- | ---: | ---: | ---: |
| Development dev-server | Chrome 155.0.8059.85 | 77 | 0 | 1,432 |
| Production, GET-only static files | Chrome 155.0.8059.85 | 77 | 0 | 1,433 |
| Same production files | Edge 155.0.4283.62 | 77 | 0 | 1,447 |

**231 integrated checks passed** against the registry package. They retain the
ten lesson families in pt/en/es, actual VHDL/Verilog source execution,
synthesis/netlists, inputs/clocks/reset, history/checks, Run/Pause/Step/Reset,
inspection/exports, stable recordings, endpoint delta propagation, times through
30 microseconds, novel sources, document denial and Worker termination on
reset/replacement/navigation. The previously failing signal-free NVC source now
successfully exports an empty VCD with its verified 1 ns endpoint and no invented
signals; the app test already included the package's corrected assertion.

All **4,312 recorded requests** were GET without bodies. Each run's only
84 external attempts were README images blocked by CSP. HDL toolchains,
libraries and all nine Wasm URLs were local under /lab/hdl/, with correct Wasm
MIME. No HDL source upload or external processing occurred. There were no
COOP/COEP headers and crossOriginIsolated remained false. Subdirectory evidence
concerns the HDL URLs; legacy root-relative shell resources remain served by the
harness. Firefox, Safari, mobile devices and complete VHDL language coverage
are not claimed by these runs.

Reports preserve the old local-distribution results:

- report/hdl-development-chrome.exe-registry-0.7.1.json
- report/hdl-production-chrome.exe-registry-0.7.1.json
- report/hdl-production-msedge.exe-registry-0.7.1.json

Final inventory and direct byte comparisons passed in all four trees: installed
package, development app, production app and standalone component. The initial
32 hashes stayed unchanged throughout. Evidence:
report/release-1.20-assets-initial.json and release-1.20-assets-final.json.

### Actual public examples menu

Chrome 155.0.8059.85 passed the real menu flow in pt/en/es, downloading the
public Portuguese contents and following its relative chapter link. The test
checks the editor launcher, chapter content and Mermaid SVG rendering, with
screenshots at 390 px. Three locale flows passed, zero page errors, 183 GET
requests. These public Markdown downloads are content, not delegated processing.
For this check alone the static host CSP permits raw.githubusercontent.com in
connect-src; the separate HDL matrix retains its self-only connect policy.

Run `node script/test-release-menu.mjs` after the production build (requires
network access). Evidence: report/release-1.20-menu.json/log and menu-pt/en/es
screenshots. Two initial harness assumptions were corrected: CSS's folder arrow
participates in accessible names, and the component's src attribute retains the
initial document during internal navigation. Those initial reports are preserved;
the accepted check uses actual chapter requests/content instead.

The book remains preliminary Portuguese content. Its draft explicit-anchor and
reference markers can appear as literal text with the current grammar; this
preparation does not rewrite the package's book or add a second Markdown parser.
The contents and available chapter navigation work. Mobile devices and a full
editorial audit of the book were not tested.

### General browser regression and final status

The complete Playwright Chromium project was run serially against the completed
app, standalone component and test Worker builds: **76 passed, 3 skipped,
zero failed**, 3.6 minutes. The skips were the two opt-in HDL wrapper tests
(covered by the separate 231 real checks above) and opt-in live OSM tile access.
Offline maps/provider policy, optional renderers, accessibility, security,
public API exports, rich output, WebGL, navigation, lifecycle, resumable effects,
Worker cancellation and synchronous prompt recovery were executed.

An initial general run passed 75 and exposed a timing assumption in the prompt
test: it entered commands before the initial example's asynchronous load finished,
so that example changed the prompt count during the assertion. Waiting for the
initial Plotly result makes startup explicit, as in the HDL/menu harnesses.
The full project was rerun successfully after that test-only correction.
Evidence: report/release-1.20-browser-suite-initial.log and
release-1.20-browser-suite-final.log. No application behavior was changed to
make this assertion pass.

Documentation verification passed: **11 documentation files, 20 local links**.
Version 1.20.0 agrees across package.json, package-lock.json and its root package
entry; the installed/locked interpreter remains 2.9.0. The prepared commit
message is in git-commit.config.json, which is intentionally ignored by the
repository's existing workflow. It has not been executed.

This is a tested static release candidate for review/publication, within the
documented runtime and draft-content limits. No tests require a visitor execution
service. For a deployment enforcing CSP, public Markdown downloads need their
content origin (raw.githubusercontent.com) in connect-src; this does not permit
remote HDL processing. Compiler assets remain hosted with the application.
No commit, push, package publication or deployment was performed.

## Netlify heap failure follow-up — 2026-10-22

The first Netlify deployment failed in Eleventy at roughly 2 GiB of V8 heap,
before Webpack. The previous local acceptance used a larger default heap and
did not expose that limit. Reproduction on Windows with Node 26.7.0 and
`node --max-old-space-size=2048 eleventy.build.mjs` produced the same heap OOM.

Eleventy's default local-data suffixes include the empty suffix. Consequently,
`example/example.json`, the large runtime menu catalogue, was also treated as
directory data and inherited throughout the paginated example templates. It is
not needed in their build contexts; the runtime asset copier reads it directly.

The build now uses `configureEleventyData` to select only `.11tydata` local
data files. This retains example/example.11tydata.mjs, language pagination and
global JSON in data/, while excluding the runtime catalogue from the cascade.
There is no dependency, runtime HDL, Netlify setting or permanent heap-limit
change. The build command remains `npm run build` and the output remains dist/.

Executed checks after the correction:

- Eleventy with 2 GiB heap: **1,470 files passed**, 5.52 seconds in the complete
  build run (a separate initial run passed in 4.48 seconds).
- The complete **`npm run build` passed with NODE_OPTIONS set to
  `--max-old-space-size=2048`**, including asset verification/copy and production
  Webpack. Webpack finished in 256.311 seconds with its three bundle/performance
  warnings. The variable was set only for this validation process.
- Eleventy also passed with **512 MiB heap**, producing all 1,470 files in
  2.83 seconds on a warm local filesystem. This is not a Netlify timing estimate.
- A real Eleventy regression fixture checks that runtime JSON is not inherited,
  while global JSON and explicit directory data still generate all three locale
  pages correctly. All **six infrastructure tests passed**. The fixture stays
  on the checkout drive for Windows compatibility and explicitly disables Git
  ignores for its disposable test input.
- A 1,469-file output snapshot confirmed unchanged lesson scripts and app HTML.
  The ignored generated CSS constants JSON had different bytes when regenerated;
  its SCSS/template sources were not modified. Generated-only timestamp changes
  in tracked files were removed from the patch.
- All 32 deployed HDL files remained byte-identical to the installed package.

Evidence is in report/netlify-eleventy-before.log, netlify-eleventy-after.log,
netlify-eleventy-512.log, netlify-build-2048.log, netlify-infrastructure.log and
netlify-eleventy-output-comparison.json. This is a local constrained-heap
reproduction, not a new Linux/Netlify-hosted deployment; that deployment must
be retried after sending the correction. No commit, push or deploy was run.

### CircleCI configuration follow-up (2026-10-22)

The CI setup refreshed organization files before lint, replacing the tracked
ESLint configuration (including the ES2022 override for browser test scripts)
and Eleventy configuration (including the local-data memory fix). CircleCI now
uses npm ci and the checked-out configuration, without a shared-file refresh.
The optional synchronization workflow retains its project-owned manifest and
excludes ESLint and Eleventy; cleanup also retains this manifest.

Local validation: npm run lint passed with zero errors and the existing
src/main.ts:122 no-console warning; npm run build:script passed; all eight
infrastructure tests passed, including effective ESLint parsing of both scripts
and CI/synchronization configuration regression checks. The production build
was not repeated for this configuration-only change; the preceding 2 GiB build
remains the production evidence. No remote CircleCI run, commit or push was
performed. Retry CircleCI after committing these changes.
