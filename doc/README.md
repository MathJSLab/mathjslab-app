# MathJSLab app documentation

This directory documents the browser application and its integration with the
installed packages. All documentation here is maintained in English.

## Application guides

- [Architecture and package boundaries](application/architecture.md)
- [Maintenance workflow and Git publication](application/maintenance.md)
- [Markdown integration](application/markdown-integration.md)
- [HDL integration validation](application/hdl-validation.md)
- [Resumable execution and Workers](application/resumable-execution.md)
- [Rendering diagnostics and troubleshooting](application/troubleshooting.md)
- [Examples catalogue](../example/README.md)
- [Tests and generated results](../test/README.md)

## Language notes

- [Overview and compatibility](language/README.md)
- [Arrays, indexing and arithmetic](language/arrays.md)
- [Text and quote styles](language/strings.md)
- [Linear indexing and storage order](language/storage-order.md)

The application composes two reusable packages:

- [mathjslab](https://github.com/MathJSLab/mathjslab): parsing, numerical
  values, evaluation, execution sessions and serializable plot descriptions.
- [mathjslab-markdown documentation](https://github.com/MathJSLab/mathjslab-markdown/blob/main/doc/README.md):
  the Markdown engine, public API, component, educational extensions, lifecycle
  and resource policy. These contracts belong to that package and are not
  duplicated in this directory.

Browser regression documents belong to `test/browser/fixtures/`. Test results
and screenshots belong to `test/result/`, not to this documentation tree.
