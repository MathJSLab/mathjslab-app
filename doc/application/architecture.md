# Application architecture

`mathjslab-app` is a TypeScript browser application and Progressive Web App.
Web Components provide the shell and its controls; Sass provides the
application styles. The application is a consumer of reusable packages, not a
second implementation of their engines.

| Layer                          | Owner                | Responsibility                                                                                     |
| ------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------- |
| Language and numerical runtime | `mathjslab`          | Parser, numeric values, evaluation, resumable sessions and serializable plot requests              |
| Markdown rendering             | `mathjslab-markdown` | Engine, document component, navigation, extensions and document resources                          |
| User interface and adapters    | `mathjslab-app`      | Prompt, batch editor, locale, theme, examples, browser commands, Worker setup and Plotly rendering |

The modules under `src/markdown/`, the public Markdown entry points and
`src/components/markdown-document/` delegate to `mathjslab-markdown`. Keeping
these compatibility modules does not transfer implementation ownership back to
the app. New engine behavior should be implemented and tested in the package.

`src/Markdown.ts` is the application facade. It composes extensions with the
application's MathML conversion, Worker factory, map configuration and plot
renderer. `src/main.ts` and the command adapters mount document components in
existing output containers.

The synchronous shell and asynchronous Markdown execution have distinct output
ownership. `CommandOutputTarget` binds output to the command that initiated it.
`InterpreterRuntime` and `PlotOutputCapture` scope interpreter access and plots
to an active evaluation. The reusable Markdown engine does not import those
application modules.

## Builds and tests

Eleventy generates localized pages and example scripts. The asset script
validates the recursive example manifest before publishing it. Webpack builds
the application and its optional renderers. Inline CSS imported by the package
must remain CSS source so it can be installed inside Shadow DOM; it must not be
processed by the application's generic style-loader rule.

`npm test` prepares assets and runs type, unit, infrastructure and facade
checks. `npm run test:examples` evaluates the catalogue in all three locales.
`npm run test:browser` builds the component, test Worker and application before
running browser integration tests. See the [test guide](../../test/README.md).

Package versions and local development references are defined by `package.json`
and the lockfile. Documentation does not substitute for testing the installed
artifacts. Publishing either package is separate from application validation.
