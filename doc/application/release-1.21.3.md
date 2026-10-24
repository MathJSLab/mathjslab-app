# Release 1.21.3 validation

Prepared with the registry distribution mathjslab-markdown 0.8.4; mathjslab
remains 2.9.0. App/package-lock root versions and local commit-message helper
are 1.21.3. Existing work is preserved. No commit, push or publication is done.

## Scope chosen to conserve resources

The package adds localized warning teaching blocks and Boolean TeX/SVG tests
and documentation. The existing all-features app preset enables warning blocks
without a runtime configuration change. The sibling source comparison against
v0.8.3 showed no changes in src/markdown/hdl or assets/hdl. This is supporting
source evidence; deployed asset integrity is verified independently.

Only the production app build is rebuilt. Standalone/test-Worker builds, the
full multi-engine matrix, native HDL execution and the complete example
execution catalogue are not repeated. Earlier broader validation remains
historical evidence, not a claim that those checks ran for this candidate. See
[the previous release](release-1.21.2.md).

## Checks

TypeScript, 38 unit tests in nine suites, eight infrastructure tests and 16
legacy tests passed. ESLint has zero errors and the existing main.ts console
warning. Browser specs are outside ESLint's current selection; TypeScript and
real-browser validation cover the new spec.

The install reports 36 dependency audit findings (33 high, three moderate),
unchanged in count. No audit fix/force or broad dependency upgrade was run. The
installation used process-only Node --use-system-ca, retaining TLS checks.

Targeted browser scope: localized warning headings, independent counters,
forward/backward references and literal fenced examples; existing localized
heading references and the actual Digital Electronics chapter through the menu.
These use the new production app bundle in Chromium, without a backend.
Build/browser/asset results are recorded after completion below.

Logs use report/release-1.21.3-* names. No do:all, deployment or compiler
rebuild is performed. Runtime policies, explicit HDL authorization and disposal
remain unchanged. The current run does not validate hosted Linux CI or a
deployed URL.

## Production and targeted browser results

Production app build passed (290.973 seconds, three existing Webpack warnings).
All 32 deployed HDL files and the molecular license match the installed package
byte for byte. The app's registry dependency is not a symlink; the lockfile
comparison changes only Markdown plus root app version metadata. Generated
build-only date changes were returned to their initial bytes.

The initial selected browser run passed all six warning/heading cases and found
three outdated chapter expectations: the installed chapter now has eight
figures rather than six, plus section/table references. The regression was
updated for the actual new chapter: eight captions, nine references, and
navigation to all eight distinct figure/section/table targets. Existing
figure-caption full-element visibility checks remain unchanged. For the newly
checked section heading, native scroll rounding placed the border edge 0.4375
px above the viewport; the test now requires its complete text Range to be
inside the viewport, with no numeric visibility tolerance, as well as stable
position. This does not change application CSS, scrolling, grammar or the
resolver.

Initial and intermediate failures are retained in
report/release-1.21.3-browser.log and report/release-1.21.3-chapter-final.log.
Corrected chapter results are recorded in
report/release-1.21.3-chapter-verified.log. Final TypeScript passed after the
chapter test changes. The broader matrices and native HDL checks were
deliberately not repeated under the user's resource constraint. Public raw
GitHub downloads were not revalidated; chapter tests retain the expected app
URL and serve the actual installed chapter bytes there.

Final outcome: all nine selected scenarios passed across the initial six
warning/heading successes and the corrected three chapter cases. The chapter
checks include 24 settled navigations. Runs used Chromium 156.0.8078.4, one
worker and zero retries. No Firefox/WebKit or deployed-site result is claimed
for 0.8.4. Versions are 1.21.3 / Markdown 0.8.4 / kernel 2.9.0; the
commit-message helper is prepared. No commit, push or publication was
performed.
