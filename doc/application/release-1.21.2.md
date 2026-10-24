# Release 1.21.2 validation

Prepared on 2026-10-24 with the registry distribution mathjslab-markdown 0.8.3.
The existing dependency/lockfile update, generated-file edits and uncommitted
real-chapter regressions were preserved. HEAD is 1.21.1, so the next patch is
1.21.2. Both root version fields in package-lock.json, package.json, CHANGES.md
and the local ignored git-commit.config.json helper are prepared accordingly.
MathJSLab remains installed/locked at 2.9.0. No broad dependency refresh or
organization-file synchronization was performed. do:all was not used because it
also upgrades dependencies, cleans evidence and performs commit/push.

## Content and public response

The installed package contains all 328 example/resource files. Every file
matches the sibling package source byte for byte. The menu audit passed 106
canonical documents per locale plus the explicitly shared Portuguese Digital
Electronics contents. The existing app URLs still point to raw GitHub main;
there is no endpoint, language-parser or Netlify workaround.

Unlike the earlier
[local reference validation](digital-electronics-references.md), the current
public chapter response now matches the corrected installed file: 30,637 bytes,
SHA-256 96ad78bb6964ee22cfbd4dcc9dc99d2db8f1d332d76962545ee377e1789a4b2d. The
downloaded bytes are retained in report/release-1.21.2-public-chapter.md. The
initial public-response check alone is not a deployed-browser validation.

The real-chapter and isolation tests now default to the installed package's
example directory. Missing installed examples fail rather than silently skip; a
sibling checkout is no longer required in CI. MARKDOWN_EXAMPLE_SOURCE_ROOT can
still select a source checkout. The chapter test compares the response body
actually received by the browser with the installed source bytes. Its optional
MARKDOWN_CHAPTER_USE_PUBLIC=1 mode leaves the original raw GitHub requests
unrouted. No diagnostic suppression or visibility relaxation was introduced.

## Completed non-browser checks

Documentation and TypeScript, 38 Jest tests in nine suites, eight
infrastructure tests and 16 legacy tests passed. An initial TypeScript run
exposed an unchecked first geometry sample in the new regression; it now
explicitly requires three samples and a present first sample. The final
complete Node test run passed. ESLint reported zero errors and the existing
src/main.ts console warning. The browser TypeScript specs are outside the
current ESLint selection; they are covered by the TypeScript and real-browser
checks, not claimed as linted.

## Dependency audit

npm audit reports the same 36 findings as the previous candidate: 33 high,
three moderate and no critical. No audit fix/force, downgrade or broad override
was applied. The registry update itself changes only Markdown's version,
tarball and integrity, plus app release metadata. These functional checks do
not close the separate dependency-security maintenance described in the
[previous release report](release-1.21.1-0.8.2.md). Raw evidence:
report/release-1.21.2-audit.json.

## Execution evidence

The sequential build:test-browser chain passed: production component (255.006
s), test Worker (15.542 s), and production app (266.058 s), each with three
existing Webpack warnings. Both 32-file HDL asset trees match the installed
package byte for byte. The 4,283-byte molecular license is identical at both
deployed paths. Chunk measurement passed.

The complete catalogue passed 486 templates, 1,458 locale executions, 1,023
result checks, 75 native plot requests and 321 Markdown loads. These results
are separate from real browser execution. Build-generated timestamp-only
changes were returned to their initial bytes, preserving the user's existing
generated-file edits rather than restoring HEAD.

Browser results and limits are recorded below. Logs use report/release-1.21.2-*
names. Builds and browser suites run sequentially against stable distributions.
No commit, push, publication or deployment is authorized or performed as part
of this preparation.

## Initial full browser matrix

The 258-case run used one worker, all three Playwright engines and zero
retries. It finished with 245 passed, 11 skipped and two WebKit failures. The
skips are nine existing opt-in cases (two real-HDL wrappers and live OSM per
engine) and two existing Firefox WebGL capability exclusions. No new browser
exclusion was introduced.

Both failures were in menu tests before their Markdown rendering assertions:
the five-second menu-hidden expectation expired while the local example .m GET
still had no response in the trace. They affected the six-scenario
package-lesson loop and the nested VCD lesson. The complete traces, screenshots
and videos are preserved under report/release-1.21.2-initial-browser-failures.
This observation does not establish a package/runtime or deployed-host defect.

All nine real-chapter/menu cases, all nine heading-reference cases, all three
reference-isolation cases and the extension/molecular audits passed in that
same run. Each chapter response body matched the installed corrected source.
The chapter's 36 figure-reference navigations required settled, fully visible
captions, with no missing/duplicate diagnostics or displaced identifiers.

The two affected menu tests now explicitly await a successful complete example
download before retaining their original menu-hidden and rendering assertions.
Focused repeated validation is recorded separately below rather than relabeling
the original matrix as entirely green.

The first repeated menu run passed 17 of 18 cases; the remaining Chromium case
failed earlier, before menu interaction, because the initial editor still had
no default example after five seconds. Its evidence is preserved under
report/release-1.21.2-menu-first-failures. Both tests now wait for the app's
existing initial Plotly SVG (30-second setup budget), as the heading/chapter
integration tests already do, before interacting with the menu. Default editor
content, menu closure and rendered outputs still have their original
assertions. This is test synchronization; no application/runtime or deployment
workaround was introduced. The final repeated run is recorded separately below.

## Final menu repetitions

After both synchronization changes, all 18 repeated cases passed: the two
affected tests ran three times in each engine, sequentially with one worker and
zero retries (8.4 minutes). No rendering assertion, reference visibility check
or diagnostic was removed or suppressed. Evidence:
report/release-1.21.2-menu-final.log. The original full 258-case matrix was not
rerun after these test-only changes; the initial failures and both focused runs
remain separate evidence.

The actual installed package resolves under this app's node_modules, is not a
symlink/junction to the sibling checkout, and has version 0.8.3. The registry
tarball/integrity are locked. The dependency graph comparison found no other
package-version change.

## Real public Markdown downloads

With MARKDOWN_CHAPTER_USE_PUBLIC=1, the chapter/contents requests were left
unrouted at the original raw GitHub URLs. All three menu scenarios passed in
Chromium, with zero retries (1.4 minutes). In each scenario the response body
actually received by the browser matched the installed 0.8.3 chapter bytes. All
six captions, exercise 4's identifier and the four real references passed; the
12 additional figure-link navigations ended at fully visible, stable captions.
Reference text followed the effective viewer locale pt/en/es. There were no
chapter missing/duplicate diagnostics or page errors. The existing introductory
README/LEIAME/LEAME mailto policy warning remains recorded separately.

Evidence: report/release-1.21.2-public-chapter-browser.log and
report/release-1.21.2-chapter-chromium-{pt,en,es}-public.json. This verifies
the current public content through the local production app build; it does not
claim a visit to the deployed app URL or an existing user's cached session.
Public-download mode was not repeated in Firefox/WebKit; those engines used the
exact installed chapter at the same expected URL in the full matrix.

## Browser-only HDL regression

Chrome 155.0.8059.86 passed all 77 production-static HDL cases with zero page
errors. Coverage includes the ten lesson families in pt/en/es, real VHDL and
Verilog simulation/synthesis, netlists, inspection/exports, manual inputs,
clocks/reset, history/checks, stable replay endpoints, final-step events and
times beyond four microseconds. New sources, numeric_std, original-file/line
diagnostics, explicit host denial, cancellation and Worker disposal passed.

All 1,446 recorded requests were GETs without bodies. The 84 external attempts
were README images blocked by the test CSP, not source uploads or delegated
processing. All 403 recorded Wasm responses were local status-200 responses
with application/wasm under /lab/hdl/. No COOP/COEP was required. Full
evidence: report/hdl-production-chrome.exe-release-1.21.2-0.8.3.json.

The existing HDL fixture server used its sibling-example default; all 328
fixture catalogue files had already been verified byte-identical to the
installed 0.8.3 package. To reproduce without that checkout, set
HDL_LESSONS_DIR=node_modules/mathjslab-markdown/example. The executor, Workers
and deployed assets came from the registry-installed package, not a local link.

## Final status and limits

The unpublished app candidate is 1.21.2 with Markdown 0.8.3 and kernel 2.9.0.
Changelog and local commit-message configuration are ready. Initial browser
failures and corrected focused results are reported separately above; the full
matrix was not rerun after test synchronization changes. No additional package
fix or republication was needed for the scope validated here.

The three Playwright engines were Chromium 156.0.8078.4, Firefox 157.0 and
WebKit 27.2 on Windows (Playwright 1.64.1). Firefox required host execution
outside the tool sandbox. These are not native macOS Safari or hosted Linux CI
results. The app's deployed URL, cached visitor profiles, the
development-server matrix and Edge's real HDL matrix were not rerun for this
candidate. Compilers were not rebuilt; the existing packaged
VHDL-2008/library/digital replay profile and empty-trace limitations remain. No
complete-language claim is made.

The 36 dependency audit findings remain open. No backend, tokens,
sessionStorage, visitor-native tools, service fallback or precomputed HDL
results were introduced. No commit, push, registry publication or deployment
was performed.
