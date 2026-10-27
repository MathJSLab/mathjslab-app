# HDL integration and validation

## Application configuration

The installed mathjslab-markdown package owns HDL rendering, compilers and
runtime assets. The app configures createBrowserHDLExecutor in
src/MarkdownHDLConfiguration.ts with explicit browser execution authorization,
a 30-second job timeout and a maximum of four logical sessions. It enables the
hdl and hdl-interactive execution policies. Document content cannot grant
application authorization; document policies can further restrict execution.

Verilog uses Icarus WebAssembly for compilation and simulation and YoWASP for
synthesis. The packaged VHDL-2008 profile uses NVC for simulation and
interactive replay, with GHDL and YoWASP for synthesis. Work runs in browser
Workers with in-memory files; the server delivers static resources. Supported
language, library and replay limits belong to the installed package, not to
this guide.

## Dependency and asset verification

The normal installation uses the registry dependency and integrity recorded in
package-lock.json. Verify the installed distribution and its pinned HDL hashes:

```sh
npm run verify:hdl:assets
```

MarkdownRuntimeAssetsPlugin in script/helper/markdown-runtime-assets.mjs copies
the complete HDL asset tree, including Workers, loaders, Wasm, libraries,
notices, licenses and toolchain lock. Assets retain their original bytes in
both application and standalone component builds.

```sh
npm run build:prod
node script/verify-hdl-assets.mjs dist/hdl
```

The second command checks the complete deployed inventory byte for byte against
the installed package. It does not independently rebuild the compiler
toolchain.

## Static hosting

The app resolves hdl/ against the loaded bundle's Webpack public path. A bundle
served under /lab/ therefore loads its runtime from /lab/hdl/, independently of
the document URL or interface language. Preserve that directory structure and
serve .js/.mjs as JavaScript and .wasm as application/wasm.

The validation server in test/browser/hdl-static-server.mjs demonstrates the
application CSP: same-origin scripts and connections, WebAssembly compilation
permission, and same-origin/blob Workers. It also permits the shell's inline
scripts/styles. Its development mode adds unsafe-eval for the bundler;
production omits that permission. Review the complete application policy when
changing hosting or other renderers.

## Browser validation

After building the app, run:

```sh
npm run test:hdl:browser
```

The runner opens the full application, loads lessons through markdown(url),
checks actual results and exports, and exercises interactive controls,
authorization, cancellation and disposal. Reports and screenshots go to
report/. A passing asset check alone does not establish execution correctness.

This runner requires local lesson sources. Its static server defaults to the
sibling mathjslab-markdown/example directory; HDL_LESSONS_DIR can select
another example directory. The registry installation and normal app build do
not require that sibling checkout.

| Variable          | Purpose                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| HDL_BROWSER       | Installed Chromium-compatible executable; the runner defaults to the Windows Chrome path |
| HDL_APP_DIST      | Static build directory; defaults to dist                                                 |
| HDL_APP_URL       | Existing app server; bypasses the runner's static server                                 |
| HDL_APP_MODE      | Report/server mode; defaults to production                                               |
| HDL_LESSONS_DIR   | Lesson source directory for the runner's static server                                   |
| HDL_REPORT_SUFFIX | Suffix used for generated report names                                                   |

For the development-server harness, first generate the usual app assets with
npm run prebuild:dev, then start:

```sh
npx tsx --require tsconfig-paths/register node_modules/webpack-dev-server/bin/webpack-dev-server --config webpack.hdl-validation.config.ts --mode development
```

Wait for compilation. In another terminal, select HDL_APP_MODE=development and
HDL_APP_URL=http://127.0.0.1:4174 before running the browser check. This
Webpack configuration serves lessons from the sibling example directory. Remove
those environment overrides before returning to production validation. Avoid
rebuilding files while a browser check is consuming them.

## Optional package development

A deliberate file:../mathjslab-markdown dependency is supported by the asset
verifier. Build the sibling package before installing and building the app; the
app consumes its compiled distribution, not its TypeScript sources.

For an isolated tarball, npm run prepare:markdown:local packages the already
built sibling distribution into an ignored vendor/ directory and writes its
hash metadata. It does not change package.json. Explicitly select the generated
file:vendor/<archive> dependency, install it, and rerun asset verification. The
directory is unnecessary for registry installations and can be deleted when no
selected dependency references it. Return to the registry dependency and
refresh the lockfile when finished.

Compiler provenance, corresponding sources, licensing and supported language
profiles are maintained with the package distribution. Historical application
validation counts and release preparation logs are not current support claims.
