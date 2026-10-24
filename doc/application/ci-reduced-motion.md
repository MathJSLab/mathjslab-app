# CI reduced-motion fragment test

## Reported failure

The supplied GitHub Actions log has one failed logical test (Chromium,
markdown-document.accessibility.spec.ts, reduced-motion fragment scrolling),
246 passed and 11 skipped. All three attempts of that test failed with an empty
scroll-call array. Progress reaching 260/258 includes its two retries; it does
not mean two extra tests were registered.

The test took a single snapshot immediately after clicking. The installed
component schedules scrolling in requestAnimationFrame after navigation layout
updates. Awaiting Playwright's click does not guarantee that callback already
ran. In addition, the old spy replaced native scrolling with a no-op, so it
could not verify the actual destination.

## Correction

Only the application browser test changes; the engine/runtime, dependency
versions, workflow, retry policy and application behavior remain unchanged. The
spy records calls for the intended target and forwards to the native
scrollIntoView. The test waits for the expected auto/start call with
expect.poll instead of taking an immediate snapshot.

The target is deliberately placed below the viewport, with trailing page space
to avoid scroll-limit false positives. It must start outside the viewport and
finish entirely visible after 15 stable animation frames. The host URL must
stay unchanged. There is no fixed sleep, larger assertion timeout, visibility
relaxation, browser exclusion or diagnostic suppression.

## Evidence

Ten runs of the original pointer-click test passed on Windows; the supplied
Linux CI failure was not reproduced with that unmodified test locally. A
separate browser probe using the actual component dispatches the link click and
reads the calls in the same JavaScript turn, then waits for the deferred
result. Chromium 156.0.8078.4 returned:

```json
{
    "immediate": [],
    "deferred": [{ "block": "start", "behavior": "auto" }]
}
```

This confirms the invalid ordering assumption without changing the component or
supplying an artificial scroll result. Evidence:
report/ci-reduced-motion-event-order.json and its ignored probe script.

The corrected test passed 30 cases: ten repetitions each in Chromium, Firefox
and WebKit, sequentially with one worker, zero retries and no skips (2.2
minutes). Native scrolling and stable full visibility were checked in every
repetition. TypeScript and the targeted Prettier check passed.

Logs: report/ci-reduced-motion-before.log, report/ci-reduced-motion-after.log,
report/ci-reduced-motion-types.log and report/ci-reduced-motion-format.log.

The related regression then passed all 39 cases across the three engines,
sequentially with one worker and zero retries/skips (6.5 minutes): 18
accessibility cases, nine localized heading-reference cases, nine real-chapter
menu cases and three document-isolation cases. Evidence:
report/ci-reduced-motion-regression.log. These results are separate from the
original 258-case hosted run and its retries.

## Scope

Validation uses the existing [production 0.8.3 distribution](release-1.21.2.md)
and the real installed example catalogue. No browser-consumed files are rebuilt
concurrently. The source change does not require a Markdown package fix or
republication. The complete 258-case matrix, native HDL matrix, public Markdown
downloads, production build and hosted Linux CI are not rerun as part of this
test-only correction. Local browsers are Windows Playwright engines, not native
macOS Safari. Firefox requires host execution outside the local tool sandbox.
No version increment, commit, push, package publication or deployment is done.
