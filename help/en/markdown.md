- `markdow(URL)`
- `markdown()`

If called with one parameter load markdown file from URL (absolute or relative)
and display.

If called with no parameter then show dialog to choose file to open from
device.

The following extensions are available:

- [Mermaid](https://mermaid.js.org/) charts and diagrams specified in fenced
  code blocks with 'mermaid' specified as language.
- MathJSLab expressions converted to [MathML](https://www.w3.org/Math/). The
  expressions must be enclosed in double percent (\%\%) for 'inline' and triple
  percent (\%\%\%) for 'block' expressions (display attribute).

See also: `load`, `open`.

### References

- https://www.markdownguide.org/
