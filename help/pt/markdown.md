- `markdow(URL)`
- `markdown()`

Se chamado com um parâmetro, carrega o arquivo markdown da URL (absoluta ou
relativa) e exibe.

Se chamado sem parâmetros, mostra uma caixa de diálogo para escolher o arquivo
a ser aberto no dispositivo.

As seguintes extensões estão disponíveis:

- Grafos e diagramas [Mermaid](https://mermaid.js.org/) especificados em blocos
  de código com 'mermaid' especificado como linguagem.
- Estruturas moleculares planas especificadas com
  [SMILES](https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System)
  em blocos de código que usam `smiles` como linguagem.
- Expressões MathJSLab convertidas para [MathML](https://www.w3.org/Math/): use
  <code>%expressão%</code> ou a forma protegida ``%`expressão`%`` em linha;
  coloque expressões multilinha entre linhas <code>%%</code> para exibição em
  bloco.
- Expressões TeX renderizadas pelo MathJax: use <code>$expressão$</code> ou a
  forma protegida ``$`expressão`$`` em linha; use <code>$$</code> ou um bloco
  de código com linguagem `math` para exibição em bloco.
- Comandos MathJSLab executados em sequência em blocos de código que usam
  `mathjslab` como linguagem. Os resultados, erros e gráficos são exibidos no
  próprio documento.

````markdown
```mathjslab
x = linspace(0, 2*pi, 100);
plot(x, sin(x))
```
````

Veja também: `load`, `open`.

### Referências

- https://www.markdownguide.org/
