# Markdown integration in the application

Rendering, navigation, resource policy and the `<markdown-document>` component
are implemented by `mathjslab-markdown`. The app supplies its engine and
browser adapters through `src/Markdown.ts`.

## Document entry points

| Entry           | Loading and presentation                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| `markdown(url)` | Resolves the URL and mounts a component with `src` in the current command output    |
| `markdown()`    | Adds a user-facing local-file button, reads the selected file and mounts its text   |
| `help topic`    | Resolves aliases and locale, loads a help file, then mounts its text and source URL |
| `help`          | Loads the help overview and adds the ordered list of built-in functions             |
| Page README     | Selects the localized README and mounts it in the page's document container         |

`externalFunctionTable.ts` owns `markdown`, `externalCmdWListTable.ts` owns
`help`, and `main.ts` loads the README. They use `mountMarkdownDocument` rather
than reproducing component loading or navigation. The component owns its
document session; the app owns the surrounding prompt, batch entry or page.

The output target is captured before asynchronous work begins. A later response
therefore remains attached to its originating command. States such as `doc`,
`info` and `bad` are application UI states, not Markdown engine states.

## URLs and local files

`markdown(url)` resolves relative paths from `new URL('../', location.href)`.
On a localized page such as `/pt/index.html`, `markdown('help/en/abs.md')`
targets `/help/en/abs.md`. Absolute URLs and root-relative paths keep their
normal meaning. Links inside a loaded document use that document's `sourceUrl`.

Remote command loading is unavailable under `file:`; the page README is also
not fetched in that mode. The local-file path is separate and uses
`openFileDialog`, including the browser's file-input fallback. The button is
installed after the synchronous interpreter has written its expression result,
so it is not overwritten by that output.

`help` rejects HTML responses, including a hosting fallback page returned with
status 200. Do not assume every Markdown-loading entry point makes this same
check. The shell remains synchronous: starting a document load does not make
the evaluator wait for its network request.

## Rendering and ownership

The historical facade exposes `parse`, `typeset`, `renderDocument`, navigation
and disposal. New document consumers should mount the component or use managed
document sessions. Low-level `parse()` returns unsanitized HTML and is not a
safe replacement for the managed rendering APIs.

The facade installs document-local navigation and exposes it through
`Markdown.getNavigator(container)`. A session replacement releases the old
navigator. Removing a hosted component or calling `disposeMarkdownDocument`
releases its session without disposing a shared external engine.

The app explicitly opts into OpenStreetMap baselayers. Change the default,
provider list or selector in `src/MarkdownMapConfiguration.ts`; map rendering
continues to belong to the package. See the package's
[map-provider guide](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/map-providers.md).

For reusable API contracts, presets, component events and resource limits, see
the
[package documentation](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md).

## Example catalogue

The app uses the published `mathjslab-markdown` 0.5.3 package and registers the
complete educational preset. All 83 teaching notes and the localized index have
menu launchers in English, Spanish and Portuguese, including the music lesson
on Pythagorean tuning and equal temperament. See the
[example catalogue](../../example/README.md) for the offline coverage audit.
