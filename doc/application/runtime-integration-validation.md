# Runtime session integration — 2026-11-02

Development integration; no version changes, commits or publication.

This records the earlier local-candidate integration. For the published
`mathjslab@2.10.0` / `mathjslab-markdown@0.10.0` installation and the
update-time prompt regression, see
[registry package alignment](registry-package-alignment.md).

## Ownership and user-visible behavior

The prompt now owns an in-process RuntimeSession. Its synchronous host hooks
install the active interpreter, output destination and plot capture only while
advancing the retained execution. Host delay and text loading are awaited;
running/waiting state, cancellation and coded diagnostics remain attached to
the initiating output. The default prompt timeout is 30 seconds and can be set
through `appEngine.promptSession.timeoutMs`. Numeric kernels remain
cooperative, as specified by the core contract.

Batch commands execute in order. Editing/blurring the batch editor no longer
silently resets its workspace. Explicit reset cancels execution, awaits the
reset, reconnects the new interpreter and clears owned plots. Prompt and batch
shadow component hooks also release plot resources on clearing/removal.

Updated after user review: numeric selection is through user `configure`
commands, with no backend/precision selectors or initial host numeric
preference injection. Switching converts live values while preserving workspace
and references. Native number precision is 15; conversion back to decimal
cannot recover lost digits. Prompt output again shows input and a computed
result when different, aligned to the left. The checks below are historical
results; the follow-up validation is recorded in the workspace
release-coordination log.

Markdown has its own formatting interpreter and document Worker sessions. Its
current browser executor's source **and built declarations** expose `numeric`;
the app uses that contract rather than assuming another chat has completed.
Changing the prompt backend does not alter Markdown preferences. Markdown
reset/disposal and graphical resources stay owned by their documents.

Prompt `load` references resolve against `document.baseURI`, retaining the
previous host URL base. Nested execution, functions, source identity and
completion messages are managed by the core retained script lifecycle.

## Distribution and reproducibility

Both package dependencies remain `file:` links to their sibling checkouts.
Existing dependency edits were present before integration and were preserved.
The Markdown checkout was not edited by this integration.

All three Webpack configurations use exact aliases into the installed core's
`lib` distribution. Each emits `mathjslab-distribution.json`, containing
SHA-256 fingerprints for core/runtime/browser/Worker inputs. The app's
production chunks use content hashes. Run
`node script/verify-runtime-distribution.mjs` after rebuilding all three
outputs to check file links, Node core identity, Markdown dependency resolution
and matching input fingerprints.

The browser tests discovered a core plotting defect with the number backend:
plot preparation and sampling still called Decimal-specific methods. The
authorized sibling correction changes PlotFunctions to the numeric facade and
adds number/decimal regressions. App summation/productory now use the same
facade. The original core readiness fingerprint therefore describes the
previous source; the corrected source was revalidated as recorded below. The
focused core regression run passed 18 tests before the candidate run. That run
uses candidate-SdbDPC, fingerprint
`622e2ca5af4d3602a6b9e48bbf8e10867f0901c8e1e28efeeaed0f3a80c5cebd`; its 81 unit
suites passed all 1,848 tests.

## Validation record

The application `npm run test:checks` gate passed: documentation, canonical
example coverage, types, 38 unit tests, 21 infrastructure tests and 16 legacy
Markdown tests. Later batch-diagnostic changes also passed type checking.

Final results:

| Check                                                                           | Result                                                                             |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Core general/ES2015 types, API reference, cycles                                | Passed                                                                             |
| Core unit and integration                                                       | 1,848 + 1,211 passed                                                               |
| Core declarations and production distribution                                   | All 11 bundles passed                                                              |
| Distributed Node/browser tests                                                  | 34 passed in 11 suites                                                             |
| Benchmark harness / smoke                                                       | 5 tests / 30 case-backend combinations passed                                      |
| Installed tarball public types/imports, Node/Worker numeric and retained cycles | Passed                                                                             |
| Installed tarball app examples                                                  | 24 executions across en/es/pt passed                                               |
| Installed tarball native Chromium and app/Markdown adapters                     | Passed: 4 Workers and 74 delays                                                    |
| App development / final production build                                        | Passed                                                                             |
| Public Markdown / observation Worker production builds                          | Passed                                                                             |
| File links, single core identity, core/runtime/Worker fingerprints              | Passed for all three outputs                                                       |
| Markdown adapter JavaScript/declaration fingerprints                            | Matched throughout all three builds and final tests                                |
| Final app checks                                                                | 38 units, 21 infrastructure, 16 legacy Markdown; docs, catalogue and types passed  |
| Focused Chromium coverage                                                       | 40 scenarios passed in complementary runs: 31 document/Worker and 9 application UI |
| Updated examples                                                                | 9 locale executions passed against the rebuilt installed core                      |
| Focused lint / diff check                                                       | No errors; existing main.ts console warning only                                   |

The canonical candidate command completed 11 stages in `candidate-SdbDPC`. Its
last stage was interrupted after registry certificate failures during
installation. The old release cache lacked the registry metadata needed for
offline installation. A fresh installation with `NODE_OPTIONS=--use-system-ca`
succeeded. Its first distributed-browser attempt reached the 45-second harness
limit; repeating validation of the **same installed tarball** with the Chromium
used by the app passed. No source changes were made between those runs.

The original candidate checkpoint remains an interrupted record; it has not
been relabeled as a successful aggregate command. The consolidated evidence in
`test-results/runtime-integration-summary.json` records the 11 passed stages,
the successful installed-consumer run, tarball SHA-256 and the unchanged core
source fingerprint. All check categories have passed against that source.

One newly written UI test initially changed language during execution, which
intentionally navigates to the locale endpoint and disposes the old page. The
fixture now starts on the Portuguese page and verifies its locale through
nested loads/waits. All nine application UI cases were rerun successfully; the
other 31 document/Worker cases had already passed on the final outputs.
Language navigation behavior was preserved.

Final production builds ran sequentially with a 4096 MB Node heap. They retain
Webpack size warnings. No runtime, type or lint errors remain in the focused
integration scope.

Intermediate evidence:

- Application development compilation passed.
- Application types and all 38 unit tests passed.
- Focused lint: zero errors; one existing console warning in main.ts.
- 21 infrastructure tests and 16 legacy Markdown tests passed independently.
  The legacy loader now resolves third-party imports from their owning linked
  package, and its formatter mock follows the independent interpreter contract.
- Three updated educational examples passed in en/es/pt (nine executions).
- Initial expanded Chromium run: 38 of 39 passed. Its single failure exposed
  the number-backend plotting defect described above; it is not a waived test.
- A production compilation passed before the final numeric correction. Later
  concurrent production builds hit Node native allocation limits. The final
  builds were rerun sequentially against the corrected distribution and passed.

Logs are `test-results-runtime-*.log` at the application root (ignored build
artifacts). Core candidate logs are in the sibling's
`test-results/candidate-*`. The final distribution report is
`test-results/runtime-distribution.json`; the consolidated machine-readable
validation record is `test-results/runtime-integration-summary.json`.

## Publication follow-up

Keep package versions unchanged during development. Before release, choose the
versions and peer ranges together, replace development links with the agreed
artifacts, rebuild all outputs and rerun both gates against that exact tarball.
Include the number-backend plotting correction in the core Unreleased notes.
Prepare system certificate/cache settings and select the validated Chromium
through `MATHJSLAB_BROWSER_EXECUTABLE` before rerunning the aggregate release
gate. Review complete browser compatibility and the broader application/HDL
suite; focused runtime coverage is not a claim that every optional renderer or
every educational document has been validated.

Deploy matching entry JS, core/runtime chunks and Workers together. Revalidate
the entry HTML/JS cache and retain old hashed chunks while older pages remain
active. Do not publish a mixture of Workers and core bundles from different
fingerprints. Check installed Markdown declarations again if its ongoing work
changes the numeric or lifecycle contract.
