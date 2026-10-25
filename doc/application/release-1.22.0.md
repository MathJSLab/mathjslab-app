# Release 1.22.0 validation

Prepared on 2026-10-25 with the registry distribution mathjslab-markdown 0.9.0
and mathjslab 2.9.0. The existing package/lockfile update to Markdown 0.9.0 was
preserved. Only Markdown changes in the dependency graph relative to the
previous release; root app versions are now 1.22.0. The local
git-commit.config.json contains the matching release message. No commit, push,
package publication or deployment was performed.

## Scope and results

The existing all-features preset consumes inline structured block titles,
including mathematics and cross-references, and opt-in full-width tables. No
application runtime or execution authorization changes were needed.

- Production app build passed: Webpack 5.112.0, 299.021 seconds, three existing
  warnings. Logs: report/release-1.22.0-build.log.
- Documentation, TypeScript, 38 unit tests in nine suites, eight infrastructure
  tests and 16 legacy tests passed. The test command used npm --ignore-scripts
  test after the production prebuild had already generated assets, avoiding a
  redundant Eleventy build. Final TypeScript also passed after browser spec
  edits.
- ESLint reported zero errors and the existing console warning in main.ts.
  Browser specs are outside its current selection; TypeScript covers them.
- All 32 deployed HDL files match the installed package byte for byte. Logs:
  report/release-1.22.0-assets.log.
- The menu audit covers 106 canonical documents exactly once per locale, plus
  the shared Portuguese Digital Electronics contents. The new generic
  structured-blocks.md example is tested directly through markdown(url).
- Chromium 156.0.8078.4: six existing heading/warning scenarios passed across
  pt/en/es, followed by three passing structured-title scenarios. Runs used one
  worker and zero retries against the production app served as static files.
  The real installed structured-blocks.md bytes were routed at the expected
  GitHub URL, without simplifying its contents. Assertions cover bold/math
  titles, a resolved reference inside a title, table width, table rows, literal
  fenced MathJSLab syntax and absence of page errors or unresolved reference
  markers.

The first browser run passed six cases and failed the three new cases because
their new assertion incorrectly expected a literal #function href. The engine
correctly generates document-isolated target IDs. The assertion now compares
the actual target ID, matching existing reference tests. Table width is
compared with the container content box, excluding its padding. No runtime
workaround or resolver change was introduced. Initial failures remain in
report/release-1.22.0-browser.log; the corrected three-case run is in
report/release-1.22.0-structured-final.log. All nine unique selected scenarios
passed across these two runs.

## Deliberate limits

To conserve resources, standalone and test-Worker bundles, the full browser
matrix, the complete example execution catalogue and native HDL simulations
were not rebuilt or repeated. No Firefox, WebKit, hosted Linux CI or deployed
site validation is claimed for this candidate. Public raw GitHub response bytes
were not revalidated; the installed package supplied the tested example. Prior
results remain historical evidence, as documented in
[release 1.21.3](release-1.21.3.md).

No broad dependency update, audit fix, clean-all or do:all was run. Existing
dependency security findings have not been remediated or re-audited here. The
do:all script also commits and pushes, so it does not satisfy this request's
restrictions. Build-only tracked date changes were returned to their initial
bytes. Client-only HDL processing, explicit authorization, disposal policies
and the kernel version remain unchanged.
