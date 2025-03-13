# Release notes
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
elements. Because of the addition of new elements in the CSS style reset, more
style definitions have been added to the `src/styles/abstract/_commons.scss`
file to configure elements in general after reset and to define semantic
variables.
- All comments in the `.scss` files has been made using slashes (///).
- The `src/styles/base/_colors.scss` and
`src/styles/abstract/_define-map.scss` files have been copied to the
organization repository and included in the files listed in
`download.config.json`.
- Global definitions have been changed to exports. The `appEngine.ts` file has
been created to concentrate and export the main application definitions that
were previously global declarations, so that they are accessible throughout
the project. The definitions in this file are also exported in the `globalThis`
object. The removal of global declarations was done to improve compatibility
with ES Modules.
- The files `externalCmdWListTable.ts`, `externalFunctionTable.ts` and
`outputFunction.ts` were created and the respective definitions that were in
the `EvaluatorConfiguration.ts` file were moved to them. The functions related
to graphs were moved to the `PlotEngine.ts` file, and are referenced in the
other files. The plot functions still need to be implemented.
- The SVG files format setup in the `.prettierrc` has been set to use the HTML
parser.

## 1.5.3
- All dependencies has been updated.
- OpenAIRE badges included in documentation.
- The application was completely restructured using Web components. Five Web
components were created to generate the dynamic structure, previously created
in the `Shell.initialize` method. The use of the `CreateHTMLElement` function
was removed from the entire project, with its respective file. Web components
are defined in a standardized way using method factories and generalized types
and interfaces. Each Web component class has core definitions of properties
and methods, static or not, based on factory functions and generalized types
and interfaces.
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
to announce the structure of the Web application in terms of Web components and
SCSS templates. Because the Web component templates are inserted at the end of
the `body` element during the Webpack build, it became unfeasible to use the
application bundle through the CDN. So the old instructions for loading the
bundle this way in these files were also removed. For the same reason the
`src/save-bundle.cjs` file and related scripts in the `package.json` has been
removed.

## 1.5.2
- The `collapsible-content-panel` **Web Component** has been created an used in
the examples and readme panels. Some other components has been created in the
`src/components/` directory but they are not yet full implemented and in use.
- All dependencies has been updated.
- Trademark notices in documentation and after abstract has been introduced.
- The `build.env` file has been removed and the packages `dotenv`,
`dotenv-expand`, `dotenv-webpack`, `ejs` and `@types/ejs` has been removed too.
- The `build.config.json` file was created, which is imported by
`webpack.config.json` to customize some Webpack build configurations.
- A script (`component.include.ts`) was created that processes the
`component.include.json` file and generates the `components.ts` file used to
import the project's components. The script also loads the content of the
templates to be injected into the HTML.
- The use of `global.ShellPointer` inside the `Shell` class has been removed.
The `ShellPointer` declaration has been moved to the `main.ts` file and the
instantiation of `Shell` in the `bootstrap` function has been assigned to
`global.ShellPointer`. The `bootstrap` function has been made asynchronous for
this reason. The `export input` in the `main.ts` has been removed. The
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

## 1.5.1
- The MathJSLab logo has been modified. It is built on the MathJSLab
organization repository, and the 'mathjslab-app' application downloads the
logo-related files (and other common files too) from the organization
repository using the `download-files.cjs` script, which also provides a means
to clean up the downloaded files. The download of these files is triggered by
the script in the `package.json` file called "download-resources".
- Some changes to the `package.json` file scripts, including scripts to
install and remove dependencies related to the android apk build.
- Various packages are installed as project development dependencies, among
them the packages necessary to build Nunjucks templates such as Eleventy, EJS
and SASS templates. The `data` directory was created to support the building
of Nunjucks templates using Eleventy (with `script/helper/EleventyUtil.mjs`).
- The `src/build-configuration.json` and `sitemap.xml` files is now generated
by Nunjucks templates. Previous scripts used to generate this files has been
removed.
- The `src/component/` directory has been created to contain reused components
using the **Web Components** suite. The `src/style/` directory has been
created to contain CSS stylesheets, SASS templates and other related files. It
has been populated with a subdirectory structure and some `.scss` template
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
- The application has been renamed to 'mathjslab-app', with the repository
also being renamed. All references to the name have been updated.
- The '@capacitor/core' and '@capacitor/android' packages has been installed
as regular dependencies and '@capacitor/cli' package has been installed as
development dependency. Build scripts for android apk added in 'package.json'
file. The generated directory 'android' by apk build scripts added to
exclusion in '.gitignore' file.

## 1.4.0
- Dependencies update.
- The application has been renamed to 'mathjslab-demo', with the repository
also being renamed. All references to the name have been updated.
- The '.gitignore' file has been revised, removing unnecessary selections.

## 1.3.0
- Change repository owner to MathJSLab GitHub organization: https://github.com/MathJSLab .
Changes in repository references in 'package.json' file and documentation.
- The 'dotenv' and 'dotenv-webpack' packages has been installed and some boilerplate values
has been defined as environment variables in the 'build.env'. The
exception to save this file in the repository has been added to '.gitignore'
file and 'webpack.config.ts' has been modified too to include plugin and environment variables use.
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
the 'script' directory and the corresponding build script was created in the 'package.json' file.
- The constant `modulesConfiguration` in 'DynamicModule.ts' was moved to a static property inside DynamicModule class.
- The 'ts-node' package has been removed and the 'tsconfig-paths' and 'tsx' packages have been included in the development dependencies. Webpack set to run under 'tsx' in 'package.json' scripts.
- Improvements to the 'webpack.config.ts' file to remove the need to configure the NODE_ENV environment variable before building with Webpack. Webpack configuration was hardcoded as factory.
- Changes in 'manifest.json' file ("description" and "categories" fields).
- Changes to build scripts ('script' directory): some console messages issued
using `console.warn` instead of `console.log`.
- Change `throw new Error( ...` to `throw new URIError( ...` in function `loadText()` in the 'main.html' file.
- Setting Open Graph meta tags in the 'main.html' file. The files 'mathjslab-logo-1200x630.svg' and 'mathjslab-logo-1200x630.png' have been added to the 'images' directory.

## 1.2.3
- Domain setup (mathjslab.com). Set as "homepage" in 'package.json' file.
- Dependecies update.
- Configurations in '.eslintrc.js' (removed) modified to flat config in 'eslint.config.js'.
- File '.npmrc' created. Configuration legacy-peer-deps set to true.
- Badge 'GitHub Created At' added to 'README.md' (and portuguese 'LEIAME.md' and spanish 'LEAME.md').
- Changes in MathMarkdown.initialize (`renderer` methods definition) due to marked package updates.
- Redefinition of "keywords" in 'package.json' and 'meta' HTML tags. Same keywords set in "categories" of 'manifest.json'.
- Updates to the 'robots.txt' file and the creation of the 'sitemap.xml' file for better SEO practices.
- The application title has been changed to 'MathJSLab'. The application is the project page.

## 1.2.2
- Files 'importUMD.ts' and 'DynamicModule.ts' to load external modules by CDN dynamically. Now 'ScriptLinkLoad.ts' is unused and removed.
- [Plotly.js](https://plotly.com/javascript/) to generate graphics. "@types/plotly.js" devDependencies installed.

## 1.2.1
- Full responsiveness, including light/dark mode.
- Button and command 'openfile' to open file from computer.
- File names converted to camel case.
- Polyfill for `window.fetch` (for old browsers) and `window.showOpenFilePicker` (for other than Chrome).
- Functions from `basic-dom-helper` package moved to inside project (files 'createHTMLElement.ts' and 'ScriptLinkLoad.ts') and `basic-dom-helper` package dependency removed.
- Mermaid charts rendered in markdown files.
- Open files from device with `load()` and `markdown()` (without parameters).

## 1.2.0
- Support for multiline statements.
- External function names assigned in `Evaluator.localTable` with random UUID.
- Logo in svg format (at images/mathjslab-logo.svg).
- Start implementation as a Progressive Web Application. The file 'manifest.json' has been created and the folder images/icons has been created too with icons.
- Improves in responsiveness.

## 1.1.1
- Translations of 'README.md' file to portuguese 'LEIAME.md' and spanish 'LEAME.md'
- Translation of spanish help completed.
- Multiple languages and menu of language selection.
- Creation of bootstrap function in evaluator-configuration.ts file.
- Changes in build scripts of package.json.
- Creation of script folder with some examples.
- Creation of CONTRIBUTING.md and CODE_OF_CONDUCT.md files.
- Creation of 'Contributing' session in 'README.md' file (in portuguese 'LEIAME.md' and spanish 'LEAME.md' too).
- More examples (to test multidimensional arrays).

## 1.1.0
- Project launch.
- Translation of portuguese help completed.
- `markdown` function.
- Bug fix in aliasTable (remove some overlaps).
- doc folder created with some markdown files for tests.

<a href="https://www.flaticon.com/free-icons/maths" title="maths icons">Maths icons created by Prosymbols - Flaticon</a>
