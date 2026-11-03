# Release preparation — 1.24.0

This minor release integrates resumable prompt execution with the published
`mathjslab 2.10.0` and `mathjslab-markdown 0.10.0` packages. It includes
ordered editor execution, retained pause/load, cancellation and diagnostics,
session isolation, plot disposal, numeric configuration, source recovery,
catalogue improvements and updated educational examples. Read
[CHANGES.md](../../CHANGES.md) for the complete release notes.

## Metadata and dependency review

`package.json`, the lockfile's top-level version and its root package version
must all be 1.24.0. The candidate command checks that consistency and the
changelog heading before starting expensive validation. The local, ignored
`git-commit.config.json` contains the prepared commit subject; creating it does
not execute the Git helper.

Build hosts need Node.js `^22.13.0 || >=24` and npm 10+, matching the installed
Markdown toolchain. The browser application itself runs without Node.

ESLint 10 remains current. The unused import-rule plugin was removed because
its peer range excludes ESLint 10; no enabled lint rule was removed. The app
also applies netlistsvg's JSON5/yargs overrides at the root, matching the
upstream Markdown development setup. npm does not inherit a dependency's
overrides. Validate the resolved graph and production audit after installation:

```sh
npm ls --all
npm audit --omit=dev
```

The reviewed installation resolves without invalid peers and has zero
production audit findings. The full audit still reports 56 development-tool
findings (29 high, 24 moderate, 3 low), in chains involving Jimp, lint/test
tools and replace-in-file. The registry's proposed forced fixes include
incompatible downgrades; these were not applied. Recheck these tooling
advisories before publication and handle them separately from the browser
runtime dependencies. Audit JSON snapshots are retained under ignored
`report/release-audit-*.json`.

Keep the application and Markdown adapter on one core identity. The prepared
distribution check verifies real resolution, input hashes and executor option
declarations across the production app, standalone Markdown and test Worker.

## Preparation without publication

Install the locked dependencies and required browser binaries before running:

```sh
npm run test:candidate
```

The sequential candidate runs production builds, documentation/types/unit and
infrastructure checks, every generated example, deployed HDL asset checks,
distribution identity checks, Chromium/Firefox/WebKit, the production HDL
runner and chunk measurements. It stops on failure and records logs and a JSON
report under ignored `test-results/candidate-*`. Step logs are written while
commands run, so long builds and browser tests remain inspectable. Source
fingerprints before and after detect unexpected source/document/configuration
modifications.

The component barrel generator is deterministic and writes only changed
exports, preserving existing Windows or Unix line endings. When intentionally
changing the component manifest, regenerate and review the barrel before
starting the candidate. Ordinary validation builds must not insert a fresh
timestamp into tracked sources.

The gate does not install dependencies, format source, bump versions or run Git
publication. Do not run `do:all`, `git:all` or `git:commit` for this
preparation-only workflow: those commands can commit and push. The HDL runner
uses Playwright's matching Chromium unless `HDL_BROWSER` selects an explicit
executable. Native HDL and live provider opt-ins retain their documented scope;
record skips and environment failures rather than calling them passed. On
managed Windows hosts, Firefox may crash before `newPage` inside a restricted
sandbox. Verify a blank-page launch outside that sandbox before attributing
such failures to application code. Do not weaken browser assertions or count
those launch failures as application passes.

## Review and handoff

1. Review the candidate report and every failed or skipped category.
2. Confirm that dependency, lockfile and release metadata changes are intended.
3. Publish matching organization source changes before the next organization
   update: Promise-aware prompt evaluation and the deterministic barrel
   generator. The [organization replay check](architecture.md) validates actual
   clean/copy behavior in an isolated fixture.
4. Review the prepared commit subject and the complete diff. Commit and publish
   only through a separately authorized action.
5. Deploy matching entry JS, chunks, Worker code and HDL assets together.
   Revalidate entry HTML/JS caches and keep older hashed chunks available while
   older pages remain open.

Historical local integration records remain in this repository; they do not
replace a fresh candidate against the current registry packages and lockfile.

The [1.24.0 validation record](release-validation-1.24.0.md) documents the
completed candidate, environment limitations and publication handoff.
