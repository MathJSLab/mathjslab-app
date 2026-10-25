# Release 1.22.1 validation

Prepared on 2026-10-25 with registry mathjslab-markdown 0.9.1 and installed
mathjslab 2.9.0. The user's existing Markdown dependency and lockfile update
were preserved. App root versions are 1.22.1; git-commit.config.json contains
the matching release message. No commit, push, publication or deployment was
performed.

## Changes

The existing all-features preset enables the new note teaching blocks without
an app runtime change. A new three-locale browser regression checks localized
labels, independent numbering, forward/backward references, target IDs and
literal fenced examples, without alert semantics.

The installed introduction now contains ten figures and twelve references. The
real-chapter test was updated to match these authored additions, including
navigation to all eleven distinct targets. Existing visibility, settled
position, diagnostics and document isolation assertions remain in place.
Execution authorization and client-only HDL configuration are unchanged.

## Executed checks

- Production app build passed: Webpack 5.112.0, 303.971 seconds, three known
  warnings. Log: report/release-1.22.1-build.log.
- Documentation, TypeScript, 38 unit tests in nine suites, eight infrastructure
  tests and 16 legacy tests passed. Used npm --ignore-scripts test after the
  production prebuild, avoiding redundant asset generation. Final TypeScript
  passed after browser test changes.
- ESLint reported zero errors and the existing main.ts console warning. Browser
  specs are outside ESLint's current selection; TypeScript covers them.
- All 32 deployed HDL files match the installed package byte for byte. Log:
  report/release-1.22.1-assets.log.
- Menu audit passed: 106 canonical documents per locale and the shared
  Portuguese Digital Electronics contents.
- Nine Chromium scenarios passed, one worker, zero retries: notes, the real
  introductory chapter through the menu, and structured inline
  titles/full-width tables, each in pt/en/es. The chapter checks cover ten
  numbered captions, twelve references and 33 settled navigations across the
  three locales, with no missing/duplicate reference diagnostics or page
  errors. Log: report/release-1.22.1-browser.log. Browser: bundled Chromium
  156.0.8078.4 (Playwright 1.64.1, unchanged from the preceding validation).

The browser tests consume the new production app from a static file server. The
expected GitHub Markdown URLs are routed to actual installed package bytes, not
simplified substitutes. The lockfile diff changes only Markdown and app root
metadata. Build-only tracked date changes were restored to their initial bytes.

## Scope limits

To conserve resources, the full browser matrix, standalone/test-Worker builds,
all example executions and HDL simulations were not repeated. No Firefox,
WebKit, hosted Linux CI or deployed-site result is claimed. Actual public raw
GitHub response bytes were not revalidated; npm example changes alone do not
prove that remote responses are updated.

No broad dependency update, audit fix, clean-all or do:all was run. Existing
security findings were not re-audited or remediated. The do:all script commits
and pushes, contrary to this task's restrictions. See
[release 1.22.0](release-1.22.0.md) for earlier evidence and limits.
