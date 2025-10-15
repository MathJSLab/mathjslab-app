- `markdow(URL)`
- `markdown()`

Se chamado com um parâmetro, carrega o arquivo markdown da URL (absoluta ou
relativa) e exibe.

Se chamado sem parâmetros, mostra uma caixa de diálogo para escolher o arquivo
a ser aberto no dispositivo.

As seguintes extensões estão disponíveis:

- Grafos e diagramas [Mermaid](https://mermaid.js.org/) especificados em blocos
  de código com 'mermaid' especificado como linguagem.
- Expressões MathJSLab convertidas para [MathML](https://www.w3.org/Math/). As
  expressões devem ser colocadas entre duplos caracteres de porcentagem (\%\%)
  para expressões 'inline' e triplos caracteres de porcentagem (\%\%\%) para
  expressões 'block' (atributo display).

Veja também: `load`, `open`.

### Referências

- https://www.markdownguide.org/
