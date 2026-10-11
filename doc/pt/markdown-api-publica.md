# Contrato público e independente do engine Markdown

Este documento define a superfície pública do pacote reutilizável. A presença de uma declaração `.d.ts`
transitiva no diretório de build não torna o símbolo público; somente símbolos
alcançáveis pelos pontos de entrada abaixo fazem parte do contrato.

## Pontos de entrada atuais

O mapa `exports` de `mathjslab-markdown/package.json` define o contrato npm:

| Subpath | Responsabilidade |
| --- | --- |
| `mathjslab-markdown` | Engine e contratos principais |
| `/component` | Classe do componente e helpers |
| `/component/register` | Registro de `<markdown-document>` |
| `/extensions` | Presets e extensões |
| `/mathjslab` | Integração opcional MathJSLab |
| `/mathjslab/worker` | Transporte e protocolo Worker |
| `/browser` | Entrada agregada |
| `/compat/*` | Módulos de compatibilidade |
| `/bundles/*` | Assets da distribuição para navegador |

A fachada `Markdown.ts` e o estado global do aplicativo pertencem ao app.

## Fronteira com o aplicativo

Os entry points reutilizáveis são `markdown-core.ts`, `markdown-component.ts`,
`markdown-component-register.ts`, `markdown-extensions.ts`,
`markdown-mathjslab.ts`, `markdown-mathjslab-worker.ts` e o agregado
`markdown-document.ts`. Seus imports locais transitivos não podem alcançar o
runtime MathJSLab do aplicativo (`appEngine`, `evalInput`, `evalPrompt`,
`InterpreterRuntime`, `PlotEngine` ou `PlotOutputCapture`) nem a fachada
histórica `Markdown.ts`. Uma integração específica do app pode usar o contrato
por composição, mas fica fora desses entry points. Um teste percorre esses
grafos de imports para impedir regressões nessa fronteira.

O contrato é independente de framework e de estado global do app, mas a
renderização e o Web Component requerem um ambiente de navegador com DOM. O
componente é opcional: importar `markdown-core.ts` não registra elemento algum;
`markdown-component-register.ts` registra `<markdown-document>` explicitamente,
enquanto `markdown-component.ts` exporta sua classe e helpers sem registro
automático. O entry point agregado `markdown-document.ts` mantém a
compatibilidade do bundle anterior.

O host cria e possui o `MarkdownEngine`; sessões podem compartilhar o engine,
mas cada sessão é isolada por container. A sessão controla o conteúdo que
renderiza nesse container e deve ser descartada quando o host remover ou
substituir esse conteúdo. Descartar uma sessão não descarta um engine
compartilhado; o host descarta o engine quando termina de usá-lo. O componente
descarta sua sessão ao desconectar, mas não descarta um engine externo.
Recursos e cancelamento são escopados à sessão/operação, e uma operação
substituída ou cancelada não pode publicar resultado tardio. `dispose()` é
idempotente.

Os nomes de exports JavaScript por entry point e a versão
`markdownPublicApiVersion` são travados em testes. Uma remoção ou mudança
incompatível de símbolo ou semântica pública exige incrementar a versão; novas
dependências específicas do app devem permanecer em adapters fora do grafo
público. Os subpaths npm são definidos pelo mapa `exports` do pacote.

## API principal

Estes símbolos formam a interface recomendada para a maioria dos integradores:

| Família                 | Símbolos                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Engine                  | `MarkdownEngine`, `MarkdownEngineOptions`, `MarkdownDocument`, `MarkdownDocumentContext`, `MarkdownProfile`, `markdownProfiles`          |
| Extensões               | `MarkdownExtension`, `MarkdownExtensionManifest`, `MarkdownFence`, `MarkdownEngineServices`, `MarkdownExtensionCapability`               |
| Diagnósticos            | `MarkdownDiagnostic`, `MarkdownDiagnosticCode`, `MarkdownDiagnosticCategory`, `MarkdownDiagnosticEventDetail`, `markdownDiagnosticCodes` |
| Segurança e recursos    | `MarkdownSecurityMode`, `MarkdownResourcePolicy`, `MarkdownResourceService`, `MarkdownExecutionPolicy`, `MarkdownExecutionPolicies`      |
| Configuração e catálogo | `createEducationalMarkdownEngine`, `createMarkdownEnginePreset`, `markdownEnginePresets`, `markdownExtensionCatalog`                     |
| Componente              | `MarkdownDocumentElement`, `defineMarkdownDocumentElement`, `MarkdownDocumentDiagnosticDetail` e tipos dos demais eventos e estados      |
| Hospedagem              | `mountMarkdownDocument`, `disposeMarkdownDocument`, `getHostedMarkdownDocument`, `MarkdownDocumentHostOptions`                           |
| Coleções                | `MarkdownDocumentModel`, definições de página e grupo, manifesto, sumário e outline                                                      |
| Navegação               | `MarkdownDocumentController`, `MarkdownNavigator` e seus tipos de estado, opções e eventos                                               |

Essa camada não depende do estado global do aplicativo. Um consumidor deve
conseguir criar um engine, montar o componente, navegar por documentos e
descartá-lo usando somente esses contratos.

O catálogo `markdownExtensionCatalog` centraliza os manifests incluídos e as
factories que não precisam de um adapter externo. MathJSLab aparece como
manifest, mas sua factory continua no entry point `mathjslab`, pois exige um
executor fornecido pelo integrador. `educationalMarkdownFeatures` é derivado
desse catálogo.

`createMarkdownEnginePreset` aceita `core`, `gfm`, `education-basic`,
`education-full`, `trusted-local` e `safe-remote`. O campo `profile` seleciona
somente a sintaxe Markdown; `securityMode`, capabilities e `resourcePolicy`
permanecem configurações independentes. Os presets educacionais usam política
sanitizada; `trusted-local` é a escolha explícita para conteúdo local
confiável. `safe-remote` permite buscar o documento e aplica os limites de
origem e de conteúdo do modo sanitizado. As opções do integrador podem
substituir cada dimensão explicitamente.

| Preset            | Perfil | Segurança | Factories educacionais opcionais             |
| ----------------- | ------ | --------- | -------------------------------------------- |
| `core`            | core   | strict    | nenhuma                                      |
| `gfm`             | gfm    | sanitized | nenhuma                                      |
| `education-basic` | gfm    | sanitized | SMILES                                       |
| `education-full`  | gfm    | sanitized | catálogo educacional completo                |
| `trusted-local`   | gfm    | trusted   | catálogo educacional completo                |
| `safe-remote`     | gfm    | sanitized | nenhuma; rede limitada à origem do documento |

`education-full` registra todas as factories educacionais, mas mantém o modo
sanitizado. A verificação de capabilities continua valendo; extensões cuja
manifestação exija permissões não concedidas podem permanecer bloqueadas até o
integrador ajustar a política. `trusted-local` concede as capabilities do modo
`trusted` e deve ser usado apenas quando a origem do conteúdo for confiável.

Exemplos independentes do estado do aplicativo estão em
[`markdown-integracao.md`](markdown-integracao.md).

Os eventos do componente e o catálogo de diagnósticos estão descritos em
[`markdown-rendering.md`](markdown-rendering.md). O ciclo de vida, políticas de
segurança e recursos também possuem documentos próprios:
[`markdown-lifecycle.md`](markdown-lifecycle.md),
[`markdown-security-policy.md`](markdown-security-policy.md) e
[`markdown-resources.md`](markdown-resources.md).

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

O ponto de entrada reutilizável passou a exportar todos esses pares. O catálogo
é a fonte única para a seleção de extensões e para suas capabilities; MathJSLab
é a única entrada sem factory, pois depende de um executor injetado. As
bibliotecas associadas continuam sendo importadas dinamicamente somente quando
o documento usa a extensão. O teste de navegador importa as superfícies
públicas e instancia um preset sem solicitar chunks de renderizadores
opcionais; testes específicos verificam a carga quando uma extensão é realmente
usada.

## Integração MathJSLab

O contrato do executor é público porque permite integrar outro runtime sem
acoplar o engine ao aplicativo. Fazem parte dessa camada `MathJSLabExecutor`,
`MathJSLabExecutionSession`, os tipos de entrada e saída, `mathJSLabExtension`
e `createBrowserMathJSLabWorkerExecutor`.

O Worker retorna `MathJSLabPlotlyRequest`, um descritor serializável, e não
depende de uma implementação Plotly. `createBrowserMathJSLabWorkerExecutor`
recebe `workerFactory` e `plotRenderer` do host; não empacota nem escolhe um
Worker específico. `materializePlotlyOutput` adapta o descritor para o ciclo de
vida da saída rica usando somente o renderer injetado. O app injeta seu Worker
e `PlotEngine` pela fachada histórica, fora dos entry points públicos. Outros
hosts fornecem seus próprios adapters de Worker e de renderização.

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

## Estabilidade e versionamento

`markdownPublicApiVersion` identifica a versão principal do contrato público e
está em `2`. A versão `2` removeu a dependência implícita de `PlotEngine` de
`materializePlotlyOutput` e exige `workerFactory` e renderer injetados para
usar a integração browser MathJSLab. Adições compatíveis não alteram esse
número. Remoção ou mudança incompatível de um símbolo, opção, evento, formato
de manifesto ou semântica de ciclo de vida exige incrementá-lo. O protocolo
MathJSLab Worker mantém sua versão independente em
`mathJSLabWorkerProtocolVersion`.

Testes mantêm listas exatas dos exports JavaScript de cada superfície. Uma
adição ou remoção precisa, portanto, atualizar deliberadamente o contrato e sua
documentação. Tipos emitidos são verificados pelo build TypeScript dos
entrypoints. APIs avançadas seguem a mesma disciplina de remoção, embora possam
receber adições com maior frequência.
