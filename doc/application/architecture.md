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

Application modules import the public mathjslab-markdown entry points directly:
core types and engine factories from the root, mounting helpers from
/component, renderers from /extensions, and execution adapters from /mathjslab.
The app registers the document component through /component/register. There is
no local copy of the package's source tree or a second set of package entry
modules. New engine behavior belongs in the package.

`src/Markdown.ts` is the application facade. It composes extensions with the
application's MathML conversion, Worker factory, map configuration and plot
renderer. `src/main.ts` and the command adapters mount document components in
existing output containers. Its exports are limited to the configured app
engine and the command-rendering facade; reusable APIs come from the package.
The session-disposal subscription still uses the package
compat/markdown/lifecycle export, isolated in this module because the public
entry points do not expose that hook. An operation abort signal cannot replace
it: ordinary navigation also aborts the previous operation.

The synchronous shell and asynchronous Markdown execution have distinct output
ownership. `CommandOutputTarget` binds output to the command that initiated it.
`InterpreterRuntime` and `PlotOutputCapture` scope interpreter access and plots
to an active evaluation. The reusable Markdown engine does not import those
application modules. Plot requests are captured directly through the kernel
callback for each evaluation; PlotEngine only renders, resizes and disposes
Plotly output. There is no second global plot buffer or numerical function
implementation in that renderer.

## Builds and tests

src/mathjslab.worker.ts is the app-owned production Worker. It configures the
kernel runtime with app external functions and scoped plot capture; it does not
implement another evaluator or Worker protocol.

Eleventy generates localized pages and example scripts. The asset script
validates the recursive example manifest before publishing it. Webpack builds
the application and its optional renderers. Inline CSS imported by the package
must remain CSS source so it can be installed inside Shadow DOM; it must not be
processed by the application's generic style-loader rule.

`npm test` prepares assets and runs type, unit, infrastructure and facade
checks. `npm run test:examples` evaluates the catalogue in all three locales.
`npm run test:browser` builds the component, test Worker and application before
running browser integration tests. See the [test guide](../../test/README.md).

The standalone browser-test build uses package specifiers directly as Webpack
entries. It preserves the existing dist/markdown-document entry URLs and shared
module identity without source shims or app-generated package declarations.
Types come from the installed package. The app owns its Plotly integration,
Eleventy entry script and ESLint configuration; organization synchronization
must preserve those files.

The synchronization manifest is maintained in the organization repository at
input/resource/mathjslab-app/copy.repo.config.json and distributed from
resource/mathjslab-app/copy.repo.config.json. Keep both organization copies and
the app manifest aligned before publishing organization changes and running an
app update. To replay a freshly fetched manifest and the real clean/copy helper
in an isolated checkout, run:

```sh
node script/verify-organization-sync.mjs ../mathjslab-github
```

The check preserves app-owned files, verifies every selected resource and
rejects the obsolete outputFunction and constants JSON resources. Evidence is
written under the ignored report/ directory.

Infrastructure checks enforce this dependency boundary and resolve source
imports, alongside browser tests of app commands, Workers and the standalone
package entry points.

AJV 8 remains an explicit development dependency: the repository installs with
legacy-peer-deps=true, so the AJV peer of ajv-keywords must resolve to the
compatible major version required by the Webpack schema validators. The
infrastructure suite checks that those validators load and validate options.

Package versions and local development references are defined by `package.json`
and the lockfile. Documentation does not substitute for testing the installed
artifacts. Publishing either package is separate from application validation.
