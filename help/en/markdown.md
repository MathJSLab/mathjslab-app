- `markdow(URL)`
- `markdown()`

If called with one parameter load markdown file from URL (absolute or relative)
and display.

If called with no parameter then show dialog to choose file to open from
device.

The following extensions are available:

- [Mermaid](https://mermaid.js.org/) charts and diagrams specified in fenced
  code blocks with 'mermaid' specified as language.
- Flat molecular structures specified with
  [SMILES](https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System)
  in code blocks using `smiles` as the language.
- MathJSLab expressions converted to [MathML](https://www.w3.org/Math/): use
  <code>%expression%</code> or the protected form ``%`expression`%`` inline;
  put multiline expressions between <code>%%</code> lines for block display.
- TeX expressions rendered by MathJax: use <code>$expression$</code> or the
  protected form ``$`expression`$`` inline; use <code>$$</code> or a code block
  with `math` as its language for block display.
- MathJSLab commands executed in sequence in code blocks that use `mathjslab`
  as their language. Results, errors, and plots are displayed in the document.

````markdown
```mathjslab
x = linspace(0, 2*pi, 100);
plot(x, sin(x))
```
````

See also: `load`, `open`.

### References

- https://www.markdownguide.org/
