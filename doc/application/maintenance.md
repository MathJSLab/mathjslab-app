# Maintenance workflow and Git publication

Run the complete local maintenance workflow with:

```sh
npm run do:all
```

The workflow runs these stages sequentially and stops at the first nonzero exit
code:

| Stage              | Command                         | Purpose                                                                                                             |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Clean              | npm run clean:all               | Remove generated and synchronized files, then dependencies and the lockfile                                         |
| Update             | npm run update                  | Update dependency ranges, install packages, synchronize organization resources and compile build helpers            |
| Browsers           | npm run install:browsers        | Install Chromium, Firefox and WebKit versions matching Playwright                                                   |
| Format and lint    | npm run format:lint             | Format maintained files and run ESLint with fixes                                                                   |
| Build              | npm run build:test-browser      | Build the standalone package entry points, observation Worker and production application                            |
| Application checks | npm run test:checks             | Check documentation, Markdown catalogue coverage and types, then run unit, infrastructure and legacy Markdown tests |
| Examples           | npm run test:examples:run       | Execute the generated catalogue in all three locales                                                                |
| HDL assets         | npm run verify:hdl:assets:built | Compare deployed HDL assets byte for byte with the installed package                                                |
| Browser matrix     | npm run test:browser:all:run    | Run Chromium, Firefox and WebKit with one worker and zero retries                                                   |
| Measurements       | npm run measure:markdown        | Write chunk measurements under test/result                                                                          |
| Git publication    | npm run git:all                 | Stage repository changes, obtain the commit message through the existing helper, commit and push                    |

The final Git stage is reached only after every preceding stage succeeds. The
workflow uses the configured Git branch, remote and authentication, just as the
individual Git scripts do. It does not publish an npm package. Browser OS
prerequisites must already be installed; the browser-install stage downloads
the matching browser binaries.

Inspect the exact sequence without executing any stage:

```sh
npm run do:all -- --dry-run
```

The runner uses Node built-ins and reports elapsed time even when a stage
fails. Its own execution does not depend on tsx remaining installed while the
workspace is cleaned. clean:all removes synchronized files before deleting
node_modules, so the copy helper and shx remain available when needed. The
final dependency cleanup uses the app-owned script/clean-dependencies.mjs and
Node built-ins, because clean:copy removes the shared cleanup helper itself.

## Reusing prepared builds

The commands ending in :run and test:checks consume prepared artifacts without
invoking pretest build hooks. This keeps the production files stable throughout
the validation phase. The existing npm test, test:examples and test:browser:all
commands still prepare their own prerequisites when invoked separately.

Formatting includes Markdown and excludes generated test results, reports,
dependency caches and local package snapshots through .prettierignore.

The browser matrix retains the existing explicit opt-ins for native HDL
integration and live map-provider checks, and skips WebGL-dependent cases when
WebGL is unavailable. See the [test guide](../../test/README.md) and
[HDL validation guide](hdl-validation.md) for those prerequisites and commands.

## Testing the publication gate

The infrastructure suite runs the actual workflow runner against a fake npm
executable in temporary directories. It checks the complete successful
sequence, a failure at every prerequisite, dry-run behavior, exit-code
propagation and rejection of unknown options. These tests do not update real
dependencies or run real Git commands.

The observation Worker build has its own prebuild hook for Eleventy and assets.
Its TypeScript configuration also checks application modules, so both generated
src/build-configuration.json and src/first-example.json must exist before that
compilation, even when the production application has not been built yet.
