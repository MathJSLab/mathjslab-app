# Release 1.20.1 validation

The application consumes the registry distribution mathjslab-markdown 0.7.2.
The lockfile and installed package agree; mathjslab remains 2.9.0. The existing
lockfile update of @types/lodash to 4.17.27 was preserved. No broad dependency
upgrade or organization-file synchronization was performed.

This update brings the package's localized HDL execution status, result-first
layout, collapsible logs and normalized display/TXT/JSON exports into the app.
Trusted application authorization, client-side Workers, asset URLs and resource
limits remain configured by MarkdownHDLConfiguration.ts. No execution service
or visitor credentials are required.

The pre-publication version is 1.20.1 in package.json and both root lockfile
version fields. CHANGES.md and git-commit.config.json were prepared. do:all was
not run because it upgrades dependencies and performs commit/push.

## Validation

- Installed dependency and pinned compiler asset verification passed.
- TypeScript and documentation checks passed.
- 35 unit tests, eight infrastructure tests and 16 legacy tests passed via
  npm --ignore-scripts test, reusing the existing generated example assets.
- Read-only full ESLint passed: zero errors, the existing src/main.ts console
  warning remains.

Build and browser evidence is recorded below. Logs are kept in
report/release-1.20.1-*.log. No commit, push, publication or deployment is part of
this preparation.

## Production build and HDL browsers

The complete build:test-browser chain passed: standalone Markdown component
(223.699 s), test Worker (11.415 s) and application production bundle (247.192 s).
Each Webpack build reported three existing dependency/bundle warnings. Eleventy
and the production asset-copy steps also passed. Both dist/hdl and
dist/markdown-document/hdl contain all 32 installed HDL files byte for byte.

The real static-hosting HDL matrix passed all 77 cases in Chrome
155.0.8059.85 and all 77 in Edge 155.0.4283.62, with zero page errors.
The ten lesson families in pt/en/es cover VHDL/Verilog simulation, synthesis,
interactive controls, clocks/reset, histories/checks, inspection/exports,
new sources, final timestamps, long-time replay, cancellation and disposal.
New synthesis assertions verify localized status/summary, initially collapsed
logs, expansion, result ordering and normalized TXT/JSON. Narrow layouts passed.

Across both runs, 2,933 recorded requests were GETs without bodies; 168 external
image attempts were README resources (blocked by the test CSP), not processing
requests. Compiler assets were served by the static origin with application/wasm,
under /lab/, without COOP/COEP. Reports:
report/hdl-production-chrome.exe-release-1.20.1.json and
report/hdl-production-msedge.exe-release-1.20.1.json.

This release check does not repeat the development-server matrix or rebuild the
compilers independently. It does not claim complete VHDL language compatibility.
Existing packaged language/library and replay limitations still apply.

## Remaining release checks

The general Chromium browser suite passed 76 tests with three existing opt-in
skips (two dedicated HDL wrappers and live OSM). The separate 154-case HDL
matrix above exercised the real compiler path. No Firefox/WebKit run was
performed for this patch. All 486 example templates passed 1,458 localized
executions, 1,023 result checks, 75 plot requests and 321 Markdown loads. The
menu audit confirmed the 106 canonical documents per locale and the shared
Portuguese Digital Electronics contents.

No new runtime failures were found. The local preparation is complete; remote
Linux CI/hosting execution remains to be confirmed after the user commits and
pushes. No commit, push or publication was performed here. The commit message
configuration is an ignored local helper file and was updated on disk.
