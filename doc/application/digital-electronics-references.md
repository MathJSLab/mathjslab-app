# Digital Electronics references in the app — 2026-10-24

Historical local-only validation before the 0.8.3 source publication. See the
[1.21.2 release validation](release-1.21.2.md) for the installed catalogue,
current public response and subsequent browser results. The initial findings
below are preserved rather than treated as the current public-source status.

## Public source and local correction

The app still requests the shared Portuguese book at
https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/pt/.
The public chapter was downloaded directly, without a browser route, before
local validation. It still contains the broken multiline openings. Updating npm
cannot replace this response. No claim is made that the deployed app is fixed.

| Source                    |  Bytes | SHA-256                                                          |
| ------------------------- | -----: | ---------------------------------------------------------------- |
| Public chapter response   | 30,462 | f6ce82dad7bca80aa75c25f16997b4e9cca954ca59682dcb5e658af9ed2f6d86 |
| Corrected sibling chapter | 30,637 | 96ad78bb6964ee22cfbd4dcc9dc99d2db8f1d332d76962545ee377e1789a4b2d |

The local chapter has seven protected single-line openings (six figures and
exercise 4). Source evidence is retained in
report/chapter-source-comparison.json and report/chapter-public-response.md.
The installed engine remains 0.8.2.

## App regression

The new browser tests use the existing production app build and its real
localized Examples menu. The shared Portuguese README and complete chapter are
read as bytes from the sibling checkout and fulfilled at the exact raw GitHub
URLs the app requested. The chapter is not replaced with a simplified fixture.
No app policy, grammar, resolver or runtime is modified.

Each menu locale checks six figure labels, exercise 4's registered identifier,
and the four actual figure links (1, 2, 3 and 5). Text follows the viewer's
actual locale. No literal reference or displaced figure/exercise identifier is
allowed. Reference diagnostics and page errors are collected. Every link is
clicked; after two seconds, three samples must show its entire caption in the
viewport with less than one pixel of movement. The final visibility assertion
requires the complete caption, and the host URL must stay unchanged.

Existing localized heading navigation tests run alongside these cases. A
supplemental test uses the real Portuguese didactic lesson in two viewers
sharing an engine, removes one target from the second document, and verifies
that its unresolved references stay local and produce missing diagnostics.
Literal inline/fenced code is preserved, and figure IDs are document-scoped.
This intentional missing target is separate from the chapter's zero-missing
requirement.

The new tests require a real example checkout, defaulting to the sibling
mathjslab-markdown/example directory. MARKDOWN_EXAMPLE_SOURCE_ROOT can select
another checkout's example directory. Without those sources they explicitly
skip rather than replacing the real chapter with synthetic content. No browser
was excluded or skipped in this validation.

Evidence uses report/chapter-references-{chromium,firefox,webkit}.log and
report/chapter-{engine}-{locale}.json where generated. JSON includes source
hashes, effective locale, diagnostics and final geometry. The first Chromium
and Firefox runs preceded adding persistent JSON output; their passing logs
remain separate evidence.

A resource-url-blocked warning from the app's introductory LEIAME.md (mailto:
protocol) was observed in the Portuguese session before the chapter loaded. It
is retained in diagnostics and is not a missing/duplicate chapter reference.

## Executed results

The final selection passed seven cases per engine, sequentially with one worker
and zero retries: Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2, using
Playwright 1.64.1 on Windows. All 21 cases passed with no skips or failures:
nine chapter/menu scenarios, nine heading-navigation scenarios and three
shared-engine isolation scenarios. The chapter scenarios include 36 settled
figure-reference navigations. An initial six-case Chromium run also passed; the
final Chromium run includes the added isolation check and JSON evidence.

All six captions and all four existing references were correct in every menu
locale. Effective viewer locales were pt/en/es, respectively; caption/link text
was Figura/Figure/Figura. Figure targets 1, 2, 3 and 5 resolved correctly. No
literal references, displaced identifiers, missing/duplicate reference
diagnostics or page errors occurred in the chapter scenarios. The separate
introductory mailto warning described above was retained in every menu session.
The deliberate missing target in the isolation test still emitted its warning.

TypeScript checks and documentation validation passed. There were no runtime,
dependency, menu, version or deployment changes. Firefox ran outside this
environment's sandbox because of its known local sandbox launch limitation.

Reproduce each engine separately with MARKDOWN_BROWSER_PROJECTS=all and:

```sh
npx playwright test test/browser/markdown-real-chapter-references.spec.ts test/browser/markdown-heading-references.spec.ts test/browser/markdown-reference-isolation.spec.ts --project=chromium --workers=1 --retries=0
```

Then use --project=firefox and --project=webkit sequentially. The real chapter
must be available at the source path documented above. Final Chromium evidence
is in report/chapter-references-chromium-final.log; browser versions are
recorded in report/chapter-browser-versions.json.

## Validation limits and follow-up

This is a local integration test of the existing production build, not a new
build, deployed-session test, development-server matrix or full application/HDL
regression. Playwright's Windows engines do not prove native macOS Safari or
hosted Linux CI. ESLint currently does not select browser TypeScript specs;
that ignored-file result is not presented as lint coverage of the new tests.

The corrected Markdown must reach the raw GitHub branch used by the app before
the public application can receive it. Then download and hash the public bytes
again and repeat the menu/chapter checks without routing. No publication,
deployment, commit or push was performed here; no dependency/version bump is
needed for this content fix.
