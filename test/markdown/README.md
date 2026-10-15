# Corpus de compatibilidade Markdown

Este diretório contém entradas estáveis para testar o `MarkdownEngine`. Cada
extensão possui um documento próprio; `combined/` exercita a composição e
`conflicts/` contém casos em que delimitadores podem competir.

`script/markdown.test.mjs` percorre `corpus.json` pela fachada real da
aplicação, verifica os fences declarados e a ausência de carregamento de
bibliotecas opcionais durante o parse. Os testes de navegador também usam os
documentos de música, mapas e modelos 3D. O corpus é uma entrada de teste
ativa, não um relatório gerado.

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
opcionais emitidos em `dist/` por família e atualiza
`test/result/chunk-baseline.json`. O arquivo gerado é temporário e ignorado
pelo Git. Compare medições de builds equivalentes; valores de desenvolvimento
não estimam transferência em produção.
