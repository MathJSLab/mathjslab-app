# Example catalogue

The catalogue contains **486 Nunjucks templates**: the original 39 examples,
reorganized into directories, 340 new exercises and 107 Markdown document
launchers. Each template generates an English, Spanish and Portuguese `.m`
file. Captions, descriptions and teaching comments are translated. Numerical
code stays the same; Markdown launchers select the document locale in their
URL.

| Directory                 | Subject                                                            | Templates |
| ------------------------- | ------------------------------------------------------------------ | --------: |
| `fundamentals/`           | Equations, arithmetic, trigonometry and complex numbers            |        22 |
| `arrays/`                 | Vector construction, indexing and matrix operations                |        47 |
| `linear-algebra/`         | Systems, iterations, matrix identities and structured matrices     |        58 |
| `statistics/`             | Descriptive statistics and elementary probability                  |        27 |
| `programming/`            | Control flow, classes, algorithms and data structures              |        79 |
| `numerical-methods/`      | Roots, interpolation, calculus, differential equations and series  |        24 |
| `applications/`           | Finance, geometry, physics and small data sets                     |        29 |
| `graphics/`               | Sampled curves, frequency tables and 3D surfaces                   |        24 |
| `signal-processing/`      | Filtering, resampling, correlation and explicit Fourier transforms |        16 |
| `optimization/`           | Grid and interval searches, gradient and coordinate descent        |         6 |
| `discrete-math/`          | Graphs, reachability, recurrences and counting                     |         6 |
| `information-theory/`     | Entropy, divergence and prefix-code length bounds                  |         3 |
| `control-systems/`        | Discrete-time responses, feedback and state-space models           |         3 |
| `machine-learning/`       | Small classifiers, clustering, regularization and feature encoding |        10 |
| `computational-geometry/` | Planar predicates, intersections and polygon calculations          |        10 |
| `image-processing/`       | Synthetic matrix images, intensity transforms and morphology       |         8 |
| `simulation/`             | Seeded experiments, event queues and discrete evolution models     |         7 |
| `markdown/`               | Localized teaching notes from mathjslab-markdown                   |       107 |

The directory tree, menu order and translated labels are defined by
`example.json`. Templates must follow the same physical directory tree. The
first example remains `fundamentals/equations/bhaskara.m.njk`.

## Markdown teaching notes

The Markdown category contains launchers for the package's 105 teaching notes
and its localized lesson index, grouped into mathematics/geometry,
science/data, chemistry, music, geography/history, computing, electronics,
teaching blocks and bibliography. Each template runs `clear` followed by
`markdown(url)`, where the URL targets
`https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/<locale>/<filename>`.
The selected application language chooses `en`, `es` or `pt`; each language
retains the package's shared filenames. The package's root README and CSV
resources are supporting files rather than separate lessons. Relative links and
datasets remain relative to the remotely loaded Markdown document.

The notes added in mathjslab-markdown 0.4.0 include citations, TikZ/CircuiTikZ,
interactive geometry, WaveDrom, teaching blocks and cross-references. Rendering
these features requires a compatible package version and the corresponding
extensions and capabilities to be enabled by the application host.

The coverage audit compares the menu against the installed package
(`npm run test:examples:coverage`), checking all 105 teaching notes and the
localized index in each language. Menu captions and template comments must
match those indexes. Lesson content is retrieved through the raw GitHub URLs.

Electronics also contains HDL, netlist and VCD subdirectories. WaveDrom
register maps and logic diagrams, HDL syntax highlighting, netlist schematics
and local VCD inspection work without a compiler. HDL simulation, synthesis and
live sessions require an explicitly configured executor; see the application
[HDL integration](../doc/application/markdown-integration.md#hdl-execution-in-development).

These launchers require network access and the corresponding files on GitHub's
`main` branch. They do not embed or copy the Markdown lesson bodies. In
headless catalogue checks, `markdown()` is captured and its exact localized URL
verified; browser tests cover the real command with deterministic remote
responses.

The existing moving-average example also received a compatibility fix:
`samples` replaces the variable `signal`, which conflicts with the
application's alias for `sign`. Its expected averages now have an explicit
numerical check.

The additional Digital Electronics launcher opens
`example/digital-electronics/pt/README.md` in all three menu languages. Its
English and Spanish captions explicitly identify the Portuguese contents. This
entry is shared rather than pointing to translated book directories.

## Teaching approach and compatibility

The new exercises are original, small implementations inspired by the topics in
the
[MATLAB example catalogue](https://www.mathworks.com/help/matlab/examples.html)
and
[Octave Simple Examples](https://docs.octave.org/latest/Simple-Examples.html).
They use independently chosen data and explanations rather than copied source
code. Relevant introductory references include
[MATLAB matrices and arrays](https://www.mathworks.com/help/matlab/learn_matlab/matrices-and-arrays.html),
[MATLAB array indexing](https://www.mathworks.com/help/matlab/learn_matlab/array-indexing.html),
and
[Octave matrix arithmetic](https://docs.octave.org/latest/Matrix-Arithmetic.html).

The latest 100 exercises also draw on topics from
[TheAlgorithms MATLAB/Octave collection](https://github.com/TheAlgorithms/MATLAB-Octave)
(sorting, searching and elementary learning models),
[Fundamentals of Numerical Computation, MATLAB edition](https://fncbook.com/matlab/)
(linear systems and matrix analysis), and
[John Burkardt's MATLAB catalogue](https://people.sc.fsu.edu/~jburkardt/m_src/m_src.html)
(geometry, images and simulation). Each of these 100 templates includes its
topic-reference URL in a translated comment, which is retained in generated
`.m` files. Their code and data are independently written.

The additions comprise 30 linear-algebra exercises, 20 algorithms, 15 data
structures and 35 exercises in the four new categories. Algorithms include
dynamic programming for knapsack, coin change, subsequences and edit distance.
Data structures include array stacks and queues, a min-heap, an indexed tree,
linked lists, disjoint sets, Fenwick queries and linear-probing hash storage.
Each exercise illustrates a specific operation with a small bounded input;
these are teaching representations rather than complete container libraries.
Image examples operate on synthetic numeric matrices without image-file APIs.
Learning models use explicit arithmetic without toolbox dependencies.

The numerical methods implement explicit algorithms with arithmetic and bounded
loops. The integration examples relate to the topic of
[integration of numeric data](https://www.mathworks.com/help/matlab/math/integration-of-numeric-data.html).
The ODE examples relate to
[Octave differential-equation examples](https://docs.octave.org/latest/Integrating-Differential-Equations.html).
They use Euler, symplectic Euler and fourth-order Runge–Kutta steps instead of
depending on `lsode` or `ode45`. Other exercises calculate medians, covariance,
linear interpolation and least-squares fits explicitly, without depending on
`median`, `cov`, `interp1` or `polyfit`.

Graphics use MathJSLab's native `plot`, `plot3`, `surf`, `plot2d` and
`histogram` support. The histogram examples call
`histogram(counts, categories)` with precomputed counts first; this is not
MATLAB's sample-binning signature. The class examples retained from the
original catalogue introduce definitions. They do not claim complete MATLAB
class compatibility.

The specialized collection adds twelve executable object-oriented examples in
`programming/object-oriented/`: constructors, value and handle semantics,
restricted writes, dependent properties, static methods, constants,
inheritance, overrides, composition, multiple outputs and method validation.
These scripts construct objects and exercise their behavior; they extend the
introductory class-definition examples without claiming full MATLAB class
compatibility.

Every new exercise ends with `example_check`. A successful calculation gives
`true`. Approximate algorithms use explicit error bounds; random samples are
checked for shape and bounds rather than an exact random outcome. Numerical
arrays and iteration counts are deliberately small enough for interactive use.
The same tests should be rerun when the installed MathJSLab package changes.

The second collection adds explicit four-point DFT and inverse DFT, FIR
convolution, resampling, bounded optimization searches and finite graph
algorithms. These examples do not require `fft`, `ifft`, `kron`, `fminsearch`
or toolbox APIs; they implement the calculations using supported operations.

## Build and validate

```sh
npm run build:eleventy
npm run build:assets
node script/test-examples.mjs
```

Or run all three steps with `npm run test:examples`.

The validation script checks manifest/template correspondence, all translated
metadata and comments, the first-example fallback and all generated locale
files. It parses and evaluates each script in a fresh MathJSLab workspace with
the application's actual aliases for that locale, checks `example_check` in the
340 new exercises and the repaired moving-average example, and verifies that
native plot requests contain finite numerical data. It captures plot requests
without rendering them; the browser tests cover actual menu navigation and
loading. The older `help` command is stubbed because documentation loading
belongs to the browser host. Markdown launchers are checked for one call with
the expected raw URL, without performing a network request.

For a focused run, supply a path fragment:

```sh
node script/test-examples.mjs numerical-methods/
```

Generated files live in `dist/example/<locale>/...`. Edit the `.m.njk`
templates, not their generated outputs. Numerical templates should provide JSON
frontmatter with translated `comments.title`, `comments.goal` and
`comments.check`, then a small standalone script ending in a scalar logical
`example_check`.

Markdown launchers instead declare `markdownDocument` in JSON frontmatter,
provide translated `comments.title` and `comments.goal`, and render the URL
with `{{ lang }}`. Their executable code varies only in the URL's locale.

The Digital Electronics contents launcher is the deliberate exception:
`markdownDirectory: "digital-electronics/pt"` fixes its content language to
Portuguese in every menu. English and Spanish labels identify this explicitly.
The contents links to available chapters; planned chapters are not invented.
There are now 107 Markdown launchers and 486 templates overall.

To audit all canonical lesson files, titles and launchers in the three locales,
run `npm run test:examples:coverage`. This checks the installed package and
rejects missing, duplicated or obsolete launchers. To compare an explicit
checkout instead, run
`node script/check-markdown-examples.mjs ../mathjslab-markdown`. The root
example README and CSV resources are supporting files; each localized README is
included as the lesson index.
