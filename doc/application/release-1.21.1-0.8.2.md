# Release 1.21.1 with mathjslab-markdown 0.8.2

This is the current unpublished 1.21.1 candidate. The earlier
[0.8.1 validation](release-1.21.1.md) is preserved as historical evidence of the
WebKit/3Dmol failure. The candidate version was not advanced again because HEAD
remains 1.21.0 and the 1.21.1 preparation has not been committed or published.

The registry dependency and lockfile now select mathjslab-markdown 0.8.2;
mathjslab remains 2.9.0. No broad dependency refresh, organization-file
synchronization, global OffscreenCanvas shim or consumer bundler workaround was
introduced. The published private molecular runtime is loaded through the
package's normal lazy import. Existing authorization, resource limits and HDL
asset deployment remain unchanged.

The first registry installation attempt failed TLS certificate verification.
Installation succeeded using Node's --use-system-ca option for that process,
without disabling TLS or changing persistent npm settings.

Version metadata, CHANGES.md and the ignored git-commit.config.json helper are
prepared for 1.21.1 with 0.8.2. do:all was not run: it also refreshes other
dependencies and performs commit/push. No commit, push, publication or deployment
is included in this preparation.

## Validation

Evidence uses report/release-1.21.1-0.8.2-* filenames, preserving the earlier
0.8.1 logs. Builds and browser suites ran sequentially against stable assets.

## Dependency audit

The registry npm audit reported 36 findings (33 high, three moderate, no critical).
The lockfile update changes only the Markdown package and root version/range
metadata; other dependency versions remain as before. Advisory roots include
body-parser, fast-uri, netlistsvg's nested json5/yargs-parser, and zod (with many
findings cascading through Jimp plugins). The default audit remediation includes
a Markdown downgrade to 0.5.4, which would remove required capabilities. No
audit fix/force, broad update or unverified major override was performed.
This functional release validation does not close that separate security
maintenance work. Raw evidence: report/release-1.21.1-0.8.2-audit.json.

## Completed build and non-browser checks

The sequential build:test-browser chain passed: component (218.423 s), test
Worker and app production (230.032 s). The component was rebuilt after adding
license deployment (183.328 s). Each Webpack compilation reported three existing
warnings. Both 32-file HDL trees and the molecular license match the installed
package bytes. The shared asset helper still resolves netlistsvg/ELK from their
own packages; its only new behavior is the molecular license copy.

TypeScript, documentation, full read-only ESLint (zero errors, the existing
src/main.ts console warning), 38 unit tests, eight infrastructure tests and
16 legacy tests passed. The complete example catalogue passed 486 templates,
1,458 localized executions, 1,023 result checks, 75 plot requests and 321
Markdown loads. The menu audit confirmed 106 canonical documents per locale
and the shared Portuguese Digital Electronics contents. Chunk measurement passed.

The three previously failing WebKit tests passed in a focused run without
retries: both extension audits and the molecular/general 3D rendering test.
This used the normal installed runtime with no injected global or test exclusion.

## General browser matrix

The 246-case matrix ran with one worker and no retries: 234 passed, 11 skipped,
and one WebKit case failed before its assertions because the lifecycle fixture's
module was not ready within the default five-second expectation. The failure
trace, video and screenshot are preserved under
report/release-1.21.1-0.8.2-initial-lifecycle-failure. Both complete extension
audits, molecular/general 3D rendering, all nine localized heading-reference
cases and approved cross-origin images passed in this run.

The fixture readiness expectation now allows 30 seconds, within the existing
120-second lifecycle test budget. No rendering, isolation or disposal assertion
was removed or relaxed. The entire lifecycle suite then passed across all three
engines: 20 passed, one pre-existing Firefox WebGL capability skip, no retries.
Evidence: report/release-1.21.1-0.8.2-lifecycle-final.log. The original complete
matrix was not rerun a second time; its unrelated passing cases and the focused
corrected lifecycle run are reported separately.

The original 11 skips comprise nine opt-in cases (two real-HDL wrappers and
online OSM per engine) and two Firefox WebGL capability skips. Real HDL is
validated separately below. Installed Playwright 1.64.1 used Chromium
156.0.8078.4 (revision 1248), Firefox 157.0 (1555), and WebKit 27.2 (2370), on
Windows. Firefox execution required the host process outside this environment's
sandbox. These local results do not assert that hosted Linux CI has run.

## Browser-only HDL regression

Chrome 155.0.8059.86 passed all 77 production-static cases with zero page errors.
The ten lesson families ran in pt/en/es for VHDL and Verilog, including actual
simulation, synthesis/netlists, VCD and other exports, inspection, inputs,
clocks/reset, history/checks, stable endpoints and replay beyond four microseconds.
Novel sources, numeric_std, original-file/line diagnostics, explicit policy
denial, cancellation and Worker disposal on replacement/navigation also passed.

Chrome recorded 1,445 requests, all GETs without bodies. The 84 external image
attempts are README logos/badges blocked by the test CSP; there was no external
HDL processing request or source upload. All 403 recorded Wasm responses were
local successful application/wasm responses under /lab/hdl/. No COOP/COEP was
required. Full evidence:
report/hdl-production-chrome.exe-release-1.21.1-0.8.2.json.

Edge 155.0.4283.62 also passed all 77 cases with zero page errors. Its 1,433
requests were GETs without bodies, including the same 84 external README image
attempts. All 400 recorded Wasm responses had status 200 and application/wasm.
Evidence: report/hdl-production-msedge.exe-release-1.21.1-0.8.2.json. Together,
the two HDL runs passed 154 cases and recorded 2,878 requests without source
uploads or delegated processing.

This release run does not repeat the development-server matrix or rebuild the
compilers. The supported HDL language/library and digital replay profile remains
the package's documented profile, including empty-trace limitations; these tests
do not claim full VHDL language compatibility. No backend, tokens, sessionStorage,
native visitor tools, precomputed HDL output or remote fallback were introduced.

## Final preparation status

The local functional preparation is complete with the initial fixture timeout
and its corrected focused run recorded above. Package/lockfile version is 1.21.1,
the installed registry Markdown version is 0.8.2, and the installed kernel is
2.9.0. Final ESLint passed with zero errors and the existing console warning;
documentation links and git diff whitespace checks passed. Both HDL asset trees
and both 4,283-byte molecular license copies match their installed sources.
Dependency audit findings remain open as described above. Hosted CI and deployment
have not been executed by this preparation. No additional Markdown package fix
or republication was needed.
