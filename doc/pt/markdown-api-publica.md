# Inventário da API pública do engine Markdown

Este documento registra a decisão da etapa 15.1. Ele descreve a superfície que
deverá ser estabilizada antes da distribuição do engine como pacote. A presença
de uma declaração `.d.ts` transitiva no diretório de build não torna o símbolo
público; somente símbolos alcançáveis pelos pontos de entrada publicados fazem
parte da API.

## Pontos de entrada atuais

Há duas superfícies com finalidades diferentes:

| Origem                     | Finalidade                              | Destino              |
| -------------------------- | --------------------------------------- | -------------------- |
| `src/markdown-document.ts` | Engine e componente reutilizáveis       | Pacote independente  |
| `src/Markdown.ts`          | Fachada histórica ligada ao `appEngine` | Aplicativo MathJSLab |

O pacote reutilizável não deve exportar `Markdown`, `markdownEngine`,
`appEngine`, targets do prompt ou funções de interface do aplicativo. A fachada
histórica poderá continuar reexportando partes da API durante a migração, mas
não define o contrato do pacote.

## API principal

Estes símbolos formam a interface recomendada para a maioria dos integradores:

| Família                  | Símbolos                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine                   | `MarkdownEngine`, `MarkdownEngineOptions`, `MarkdownDocument`, `MarkdownDocumentContext`, `MarkdownProfile`, `markdownProfiles`                           |
| Extensões                | `MarkdownExtension`, `MarkdownExtensionManifest`, `MarkdownFence`, `MarkdownEngineServices`, `MarkdownExtensionCapability`                                |
| Segurança e recursos     | `MarkdownSecurityMode`, `MarkdownResourcePolicy`, `MarkdownResourceService`, `MarkdownExecutionPolicy`, `MarkdownExecutionPolicies`, `MarkdownDiagnostic` |
| Configuração educacional | `createEducationalMarkdownEngine`, `EducationalMarkdownEngineOptions`, `EducationalMarkdownFeature`, `educationalMarkdownFeatures`                        |
| Componente               | `MarkdownDocumentElement`, `defineMarkdownDocumentElement` e os tipos dos eventos e estados do elemento                                                   |
| Hospedagem               | `mountMarkdownDocument`, `disposeMarkdownDocument`, `getHostedMarkdownDocument`, `MarkdownDocumentHostOptions`                                            |
| Coleções                 | `MarkdownDocumentModel`, definições de página e grupo, manifesto, sumário e outline                                                                       |
| Navegação                | `MarkdownDocumentController`, `MarkdownNavigator` e seus tipos de estado, opções e eventos                                                                |

Essa camada não depende do estado global do aplicativo. Um consumidor deve
conseguir criar um engine, montar o componente, navegar por documentos e
descartá-lo usando somente esses contratos.

## Extensões públicas

Cada extensão exporta sua factory e seu manifesto. A factory registra o
comportamento; o manifesto permite construir catálogos, verificar capacidades e
apresentar formatos suportados sem carregar a biblioteca opcional.

| Extensão         | Factory                    | Manifesto                 |
| ---------------- | -------------------------- | ------------------------- |
| ABC              | `abcExtension`             | `abcManifest`             |
| Graphviz         | `graphvizExtension`        | `graphvizManifest`        |
| IDs de títulos   | `headingIdsExtension`      | `headingIdsManifest`      |
| Mapas            | `mapsExtension`            | `mapsManifest`            |
| MathJax          | `mathJaxExtension`         | `mathJaxManifest`         |
| MathJSLab        | `mathJSLabExtension`       | `mathJSLabManifest`       |
| Mermaid          | `mermaidExtension`         | `mermaidManifest`         |
| Modelos 3D       | `model3DExtension`         | `model3DManifest`         |
| Moléculas 3D     | `molecule3DExtension`      | `molecule3DManifest`      |
| URLs relativas   | `relativeUrlsExtension`    | `relativeUrlsManifest`    |
| SMILES           | `smilesExtension`          | `smilesManifest`          |
| Realce de código | `syntaxHighlightExtension` | `syntaxHighlightManifest` |
| Vega-Lite        | `vegaLiteExtension`        | `vegaLiteManifest`        |
| Verovio          | `verovioExtension`         | `verovioManifest`         |

O ponto de entrada reutilizável passou a exportar todos esses pares. As
bibliotecas associadas continuam sendo importadas dinamicamente somente quando
o documento usa a extensão.

## Integração MathJSLab

O contrato do executor é público porque permite integrar outro runtime sem
acoplar o engine ao aplicativo. Fazem parte dessa camada `MathJSLabExecutor`,
`MathJSLabExecutionSession`, os tipos de entrada e saída, `mathJSLabExtension`
e `createBrowserMathJSLabWorkerExecutor`.

O adaptador Plotly fornecido pelo pacote também é público, mas específico dessa
integração: `materializePlotlyOutput` transforma o descritor serializado pelo
Worker em uma saída rica na thread principal.

## API avançada

Os seguintes símbolos são necessários para runtimes, transports ou Workers
personalizados, mas não devem aparecer no percurso básico da documentação:

- `createTransportMathJSLabExecutor`;
- `WorkerMathJSLabTransport` e `createWorkerMathJSLabTransport`;
- `MathJSLabWorkerRuntime`;
- tipos de protocolo, endpoint, mensagens, recursos e handlers do Worker;
- funções de serialização de erros e snapshot do contexto;
- `mathJSLabWorkerProtocolVersion`.

Essa camada terá versionamento explícito do protocolo. Uma mudança incompatível
nas mensagens exige uma nova versão, mesmo que a API principal permaneça igual.

## Implementação interna

Permanecem internos:

- `DefaultMarkdownResourceService` e detalhes de sanitização;
- helpers de fence, resize, SVG, canvas, WebGL e descarte;
- tokenizers e transformações internas das extensões;
- `PlotEngine`, `PlotOutputCapture` e associação do interpretador ativo;
- runtime da aplicação, targets de saída, shell e comandos de UI;
- caches, filas e registros usados pelo engine e pelo componente.

Esses arquivos podem aparecer na árvore de declarações porque são dependências
dos tipos públicos. Eles não devem receber subpaths públicos nem ser importados
diretamente por consumidores.

## Problemas encontrados e decisões

1. O ponto de entrada independente exportava factories, mas omitia seus
   manifestos e as extensões básicas. A assimetria foi corrigida.
2. `src/Markdown.ts` mistura a fachada histórica com muitas reexportações. Ela
   permanece compatível com o aplicativo, mas não será o ponto de entrada do
   pacote.
3. A API avançada do Worker estava misturada à API principal. A etapa 15.2 a
   separou em um módulo próprio; o entrypoint agregado ainda a reexporta para
   preservar compatibilidade até definirmos a política de versionamento.
4. `package.json` ainda não publica `exports`, `types`, `files` ou requisitos
   de browser. Essa configuração pertence à etapa de distribuição.
5. O módulo `component` não produz efeitos colaterais. O registro do elemento é
   feito por `component/register`; o entrypoint agregado conserva o registro
   automático para manter compatibilidade com o bundle anterior.

## Pontos de entrada definidos na etapa 15.2

| Módulo fonte                         | Futuro subpath         | Conteúdo                                           |
| ------------------------------------ | ---------------------- | -------------------------------------------------- |
| `src/markdown-core.ts`               | `.`                    | API principal e configuração educacional           |
| `src/markdown-component.ts`          | `./component`          | Web Component e helpers de hospedagem              |
| `src/markdown-component-register.ts` | `./component/register` | Registro explícito e API do componente             |
| `src/markdown-extensions.ts`         | `./extensions`         | Factories e manifestos, exceto MathJSLab           |
| `src/markdown-mathjslab.ts`          | `./mathjslab`          | Executor, extensão e integração browser MathJSLab  |
| `src/markdown-mathjslab-worker.ts`   | `./mathjslab/worker`   | Protocolo, transport e runtime avançados do Worker |

Os módulos são reais e possuem testes de importação e de fronteira. O arquivo
`src/markdown-document.ts` continua reexportando os cinco módulos para
preservar a superfície disponível antes da divisão. A publicação dos nomes de
subpath em `package.json`, com bundles e declarações correspondentes, pertence
à etapa de distribuição; nenhum consumidor precisa importar caminhos internos
de `src`.

As fronteiras evitam dependências conceituais acidentais: `core` não registra o
componente, `component` não reexporta o engine, `extensions` não inclui o
runtime MathJSLab, a integração MathJSLab comum não expõe o protocolo Worker e
o módulo avançado do Worker não registra a extensão Markdown.

O build independente gera `markdown-document.js`, `core.js`, `component.js`,
`component-register.js`, `extensions.js`, `mathjslab.js` e
`mathjslab-worker.js`. Um teste em navegador importa os módulos separados,
confirma suas fronteiras e verifica o registro explícito do elemento. A
associação formal desses arquivos aos subpaths npm continua reservada à
distribuição.

## Estabilidade e versionamento

`markdownPublicApiVersion` identifica a versão principal do contrato público e
começa em `1`. Adições compatíveis não alteram esse número. Remoção ou mudança
incompatível de um símbolo, opção, evento, formato de manifesto ou semântica de
ciclo de vida exige incrementá-lo. O protocolo MathJSLab Worker mantém sua
versão independente em `mathJSLabWorkerProtocolVersion`.

Testes mantêm listas exatas dos exports JavaScript de cada superfície. Uma
adição ou remoção precisa, portanto, atualizar deliberadamente o contrato e sua
documentação. Tipos emitidos são verificados pelo build TypeScript dos
entrypoints. APIs avançadas seguem a mesma disciplina de remoção, embora possam
receber adições com maior frequência.

Com inventário, fronteiras, registro explícito, versão e testes de contrato, o
item 15 está encerrado. Metadados npm, mapas de `exports`, seleção de arquivos
e validação por instalação pertencem ao item 16, dedicado à distribuição.
