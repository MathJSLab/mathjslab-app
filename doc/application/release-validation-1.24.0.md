# Release validation - 1.24.0

Validated on 2026-11-03 against registry packages `mathjslab@2.10.0` and
`mathjslab-markdown@0.10.0`. No commit, tag, push or publication was performed.

## Complete candidate

`npm run test:candidate` passed all eight stages, from
`2026-11-03T02:47:26.443Z` to `2026-11-03T04:17:17.693Z`. The candidate
detected no changes to maintained source, documentation or configuration during
validation.

Candidate source fingerprint:
`df07d63187c0ec98841b36ff2b0edf27a7458a47da13466fe498428bc9aa78b0`. Local
evidence and live step logs: `test-results/candidate-vDdr64/report.json`. These
generated artifacts are ignored by Git.

- Production app, standalone Markdown and observation Worker builds passed.
- Documentation, catalogue coverage and TypeScript checks passed.
- Application tests: 61 unit, 21 infrastructure and 16 legacy Markdown cases
  passed.
- Catalogue: 486 templates, 1,458 locale executions, 1,023 numerical checks, 75
  native plot requests and 321 Markdown loads passed.
- Core identity, installed resolution, matching build input fingerprints and
  deployed HDL asset checks passed.
- Browser matrix: 322 passed, 11 skipped, zero failures and zero test retries.
- Dedicated production HDL runner: 77 cases passed on Playwright Chromium,
  including VHDL/Verilog simulation, synthesis, exports, cancellation, disposal
  and local Wasm/CSP/subdirectory hosting without COOP/COEP.
- Chunk measurements completed in `test/result/chunk-baseline.json`.

| Browser  | Passed | Skipped |
| -------- | -----: | ------: |
| chromium |    108 |       3 |
| firefox  |    106 |       5 |
| webkit   |    108 |       3 |

The matrix skips are six opt-in native HDL cases, three online OSM tile cases
and two Firefox WebGL cases unavailable on this host. The separate production
HDL runner passed; development HDL hosting, native HDL on Firefox/WebKit and
live OSM providers were not validated by this run.

The runtime cases cover startup in all locales, ordered batch commands, nested
loads, retained function/control-flow context, waits, diagnostics, timeout,
cancellation, numeric backend changes, concurrent prompt/document sessions and
graph/Worker disposal.

## Corrections and reproduction

The initial candidate was not accepted. It exposed a generated export file
rewrite caused by Windows/Unix line endings and a fixed-delay reference
navigation check. The generator now preserves equivalent line endings and
reference tests require settled, fully visible geometry through bounded
polling. The isolated original chapter case also passed.

Firefox initially crashed at `newPage` inside the restricted Windows sandbox.
Blank-page probes for Firefox/WebKit and the complete final candidate passed
outside that sandbox. The interrupted first attempt remains recorded under
`test-results/candidate-EU5NJQ`; it is not counted as a successful run.

After the complete candidate, release documentation, workspace JSDocs and
localized trapezoidal lesson comments were finalized. Mixed-encoding text in
the test guide and Spanish lesson goal was repaired; the Portuguese goal now
accurately mentions trapz and cumulative integration. The executable numerical
body was compared byte for byte, assets were regenerated and this lesson was
rechecked in all three locales. Workspace JavaScript emission also matches the
validated source. Documentation, types and lint were checked separately in
`release-handoff-checks.log`; the focused lesson result is in
`release-trapezoidal-final.log`.

## Publication handoff and remaining work

- Package and lockfile versions are 1.24.0. The ignored
  `git-commit.config.json` contains the prepared release subject.
- `npm ls --all` resolves without invalid dependencies or peers. Production
  audit has zero findings. The complete audit retains 56 toolchain findings: 29
  high, 24 moderate and 3 low. Proposed forced fixes include incompatible
  downgrades; these were not applied. Audit snapshots remain in
  `report/release-audit-*.json`. Reassess the toolchain advisories before
  publishing.
- Source lint has zero errors and one existing bootstrap `console.error`
  warning. Production performance warnings cover large assets/entrypoints and
  the runtime embedded in the application entry; optimize caching and payloads
  separately from this integration release.
- The deterministic export generator is mirrored in `mathjslab-github` at
  `src/components/component.include.ts`. Publish that organization change
  before the next application organization update. Real clean/copy replay
  preserved 11 app-owned files and copied 100 shared resources.
- Deploy entry bundles, chunks, Workers and HDL assets together, revalidate
  entry caches and retain older hashed chunks for existing pages.

See the [release preparation guide](release-preparation.md) for the workflow.

## Follow-up: Mermaid tooltips after do:all dependency refresh

With Mermaid 12.2.0 and D3 7.9.1, optimized builds dropped D3 transition
registration because D3's barrel declares `sideEffects: false`. The chapter's
tooltip mouseout handler then threw `transition is not a function` in all three
browsers. A minimal production bundle reproduced the missing prototype method;
preserving evaluation of the Mermaid-owned D3 entry restored it.

The shared `markdownD3SideEffectsRule()` now covers app and standalone Markdown
builds. It preserves lazy loading and tree shaking elsewhere, with no package
version changes or dependency installation. Chapter tests explicitly exercise
Mermaid hover/leave and await completed startup before using the example menu.
The zero-page-error assertion remains intact.

Resource-limited validation for this follow-up:

- Minimal production tree-shaking regression: passed (about two seconds).
- App production rebuild: passed, with the existing performance warnings.
- All nine real-chapter cases: passed, zero retries, across Chromium, Firefox
  and WebKit, in 7.1 minutes (`d3-chapter-verified.log`).
- Types, documentation links and targeted lint checks passed.

The complete 333-case matrix, standalone rebuild and publishing workflow were
not repeated for this follow-up. The first focused attempt stopped at a startup
readiness race before reaching Mermaid; the subsequent nine-case run passed
after adding the same readiness conditions used by other application tests. No
commit or publication was performed.

## Follow-up: deterministic prompt timeout preservation check

The Firefox timeout test assumed `retained += 1` would complete within a 20 ms
wall-clock deadline. That deadline includes parsing and evaluation; under load
it can expire before the increment, legitimately retaining 7.

The test now installs Playwright's clock before page load, pauses time before
the timeout command, waits for the host delay after the increment, and then
advances time past the runtime deadline. It still asserts a timeout diagnostic,
retained value 8, cancellation behavior and removal of the variable after
reset. The clock and test timeout setting are restored in a finally block.
Production code and the application's normal execution timeout were not
changed.

Focused validation, without rebuilding or repeating the full suite:

- Firefox: five consecutive passes, zero retries (`timeout-firefox.log`).
- Chromium and WebKit: one pass each (`timeout-other-browsers.log`).
- TypeScript checks passed (`timeout-types.log`).
