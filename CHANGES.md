# Release notes

All notable changes to this project will be documented in this file. This
project adheres to [Semantic Versioning](http://semver.org/).

# 1.7.0

- The `webpack.config.ts` file has been changed to include the
  `devServer.liveReload` and `devServer.server.type` options in the
  `webpack-dev-server` configuration.
- The `.gitignore` and `.prettierignore` files have been changed to ignore the
  `report` directory.
- The following modifications were made due to comply this application to be
  published as a Android Application in the
  [Google Play Store](https://play.google.com/) using
  [`capacitor`](https://capacitorjs.com/):
    - The `marked` and `mermaid` packages were installed as regular
      dependencies. The `MathMarkdown` class was renamed to `Markdown` (and its
      `MathMarkdown.ts` file to `Markdown.ts`). The default values for
      including mathematical code to be converted to MathML text are now
      `%...%` (`'inline'`) and `%%...%%` (`'block'`). The MathML encoding was
      implemented in the `renderer.codespan` function of `marked`. Due to
      incompatibilities in the dependencies of the `mermaid` package, the
      `chevrotain` package version 11.0.3 was installed as a development
      dependency and the "overrides" field was configured in the `package.json`
      file so that the `mermaid` dependencies use `chevrotain` version 11.0.3.
    - The `plotly.js-dist-min` package was installed as a regular dependency
      and the `@types/plotly.js-dist-min` package was installed as a
      development dependency. The `PlotEngine.ts` file was modified to use the
      dependencies.
    - The `src/DynamicModule.ts` and `importUMD.ts` files have been deprecated.
      The `DynamicModule.ts` file has been deleted and the `importUMD.ts` file
      has been moved to the `script/helper/` directory of the (MathJSLab
      organization repository)[https://github.com/MathJSLab/.github].

# 1.6.1

- The `rimraf` package has been removed from development dependencies and the
  `shx` package has been added. The scripts in the `package.json` file have
  been changed to use `shx rm -rf` instead of `rimraf`. The `ts-node` package
  has been installed and the `"tsx"` script in the `package.json` file was
  created.
- The `script/helper/prettier-unescape-math.ts` script file was created and
  then moved to the organization repository. The `"postformat"` script in the
  `package.json` was created.

# 1.6.0

- The second release of 2025 (`reia`) has been launch.
- After the changes in MathJSLab version 1.7.3, all references to `window` and
  `global` were changed to `globalThis`.
- Bug fix: Sometimes the `marked` module wouldn't load quickly enough, and the
  application couldn't load and process the `README.md` (or `LEIAME.md`, or
  `LEAME.md`) file at the end of the application body. The `waitFor` function
  was created in the `DynamicModule.ts` file to solve this issue. It was
  included in the `appEngine` object.
- Badges with the number of downloads of `mathjslab` from the npm registry and
  the number of hits on the jsdelivr CDN have been added to `README.md`.
- The `src/includes/miscBibtexEntry.njk` file was created with miscBibtexEntry
  macro. It is used to generate the `mathjslab-[language].bib` files with
  corresponding `mathjslab-[language].bib.njk` Nunjucks templates. The file has
  been moved to the organization repository.
- The `webpack-dev-server` configuration has been improved in the file
  `webpack.config.ts`.
- A global configuration (`"ignores"`) has been added to `eslint.config.cjs`
  configuration file and some definitions of rules and plugins has been grouped
  in a constants.
- Update in help files due to MathJSLab version 1.8 update.
- A setting for formatting `.md` files has been added to the `.prettierrc`
  file.

# 1.5.7

- Target and module changed to ES2022 (`tsconfig.json`).
- All dependencies has been updated, including `mathjslab` (version 1.7.3).

# 1.5.6

- The `lint-staged` package has been removed and the
  `@types/eslint-config-prettier` package has been installed. All dependencies
  have been updated.
- The `.scss` files have been changed to match the latest versions of SASS. The
  occurrences of `map-get` and `map-merge` have been replaced by `map.get` and
  `map.merge`.
- The `src/types/module.scss.d.ts` file has been created and the CSS module
  definition (`*.module.scss`) has been added. The `webpack.config.ts` file has
  been changed to reflect these changes.
- The `data/builddata.json` file has been moved to `eleventy.build.json` and
  references to it in the `eleventy.build.mjs` file have been updated.
- The following scripts in the `package.json`file has been renamed:
    - `"download-resources"` to `"download"`.
    - `"clean:download-resources"` to `"clean:download"`.

## 1.5.5

- The `"type": "module"` field has been added to the `package.json` file and
  the command line option to ignore deprecation warnings when running Eleventy
  (`eleventy.build.mjs`) has been removed.
- All exports have been changed to be named exports and the default exports in
  each module have been enclosed in curly braces.
- The `src/fetchPolyfill.ts` file has been removed. There is no longer any
  polyfill/fallback for the `globalThis.fetch` function.
- The `src/showOpenFilePickerPolyfill.ts` file has been improved: it now uses
  safe fallback when accessing `options.types` and `accept`, adds
  `queryPermission` and `requestPermission` methods to mimic the real API,
  returns an array with all selected files if `options.multiple` is set, and
  uses `Object.entries(type.accept ?? {})` to ensure compatibility.
- All dependencies has been updated, including `mathjslab` (version 1.7.2).

## 1.5.4

- All dependencies has been updated, including `mathjslab` (version 1.7.1).
- The `webpack-bundle-analyzer` plugin has been installed as a development
  dependency. The bundle's build report is saved in the `report/` directory.
  Changes have been made to the `webpack.config.ts` file so that the build is
  configured with the options from the `build.config.json` file. The production
  mode bundle has the option to generate the report with
  `webpack-bundle-analyzer`. The development mode bundle has the option to
  configure the `webpack-dev-server` parameters.
- The CSS style reset (the `src/styles/base/_reset.scss` file) has been
  enhanced to include HTML5 elements and MathML elements. The
  `src/styles/element/_math.scss` file has been created to configure MathML
  elements. Because of the addition of new elements in the CSS style reset,
  more style definitions have been added to the
  `src/styles/abstract/_commons.scss` file to configure elements in general
  after reset and to define semantic variables.
- All comments in the `.scss` files has been made using slashes (///).
- The `src/styles/base/_colors.scss`, `src/styles/base/_sizes.scss`,
  `src/styles/abstract/_define-map.scss` and
  `src/styles/abstract/_constants.scss` files have been copied to the
  organization repository and included in the files listed in
  `download.config.json`.
- The `src/styles/constants.json.njk` template was created, which composes a
  JSON file, at build time, with the definitions of CSS variables that are
  immutable. This file was also copied to the organization's repository.
- The file `src/DeviceScreen.ts` was created, which defines an abstract class
  with only static methods and properties (it should not be instantiated). This
  class provides information about the device screen, updated whenever the
  screen is resized. Its use in the project has not yet been implemented.
- Global definitions have been changed to exports. The `appEngine.ts` file has
  been created to concentrate and export the main application definitions that
  were previously global declarations, so that they are accessible throughout
  the project. The definitions in this file are also exported in the
  `globalThis` object. The removal of global declarations was done to improve
  compatibility with ES Modules.
- The files `externalCmdWListTable.ts`, `externalFunctionTable.ts` and
  `outputFunction.ts` were created and the respective definitions that were in
  the `EvaluatorConfiguration.ts` file were moved to them. The functions
  related to graphs were moved to the `PlotEngine.ts` file, and are referenced
  in the other files. The plot functions still need to be implemented.
- The SVG files format setup in the `.prettierrc` has been set to use the HTML
  parser.

## 1.5.3

- All dependencies has been updated.
- OpenAIRE badges included in documentation.
- The application was completely restructured using Web components. Five Web
  components were created to generate the dynamic structure, previously created
  in the `Shell.initialize` method. The use of the `CreateHTMLElement` function
  was removed from the entire project, with its respective file. Web components
  are defined in a standardized way using method factories and generalized
  types and interfaces. Each Web component class has core definitions of
  properties and methods, static or not, based on factory functions and
  generalized types and interfaces.
- The `src/styles` directory was populated with `.scss` template definitions in
  a structure designed to serve the style definitions in a rationalized and
  standardized way throughout the project. The `src/styles/main.scss` file
  includes all these files and gives a description of the structure of the
  styles directory, with its files. The Web component's own style files are in
  each Web component's directory in `src/components/`. These Web components
  style files use and import the files in the `src/styles` directory. Style
  definitions common to more than one Web component are in
  `src/styles/component`. All colors and sizes are defined rationally in the
  `src/styles/base/_colors.scss` and `src/styles/base/_sizes.scss` files
  respectively. The definitions in the `src/base.css` and `src/main.css` files
  have been moved to the `.scss` files and these files have been removed. The
  `src/mais.scss` file has been created to be the entry point for Webpack
  configuration.
- A button to toogle light/dark mode colors has been created in the
  application's interface.
- Modifications were made to the `README.md`, `LEIAME.md` and `LEAME.md` files
  to announce the structure of the Web application in terms of Web components
  and SCSS templates. Because the Web component templates are inserted at the
  end of the `body` element during the Webpack build, it became unfeasible to
  use the application bundle through the CDN. So the old instructions for
  loading the bundle this way in these files were also removed. For the same
  reason the `src/save-bundle.cjs` file and related scripts in the
  `package.json` has been removed.

## 1.5.2

- The `collapsible-content-panel` **Web Component** has been created an used in
  the examples and readme panels. Some other components has been created in the
  `src/components/` directory but they are not yet full implemented and in use.
- All dependencies has been updated.
- Trademark notices in documentation and after abstract has been introduced.
- The `build.env` file has been removed and the packages `dotenv`,
  `dotenv-expand`, `dotenv-webpack`, `ejs` and `@types/ejs` has been removed
  too.
- The `build.config.json` file was created, which is imported by
  `webpack.config.json` to customize some Webpack build configurations.
- A script (`component.include.ts`) was created that processes the
  `component.include.json` file and generates the `components.ts` file used to
  import the project's components. The script also loads the content of the
  templates to be injected into the HTML.
- The use of `global.ShellPointer` inside the `Shell` class has been removed.
  The `ShellPointer` declaration has been moved to the `main.ts` file and the
  instantiation of `Shell` in the `bootstrap` function has been assigned to
  `global.ShellPointer`. The `bootstrap` function has been made asynchronous
  for this reason. The `export input` in the `main.ts` has been removed. The
  `global.ShellPointer` variable has been kept as it is required in the
  `EvaluatorConfiguration.ts` file.
- The `cross-env` package has been instaled as development dependency and the
  scripts in the `package.json` file has been made platform-independent.
- The `src/types/scss.d.ts` file has been renamed to
  `src/types/styles.scss.d.ts`. The definitions are specialized for importing
  styles from Web components in the form of a string.
- The `cleanNameList` method has been removed from `Shell` class. It's reduced
  to a single instruction: `this.nameList.replaceChildren()`. The
  `replaceChildren` with no arguments do the same: removes all child nodes.
- The `CreateHTMLElement` function has been converted to an arrow function,
  making its code more concise. The arguments were renamed to be more
  significant.
- The `fetchPolyfill` function has been changed to test if the native
  `Response` class is available using it if it is. Otherwise it creates an
  object imitating the methods of the `Response` class.
- Bug fixes and improvements to the `src/styles/abstract/_commons.scss` file.

## 1.5.1

- The MathJSLab logo has been modified. It is built on the MathJSLab
  organization repository, and the 'mathjslab-app' application downloads the
  logo-related files (and other common files too) from the organization
  repository using the `download-files.cjs` script, which also provides a means
  to clean up the downloaded files. The download of these files is triggered by
  the script in the `package.json` file called "download-resources".
- Some changes to the `package.json` file scripts, including scripts to install
  and remove dependencies related to the android apk build.
- Various packages are installed as project development dependencies, among
  them the packages necessary to build Nunjucks templates such as Eleventy, EJS
  and SASS templates. The `data` directory was created to support the building
  of Nunjucks templates using Eleventy (with `script/helper/EleventyUtil.mjs`).
- The `src/build-configuration.json` and `sitemap.xml` files is now generated
  by Nunjucks templates. Previous scripts used to generate this files has been
  removed.
- The `src/component/` directory has been created to contain reused components
  using the **Web Components** suite. The `src/style/` directory has been
  created to contain CSS stylesheets, SASS templates and other related files.
  It has been populated with a subdirectory structure and some `.scss` template
  files.
- The `src/types/` directory has been created with `src/types/scss.d.ts` file
  to tells TypeScript that any file with the `.scss` extension can be imported
  as a module that exports a string. The `tsconfig.json` file has been modified
  to include `paths` and `typeRoots` fields pointing to this type definitions
  directory.
- The `script/tsconfig.json` file has been created with TypeScript
  configurations for the build scripts in the `script` directory. The
  `eslint.config.cjs` file has been enhanced to reflect these updates.
  Additional rule sets have been added. Rules for all build-time code are now
  more permissive. A rule has been added to lint JavaScript files too.

## 1.5.0

- The application has been renamed to 'mathjslab-app', with the repository also
  being renamed. All references to the name have been updated.
- The '@capacitor/core' and '@capacitor/android' packages has been installed as
  regular dependencies and '@capacitor/cli' package has been installed as
  development dependency. Build scripts for android apk added in 'package.json'
  file. The generated directory 'android' by apk build scripts added to
  exclusion in '.gitignore' file.

## 1.4.0

- Dependencies update.
- The application has been renamed to 'mathjslab-demo', with the repository
  also being renamed. All references to the name have been updated.
- The '.gitignore' file has been revised, removing unnecessary selections.

## 1.3.0

- Change repository owner to MathJSLab GitHub organization:
  https://github.com/MathJSLab . Changes in repository references in
  'package.json' file and documentation.
- The 'dotenv' and 'dotenv-webpack' packages has been installed and some
  boilerplate values has been defined as environment variables in the
  'build.env'. The exception to save this file in the repository has been added
  to '.gitignore' file and 'webpack.config.ts' has been modified too to include
  plugin and environment variables use.
- Changes in the 'webpack.config.ts': `path.resolve` changed to `path.join`
  when possible. More rational path specifications. JavaScript files selection
  removed from regular expression test (`configuration.module.rules[0].test`).
  The exclude field has been specified by full path. The `ignoreWarnings` field
  has been removed. The entire configuration file has been revised.
- The 'images/icons' directory has been removed. Multi-sized versions of the
  'mathjslab-logo.svg' file have been created in PNG format in the 'images'
  directory. And two versions (light and dark) of the favicon have also been
  created. The definitions of the standard and maskable icons in the
  'manifest.json' file are the same.

## 1.2.4

- The 'script' directory has been renamed to 'm-file' and the 'util' directory
  has been renamed to 'script'.
- The 'clean-package-lock.cjs' file was copied from the mathjslab package to
  the 'script' directory and the corresponding build script was created in the
  'package.json' file.
- The constant `modulesConfiguration` in 'DynamicModule.ts' was moved to a
  static property inside DynamicModule class.
- The 'ts-node' package has been removed and the 'tsconfig-paths' and 'tsx'
  packages have been included in the development dependencies. Webpack set to
  run under 'tsx' in 'package.json' scripts.
- Improvements to the 'webpack.config.ts' file to remove the need to configure
  the NODE_ENV environment variable before building with Webpack. Webpack
  configuration was hardcoded as factory.
- Changes in 'manifest.json' file ("description" and "categories" fields).
- Changes to build scripts ('script' directory): some console messages issued
  using `console.warn` instead of `console.log`.
- Change `throw new Error( ...` to `throw new URIError( ...` in function
  `loadText()` in the 'main.html' file.
- Setting Open Graph meta tags in the 'main.html' file. The files
  'mathjslab-logo-1200x630.svg' and 'mathjslab-logo-1200x630.png' have been
  added to the 'images' directory.

## 1.2.3

- Domain setup (mathjslab.com). Set as "homepage" in 'package.json' file.
- Dependecies update.
- Configurations in '.eslintrc.js' (removed) modified to flat config in
  'eslint.config.js'.
- File '.npmrc' created. Configuration legacy-peer-deps set to true.
- Badge 'GitHub Created At' added to 'README.md' (and portuguese 'LEIAME.md'
  and spanish 'LEAME.md').
- Changes in MathMarkdown.initialize (`renderer` methods definition) due to
  marked package updates.
- Redefinition of "keywords" in 'package.json' and 'meta' HTML tags. Same
  keywords set in "categories" of 'manifest.json'.
- Updates to the 'robots.txt' file and the creation of the 'sitemap.xml' file
  for better SEO practices.
- The application title has been changed to 'MathJSLab'. The application is the
  project page.

## 1.2.2

- Files 'importUMD.ts' and 'DynamicModule.ts' to load external modules by CDN
  dynamically. Now 'ScriptLinkLoad.ts' is unused and removed.
- [Plotly.js](https://plotly.com/javascript/) to generate graphics.
  "@types/plotly.js" devDependencies installed.

## 1.2.1

- Full responsiveness, including light/dark mode.
- Button and command 'openfile' to open file from computer.
- File names converted to camel case.
- Polyfill for `window.fetch` (for old browsers) and
  `window.showOpenFilePicker` (for other than Chrome).
- Functions from `basic-dom-helper` package moved to inside project (files
  'createHTMLElement.ts' and 'ScriptLinkLoad.ts') and `basic-dom-helper`
  package dependency removed.
- Mermaid charts rendered in markdown files.
- Open files from device with `load()` and `markdown()` (without parameters).

## 1.2.0

- Support for multiline statements.
- External function names assigned in `Evaluator.localTable` with random UUID.
- Logo in svg format (at images/mathjslab-logo.svg).
- Start implementation as a Progressive Web Application. The file
  'manifest.json' has been created and the folder images/icons has been created
  too with icons.
- Improves in responsiveness.

## 1.1.1

- Translations of 'README.md' file to portuguese 'LEIAME.md' and spanish
  'LEAME.md'
- Translation of spanish help completed.
- Multiple languages and menu of language selection.
- Creation of bootstrap function in evaluator-configuration.ts file.
- Changes in build scripts of package.json.
- Creation of script folder with some examples.
- Creation of CONTRIBUTING.md and CODE_OF_CONDUCT.md files.
- Creation of 'Contributing' session in 'README.md' file (in portuguese
  'LEIAME.md' and spanish 'LEAME.md' too).
- More examples (to test multidimensional arrays).

## 1.1.0

- Project launch.
- Translation of portuguese help completed.
- `markdown` function.
- Bug fix in aliasTable (remove some overlaps).
- doc folder created with some markdown files for tests.

<a href="https://www.flaticon.com/free-icons/maths" title="maths icons">Maths
icons created by Prosymbols - Flaticon</a>
