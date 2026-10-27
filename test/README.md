# Testes da aplicação

Os testes deste repositório verificam a integração do `mathjslab-app` com os
pacotes instalados `mathjslab` e `mathjslab-markdown`, além dos recursos
próprios da aplicação. Os testes internos dos pacotes continuam nos respectivos
repositórios; os testes de integração aqui não exigem esses checkouts.

| Diretório         | Responsabilidade                                                          |
| ----------------- | ------------------------------------------------------------------------- |
| `examples/`       | Manifesto recursivo, publicação dos assets e navegação do catálogo        |
| `markdown/`       | Integração da fachada, sessões, gráficos, arquivos e corpus Markdown      |
| `infrastructure/` | Fronteiras entre pacotes, configuração de build/CI, dados e servidor HTTP |
| `browser/`        | Distribuição ESM, Worker, aplicação, acessibilidade e renderização real   |
| `result/`         | Artefatos gerados e ignorados pelo Git                                    |

```sh
npm test
npm run test:examples
npm run test:browser
```

`npm test` prepara os assets e o primeiro exemplo, verifica os links da
documentação, a cobertura do catálogo Markdown instalado e os tipos dos testes
e executa todos os projetos Jest, os testes Node de assets e infraestrutura e
as regressões da fachada Markdown. `test:examples` gera e executa todo o
catálogo nos três idiomas. `test:browser` empacota as entradas públicas do
pacote Markdown instalado, o Worker de observação e a aplicação antes de
executar o Chromium. Esses três comandos verificam comportamentos diferentes e
se complementam.

Para a matriz de navegadores, instale seus binários com
`npx playwright install chromium firefox webkit` e execute
`npm run test:browser:all`. Depois de preparar os builds, uma execução focada
pode usar `npx playwright test <arquivo> --project chromium`.

Os resultados do Playwright ficam em `result/playwright/`; a medição de chunks
fica em `result/chunk-baseline.json`. O relatório HTML de CI continua em
`../playwright-report/`. Esses arquivos são temporários.

O corpus em `markdown/` é consumido pelo teste da fachada em
`script/markdown.test.mjs`, e parte dele também é usada pelas fixtures do
navegador. Ele deve ser preservado mesmo quando houver documentos semelhantes
no pacote Markdown. Da mesma forma, testes de ciclo de vida, segurança,
cancelamento e recuperação não são substituídos por testes de renderização.

Os testes de infraestrutura impedem a reintrodução de delegações locais ao
pacote Markdown e verificam que a cópia do repositório compartilhado não
sobrescreve a integração própria da aplicação. Também exercitam os validadores
do Webpack com a árvore de dependências efetivamente instalada.

O ciclo `npm run do:all` executa atualização, formatação, lint, builds e todas
as verificações padrão antes de chamar `git:all`. Para inspecionar a sequência
sem executá-la, use `npm run do:all -- --dry-run`. Consulte o
[guia do processo completo](../doc/application/maintenance.md).

`npm run test:examples:coverage` compara todos os lançadores Markdown com o
pacote instalado e exige o sumário português de Eletrônica Digital nas três
línguas. O teste `markdown-catalogue.spec.ts` verifica essa navegação pelos
menus reais, usando o conteúdo do pacote instalado.
