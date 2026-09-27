# Corpus de compatibilidade Markdown

Este diretório contém entradas estáveis para testar o `MarkdownEngine`. Cada
extensão possui um documento próprio; `combined/` exercita a composição e
`conflicts/` contém casos em que delimitadores podem competir.

Os exemplos marcados como oficiais em `corpus.json` foram adaptados das
documentações oficiais indicadas no campo `source`. O corpus não depende de
rede: recursos auxiliares ficam em `resources/`.

Comandos:

```shell
npm test
npm run test:markdown
npm run test:markdown:legacy
npm run measure:markdown
```

`measure:markdown` deve ser executado depois de um build. Ele agrupa os chunks
opcionais emitidos em `dist/` por família e atualiza `chunk-baseline.json`. A
baseline atual usa o build de desenvolvimento sem compressão; portanto serve
para detectar regressões relativas, não para estimar os bytes transferidos em
produção.
