# Release notes
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.5.0
- The application has been renamed to 'mathjslab-app', with the repository
also being renamed. All references to the name have been updated.
- The '@capacitor/core' and '@capacitor/android' packages has been installed as regular dependencies and '@capacitor/cli' package has been installed as development dependency. Build scripts for android apk added in 'package.json' file. The generated directory 'android' by apk build scripts added to exclusion in '.gitignore' file.

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
