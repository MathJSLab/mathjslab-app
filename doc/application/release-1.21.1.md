# Release 1.21.1 validation

Historical 0.8.1 candidate: the complete browser matrix failed because of a
3Dmol/WebKit defect. See the current [0.8.2 validation](release-1.21.1-0.8.2.md)
for the replacement candidate; the original findings below are preserved.

Prepared on 2026-10-23 with the registry distribution mathjslab-markdown 0.8.1.
The user's dependency/lockfile update and the existing 1.21.0 diagnostic report
were preserved. mathjslab remains 2.9.0. Package and root lockfile version fields
are 1.21.1; CHANGES.md and the ignored local git-commit.config.json were updated.

The package now schedules fragment scrolling after ready-state/navigation layout
settles and updates the outline from current heading geometry. The app uses the
original component implementation, with no CSS workaround, browser exclusion or
special user-agent path. Its reference regression now waits for stable heading
geometry before asserting visibility, rather than accepting a transient crossing
during the scroll animation.

No broad dependency upgrade or organization-file synchronization was performed.
do:all was not run because it upgrades dependencies and performs commit/push.
No commit, push, package publication or deployment is part of this preparation.

## Checks

- Installed registry dependency, lockfile and pinned HDL assets verified.
- TypeScript and documentation checks passed.
- npm --ignore-scripts test passed 38 unit tests in nine suites, eight
  infrastructure tests and 16 legacy tests, reusing generated example assets.
- Full read-only ESLint passed with zero errors and the existing src/main.ts
  no-console warning.

Build and browser evidence is recorded below. Logs are kept
under report/release-1.21.1-*.log. Historical failures and discarded experiments
remain documented in release-1.21.0.md.

## Production build and complete browser matrix

The sequential build:test-browser chain passed: standalone component (224.771 s),
test Worker (12.587 s) and app production (240.938 s), each with three existing
Webpack dependency/bundle warnings. Both HDL destinations match all 32 installed
files byte for byte. The chunk measurement also passed.

The full 246-case Windows matrix, with one worker and no retries, produced
232 passes, 11 existing opt-in/runtime skips and three WebKit failures. All nine
heading-reference cases passed, including settled geometry in pt/en/es. Chromium
156.0.8078.4 (revision 1248), Firefox 157.0 (1555) and WebKit 27.2 (2370) are the
versions pinned by the installed Playwright 1.64.1 driver. This was not a hosted
Linux Actions run.

The failing WebKit tests were the two extension audits and the combined 3D test.
Their alerts are 3Dmol PDB/XYZ viewer initialization errors. This is distinct
from fragment navigation and does not prove a regression introduced in 0.8.1.
No test was skipped or weakened to hide these failures.

The complete example catalogue passed 486 templates, 1,458 localized executions,
1,023 result checks, 75 plot requests and 321 Markdown loads. The menu audit
confirmed 106 documents per locale plus the shared Portuguese book contents.

## Firefox image test stabilization

The original six-repeat image test reproduced NS_BINDING_ABORTED in three runs,
although the displayed-image assertions passed. The test now requires successful
responses, complete images and successful decoding, and explicitly checks that
requests use the image resource type rather than fetch/XHR. Only Firefox aborts
for those same successfully loaded image URLs are tolerated; other failures
still fail. Decoding errors are no longer swallowed.

Both security tests then passed six repetitions in all three engines: 36 cases,
no retries. This is a test-only change, not a runtime image-policy change.
Evidence: release-1.21.1-firefox-images.log and
release-1.21.1-security-repeated.log.

## Remaining 3Dmol blocker

WebKit 27.2 on this Windows host supplies HTML canvas WebGL 1 and 2 but does not
define OffscreenCanvas. 3dmol 2.5.5 accesses the bare OffscreenCanvas identifier in
src/WebGL/Renderer.ts:initGL (around line 2139), raising ReferenceError before
this._gl is initialized. The later setDefaultGLState call then fails at
this._gl.clearDepth. The renderer's HTML canvas path is present but not reached.

The isolated fixture reproduced this with the installed standalone package.
As a diagnostic control only, defining the global binding with the value
undefined let the same library take its native HTML canvas path and render the
molecule with no alerts. No OffscreenCanvas implementation, fake rendering or
product global shim was introduced. This experiment is not a production fix.

Evidence: report/release-1.21.1-webgl-probe.log,
report/release-1.21.1-3dmol-probe.json and report/diagnose-3dmol.mjs. The correction
should be investigated in mathjslab-markdown/3Dmol through a reproducible,
properly scoped dependency/integration change. Do not publish the app on the
strength of the passing fragment tests alone. No package sources were edited.

## HDL production regression

Chrome 155.0.8059.85 passed all 77 static-production HDL cases, with zero
page errors. All 1439 recorded requests were GETs without bodies; 84 external
image attempts were README resources, not source uploads or processing calls.
The local Wasm MIME/subdirectory checks passed without COOP/COEP. Coverage
includes ten lesson families in pt/en/es, VHDL and Verilog, synthesis/netlists,
VCD, interactive inputs/clocks/history/checks, exports, new sources, final
timestamps, long-time replay, policy denial and Worker disposal.

The Edge HDL and development-server matrices were not repeated for this
candidate. Full Chromium/Firefox/WebKit rendering results and the unresolved
3Dmol failure are reported above; older release results are not substituted.
Existing HDL language/library/replay limitations still apply. No independent
compiler rebuild was performed.

Version metadata, changelog and commit message are prepared, but the candidate
is not approved for the full compatibility matrix. No commit, push, package
publication or deployment was performed.
