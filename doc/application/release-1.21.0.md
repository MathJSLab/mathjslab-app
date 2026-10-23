# Release 1.21.0 validation

Prepared on 2026-10-23 with the registry distribution mathjslab-markdown 0.8.0.
The user's dependency/lockfile changes were preserved. mathjslab remains 2.9.0;
no broad dependency refresh or organization-file synchronization was run.

The existing educational preset enables explicit heading anchors and localized
section references. The app does not introduce a second parser or automatic
section numbering. Manual decimal numbering is reused; unnumbered references
use the heading title. Explicit anchors supersede text-derived heading slugs.

Package and root lockfile versions are 1.21.0. CHANGES.md and the ignored local
git-commit.config.json helper were updated. do:all was intentionally not run:
it upgrades dependencies and performs commit/push. No commit, push, publication
or deployment is part of this preparation.

## Checks

- Installed dependency, registry lock and pinned HDL asset verification passed.
- Documentation and TypeScript checks passed.
- npm --ignore-scripts test passed 38 unit tests in nine suites, eight
  infrastructure tests and 16 legacy tests, reusing generated example assets.
- New application facade tests cover explicit heading IDs, manual numbering,
  unnumbered heading text and localized references in pt/en/es.
- Full read-only ESLint passed with zero errors and the existing src/main.ts
  no-console warning.
- Menu audit passed: 106 canonical documents per locale plus the shared
  Portuguese Digital Electronics contents.

Build and real-browser results are recorded below. Evidence logs are stored
under report/release-1.21.0-*.log.

## Built distribution and browser references

The sequential build:test-browser chain passed: standalone component (259.428 s),
test Worker (14.154 s) and production application (236.870 s), each with three
existing Webpack dependency/bundle warnings. Both production HDL destinations
contain all 32 installed files byte for byte. No asset loaders were transformed.

The general Chromium browser suite passed 79 tests with three existing opt-in
skips (dedicated HDL wrappers and live OSM). Three new real-app tests rendered
explicit headings and localized references in pt/en/es, followed the reference
inside the viewer without navigating the host page, and verified that embedded
script text did not execute. Test documents were supplied by controlled routes;
this is an application-rendering test, not proof of a remote book deployment.

No Firefox/WebKit matrix or development-server matrix was repeated for this
release. Existing packaged HDL language/library/replay limitations still apply;
this preparation does not independently rebuild the compiler toolchains.

The complete example catalogue passed: 486 templates, 1,458 localized
executions, 1,023 result checks, 75 plot requests and 321 Markdown loads.
The static-hosting HDL suite passed all 77 cases in Chrome 155.0.8059.85,
covering all ten families in pt/en/es, VHDL/Verilog simulation/synthesis,
interactive replay, exports, stable/final timestamps, long-time clocks,
new sources, compiler diagnostics, policy denial and Worker disposal.

Edge 155.0.4283.62 also passed all 77 HDL cases. Both runs had zero page
errors. Their 2,895 recorded requests were GETs without bodies; 168 external
image attempts were README resources blocked by the test CSP. No HDL sources
or processing requests were sent to external services. Local Wasm requests
had application/wasm MIME under /lab/, without COOP/COEP. Evidence:
report/hdl-production-chrome.exe-release-1.21.0.json and
report/hdl-production-msedge.exe-release-1.21.0.json.

Local pre-publication checks are complete. Remote Linux CI and hosting still
need confirmation after the user commits and pushes. No commit, push, package
publication or deployment was performed.
