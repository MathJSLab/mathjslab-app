# Renderização Markdown no MathJSLab App

## Fluxo atual

`InterpreterConfiguration.ts` inicializa `Markdown` depois de configurar o
interpretador. `Markdown.initialize()` registra extensões no Marked e configura
Mermaid com `startOnLoad: false`, tema `neutral` e segurança `loose`. A
inicialização agora é idempotente.

A renderização tem duas etapas:

1. `Markdown.parse(texto)` produz HTML de forma síncrona. Blocos cercados por
   crases com linguagem `mermaid` geram containers com a classe `mermaid`,
   contendo o código como texto escapado. Os demais blocos e códigos inline
   usam o renderizador padrão do Marked, incluindo escape e classe de
   linguagem. Expressões MathJSLab usam <code>%expressão%</code> ou a forma
   protegida ``%`expressão`%`` em linha; expressões multilinha ficam entre
   linhas <code>%%</code> e são convertidas em MathML de bloco.
2. Depois da inserção do HTML no destino, `await Markdown.typeset(container)`
   procura diagramas no container, inclusive nele próprio e nos Shadow DOMs
   abertos abaixo dele. Mermaid mede e gera o SVG temporariamente no corpo do
   documento; o serviço insere o SVG no destino e chama `bindFunctions`.

MathML produzido pelo MathJSLab é exibido diretamente pelo navegador. Fórmulas
TeX usam placeholders próprios e são renderizadas seletivamente pelo MathJax;
blocos de código comuns recebem realce por meio de `marked-highlight` e
Highlight.js.

## Sessão de documento

`Markdown.renderDocument(texto, container, contexto)` cria uma sessão que
controla uma geração do documento. A sessão oferece `update`, `navigate` e
`dispose`, mantém seu próprio `AbortSignal` e libera o conteúdo anterior antes
de instalar a nova renderização. `Markdown.render` permanece compatível e
reutiliza a sessão associada ao container.

`Markdown.dispose(container)` encerra somente o documento daquele destino; sem
argumento, encerra o engine. Renderizações de fences passam por uma fila cujo
limite padrão é quatro. O contexto pode usar `renderMode: 'visible'` para adiar
extensões interativas, WebAssembly, áudio e WebGL até que se aproximem da área
visível.

`session.navigate(referencia)` resolve a URL contra o documento atual, usa o
serviço `fetchResource`, respeita cancelamento e limite de tamanho, e só troca
o conteúdo depois que a nova fonte foi carregada. Uma falha de navegação
preserva o documento atual.

## Navegação interna

`MarkdownNavigator` conecta uma sessão a seu container por delegação de
eventos. Um clique primário em um arquivo `.md` ou `.markdown` da mesma origem
chama `session.navigate()` e substitui somente o conteúdo do documento. Links
externos, downloads, alvos diferentes de `_self` e cliques com teclas
modificadoras continuam sob responsabilidade do navegador. Como a delegação é
instalada no container, ela permanece válida depois de cada renderização.

Fragmentos no documento atual não fazem nova requisição. O navegador localiza
elementos por `id` ou âncoras por `name`; documentos diferentes podem usar
referências como `capitulo.md#secao`. A função opcional `scrollToFragment`
permite que o componente defina rolagem própria.

O navegador mantém histórico próprio com `back()`, `forward()`, `canGoBack` e
`canGoForward`. O histórico só é alterado depois de uma carga bem-sucedida;
abrir um novo destino depois de voltar elimina o ramo futuro. Operações
obsoletas não podem inserir entradas atrasadas. Os estados `loading`, `idle`,
`error` e `disposed` são publicados por `onStateChange`.

O facade `Markdown` instala essa navegação automaticamente em `render()` e
`renderDocument()`. `Markdown.getNavigator(container)` permite ligar botões de
voltar e avançar sem acoplar a interface ao engine. O histórico é local ao
documento nesta etapa; a integração opcional com `window.history` ficará para o
componente web.

## Modelo documental

`MarkdownDocumentModel` recebe um manifesto versionado e transforma sua lista
de grupos e páginas em uma árvore validada. O formato inicial usa `version: 1`,
um título, uma `baseUrl` opcional e o array `items`. Cada item tem
`type: 'group'` com `children`, ou `type: 'page'` com o caminho `source`.
Descrições, metadados livres, idioma e a indicação `hidden` são opcionais.

IDs podem ser declarados pelo autor. Quando omitidos, são derivados do título
do grupo ou do nome do arquivo e recebem o caminho dos grupos ancestrais. O
modelo rejeita IDs e URLs de página duplicados, resolve fontes contra a URL do
manifesto e mantém a ordem de leitura. `getPage()`, `findPage()`, `previous()`
e `next()` permitem relacionar o catálogo ao `MarkdownNavigator`.

`tableOfContents` contém o sumário global pronto para uma interface. Itens com
`hidden: true` continuam endereçáveis, mas não aparecem nesse sumário;
`createTableOfContents(true)` também os inclui. O modelo não carrega arquivos e
não desenha menus, mantendo separadas as responsabilidades de catálogo,
recursos e apresentação.

`createMarkdownOutline(container)` produz o sumário da página renderizada a
partir de `h1` a `h6`. Ele preserva a hierarquia dos níveis, acrescenta IDs
únicos quando necessário, ignora títulos internos gerados por extensões e
aceita filtros de nível e de inclusão. Cada item contém `href`, título, nível e
filhos, podendo alimentar um sumário lateral sem analisar novamente a fonte
Markdown.

## Controlador documental

`MarkdownDocumentController` reúne o engine, um `MarkdownDocumentModel`, a
sessão renderizada e o `MarkdownNavigator`. `initialize()` carrega a primeira
página da coleção ou a página indicada por `initialPage`; a factory assíncrona
`MarkdownDocumentController.create()` devolve o controlador já inicializado.
Depois disso, `open()`, `back()` e `forward()` mantêm sincronizados o
documento, a página do catálogo, o histórico e o sumário extraído dos títulos.

O controlador publica snapshots imutáveis por `subscribe()` e pelo callback
`onChange`. Cada snapshot informa estado, página e URL ativas, URL que está
sendo carregada, sumário local e disponibilidade de voltar ou avançar. Uma
falha mantém página, URL, conteúdo e histórico atuais; o destino recusado fica
em `targetUrl` junto de `error`.

O filtro do navegador aceita somente páginas presentes no modelo. Assim, links
Markdown pertencentes à coleção são carregados no container, enquanto links
externos continuam com o navegador. A opção `navigation` recebe decisões de
rolagem e a opção `outline` limita ou filtra os títulos do sumário local.

O controlador possui a sessão que cria e libera renderizações, listeners,
requisições pendentes e o navegador em `dispose()`. Ele não desenha controles,
menus ou estados de carregamento. O futuro componente web observará os
snapshots e decidirá sua apresentação.

Exemplo mínimo:

```typescript
const model = new MarkdownDocumentModel(manifest, manifestUrl);
const controller = await MarkdownDocumentController.create(
    engine,
    container,
    model,
    { initialPage: "introducao" },
);

const unsubscribe = controller.subscribe((state) => {
    renderCourseMenu(model.tableOfContents, state.page);
    renderPageOutline(state.outline);
});
```

## Componente web básico

O custom element `<markdown-document>` encapsula o conteúdo em Shadow DOM e
aceita três formas de entrada. A propriedade `markdown` recebe texto já
carregado; o atributo ou propriedade `src` carrega um arquivo; a propriedade
`manifest` recebe um objeto de coleção e o atributo `manifest` carrega um
manifesto JSON. `initial-page` escolhe a primeira página da coleção.

```html
<markdown-document
    src="./aula.md"
    security="sanitized"
    locale="pt"
    theme="light"
></markdown-document>
```

O engine e o contexto podem ser injetados antes ou depois da conexão:

```typescript
const element = document.querySelector("markdown-document");
element.engine = markdownEngine;
element.context = {
    resourcePolicy: { allowedOrigins: [location.origin] },
};
element.markdown = "# Texto fornecido diretamente";
```

Os estados `empty`, `loading`, `ready` e `error` aparecem no atributo `state` e
em `aria-busy`. O Shadow DOM expõe as partes `root`, `status` e `content` para
estilização externa. O componente emite os eventos compostos
`markdown-state-change`, `markdown-ready`, `markdown-error` e
`markdown-navigate`, que atravessam o limite do Shadow DOM. Ele também emite
`markdown-diagnostic` sempre que o engine ou o carregamento do documento produz
um diagnóstico estruturado.

## Diagnósticos

`MarkdownDiagnostic` mantém `extension`, `message`, `severity`, causa e, quando
conhecidos, `sourceUrl`, `line` e `column`. A propriedade `code` continua
opcional para compatibilidade com extensões externas antigas; todos os
diagnósticos internos do engine usam um código do catálogo
`markdownDiagnosticCodes`. `category` separa política, rede, extensão,
execução, carregamento de documento e navegação.

| Código                         | Categoria  | Severidade usual    | Significado                                  |
| ------------------------------ | ---------- | ------------------- | -------------------------------------------- |
| `resource-url-blocked`         | policy     | warning             | protocolo, origem ou recurso não permitido   |
| `resource-size-limit`          | policy     | warning             | conteúdo ultrapassou o limite configurado    |
| `resource-load-error`          | network    | error               | falha ao buscar ou ler um recurso            |
| `extension-capability-blocked` | policy     | warning             | extensão requer capability não concedida     |
| `extension-render-error`       | extension  | error               | renderer de extensão falhou                  |
| `extension-diagnostic`         | extension  | definida pelo autor | código de fallback para extensão antiga      |
| `audio-playback-error`         | extension  | warning             | áudio ABC não pôde ser iniciado              |
| `vega-resize-error`            | extension  | warning             | atualização de visualização Vega falhou      |
| `mathjslab-execution-disabled` | policy     | warning             | execução bloqueada pela política             |
| `mathjslab-block-limit`        | policy     | warning             | limite de blocos executáveis excedido        |
| `mathjslab-source-limit`       | policy     | warning             | limite de bytes de código excedido           |
| `mathjslab-statement-limit`    | policy     | warning             | limite de comandos excedido                  |
| `mathjslab-execution-timeout`  | execution  | error               | execução atingiu o timeout                   |
| `mathjslab-worker-restarted`   | execution  | error               | Worker foi reiniciado durante a execução     |
| `mathjslab-execution-error`    | execution  | error               | execução MathJSLab falhou                    |
| `document-load-error`          | document   | error               | operação de carregamento do documento falhou |
| `document-navigation-error`    | navigation | error               | navegação solicitada falhou                  |

Recursos que causam uma falha de carregamento podem produzir primeiro um
diagnóstico detalhado (`resource-load-error`) e depois o diagnóstico agregado
(`document-load-error`). Cancelamentos por `AbortSignal` são fluxo de controle:
não produzem diagnóstico nem erro tardio no componente. Linhas apontam para o
início da fence quando o parser consegue associar o token ao texto fonte;
colunas só são incluídas quando uma extensão consegue determiná-las.

O evento expõe um detalhe normalizado e mantém a callback do contexto:

```ts
import type { MarkdownDocumentDiagnosticDetail } from "./markdown-component.js";

viewer.addEventListener("markdown-diagnostic", (event) => {
    const diagnostic = (event as CustomEvent<MarkdownDocumentDiagnosticDetail>)
        .detail;
    console.warn(
        diagnostic.code,
        diagnostic.category,
        diagnostic.sourceUrl,
        diagnostic.line,
        diagnostic.message,
    );
});

viewer.context = {
    onDiagnostic: (diagnostic) =>
        console.warn(diagnostic.code, diagnostic.message),
};
```

O detalhe do evento sempre tem `code` e `category`. Códigos fornecidos por
extensões externas continuam aceitos; se a extensão omitir o código, o evento
usa `extension-diagnostic` e mantém a mensagem e a causa originais.

Quando recebe um manifesto, o elemento cria um `MarkdownDocumentController` e o
expõe pela propriedade `controller`; `model` contém o catálogo resultante. Com
texto ou `src`, ele mantém uma sessão e um `MarkdownNavigator` diretamente.
Trocas de entrada cancelam a operação anterior e `dispose()` ou a remoção do
elemento libera sessões, listeners, extensões e requisições pendentes.

O contrato básico de entrada, estados e eventos permanece independente da
estrutura visual descrita a seguir.

## Estrutura visual de navegação

Quando existe um manifesto, `<markdown-document>` apresenta três regiões: o
sumário global da coleção, o documento e o sumário da página. A página ativa
recebe `aria-current="page"`; uma seção escolhida no sumário local recebe
`aria-current="location"`. Grupos preservam a hierarquia declarada no manifesto
e itens ocultos continuam fora do menu.

A barra de histórico chama `back()` e `forward()` no controlador. A navegação
sequencial usa a ordem do manifesto para produzir botões com o título da página
anterior ou seguinte. Os controles são desabilitados ou ocultados quando não há
destino correspondente e são atualizados pelo mesmo snapshot que atualiza o
conteúdo.

Documentos carregados sem manifesto também recebem sumário local. Quando há uma
URL de origem, a barra de histórico acompanha a navegação entre links Markdown.
Texto fornecido diretamente mantém a navegação por seções sem tentar carregar
outra cópia do documento.

O layout usa três colunas quando existe espaço e passa a uma coluna por meio de
container query, considerando a largura real do componente e não apenas a
janela. As regiões laterais permanecem visíveis durante a rolagem no layout
amplo e voltam ao fluxo normal no layout estreito.

Além de `root`, `status` e `content`, são expostas as partes CSS `layout`,
`main`, `collection`, `page-outline`, `toolbar`, `history`, `sequence`,
`back-button`, `forward-button`, `previous-button`, `next-button`, `page-link`,
`outline-link` e `group-label`. As propriedades
`--markdown-control-background`, `--markdown-border-color` e
`--markdown-active-background` permitem a personalização inicial dos controles.

## Acessibilidade da navegação

Os rótulos próprios do componente estão disponíveis em português, inglês e
espanhol. O atributo `locale` tem precedência sobre o idioma informado no
contexto; idiomas não reconhecidos usam inglês. Os títulos escritos no Markdown
e no manifesto permanecem sob responsabilidade do autor.

Os atalhos `Alt+Seta esquerda` e `Alt+Seta direita` percorrem o histórico.
`Alt+Page Up` e `Alt+Page Down` abrem as páginas anterior e seguinte da
coleção. Nos sumários global e local, `Seta acima`, `Seta abaixo`, `Home` e
`End` movem o foco entre os controles sem ativá-los. Os mesmos comandos são
declarados com `aria-keyshortcuts`.

Depois da troca de página, o foco vai ao primeiro título do novo documento e a
mudança é anunciada por uma região `aria-live` separada. A navegação entre
seções da mesma página preserva o foco atual. Um `IntersectionObserver`
acompanha o título visível e atualiza `aria-current="location"` no sumário da
página, também anunciando a seção ativa.

A rolagem para páginas e fragmentos é suave por padrão. Quando
`prefers-reduced-motion: reduce` está ativo, ela passa a ser instantânea e as
transições internas são reduzidas. A região de anúncios é exposta pela parte
CSS `announcer` para permitir integração e auditoria sem torná-la visual.

## Integração com o aplicativo

`mountMarkdownDocument()` adapta um container existente para o componente sem
acoplar o componente a prompts, saídas em lote ou à página principal. O
adaptador recebe o engine, texto ou `src`, contexto, idioma, tema e política de
segurança. Uma nova montagem substitui a anterior e o elemento removido encerra
sua sessão. `disposeMarkdownDocument()` permite a liberação explícita e
`getHostedMarkdownDocument()` dá acesso à instância ativa.

Os três consumidores do aplicativo usam esse adaptador:

- `markdown(url)` entrega a URL resolvida ao atributo `src`, de modo que
  carregamento, estado e navegação interna pertençam ao componente;
- `markdown()` monta o texto escolhido localmente;
- `help` conserva fora do componente a resolução de aliases, idioma e rejeição
  do fallback HTML, passando depois o texto e sua URL de origem;
- o README localizado conserva a seleção feita pela página e é montado no seu
  container com idioma e tema correntes.

Erros continuam sendo apresentados pelos destinos do prompt ou da saída em
lote. Dessa forma, estados `doc`, `info` e `bad` permanecem uma
responsabilidade da aplicação, enquanto renderização, links internos e descarte
ficam no componente reutilizável.

## Distribuição independente

O pacote `mathjslab-markdown` fornece módulos ESM, declarações de tipos e bundles para navegador. Os bundles compartilham runtime e chunks; a implantação deve conservar a árvore de assets gerada pelo build. O aplicativo também oferece `npm run build:markdown-component` para gerar sua distribuição independente.

## Entradas e destinos

| Entrada          | Carregamento                                                                    | Apresentação                                   |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| `markdown(url)`  | O componente resolve e carrega `src`                                            | Estado `doc`, componente navegável             |
| `markdown()`     | `showOpenFilePicker`, `File.text()`                                             | Mesmo destino e renderizador, estado `doc`     |
| `help tópico`    | Resolve alias, codifica nome, busca `help/<locale>/<nome>.md` sob `helpBaseUrl` | Estado `info`, HTML e diagramas                |
| `help`           | Busca `help/<locale>/help.md` e acrescenta a lista ordenada de funções internas | Estado `info`, HTML e diagramas                |
| README da página | Busca o arquivo localizado definido por `i18n.page.page.readmeFile`             | Container `mathjslab-readme`, HTML e diagramas |

`externalFunctionTable.ts` implementa `markdown`; `externalCmdWListTable.ts`
implementa `help`; `main.ts` carrega o README. `help` rejeita respostas HTML,
inclusive fallbacks da SPA com status 200. `markdown(url)` ainda não faz essa
verificação. Os carregamentos remotos por esses comandos ficam indisponíveis em
`file:`; o README simplesmente não é carregado nesse protocolo. O seletor local
de `markdown()` é um caminho separado e depende da disponibilidade da File
System Access API.

`markdown(url)` resolve caminhos relativos a partir de um diretório acima da
página localizada, usando `new URL('../', location.href)` como base. Por
exemplo, em `/pt/`, `markdown('help/en/abs.md')` carrega `/help/en/abs.md`, e
não `/pt/help/en/abs.md`. Isso também funciona em `/pt/index.html` e na página
raiz. URLs absolutas de GitHub/CDN e caminhos iniciados por `/` mantêm seus
destinos.

Os comandos capturam o `CommandOutputTarget` ativo antes de iniciar operações
assíncronas. Assim, a resposta continua ligada ao comando que a solicitou.
`PromptOutputTarget` escreve em `command-prompt.element.output`;
`BatchOutputTarget` escreve no resultado de uma entrada de `batch-output`.
Ambos vivem em Shadow DOM. `setHTML` atribui `innerHTML`; ele não renderiza
Markdown nem dispara Mermaid por conta própria.

O interpretador permanece síncrono: iniciar um carregamento não bloqueia os
comandos seguintes. A conclusão do componente é tratada pelo adaptador, mas não
é aguardada pelo avaliador do interpretador.

## Segurança e recursos externos

O `MarkdownEngine` oferece três políticas de confiança através de
`securityMode`:

- `trusted` preserva HTML escrito pelo autor e é o padrão de compatibilidade
  usado pelos documentos internos atuais;
- `sanitized` processa o HTML completo com DOMPurify, removendo scripts,
  manipuladores de eventos e elementos ativos;
- `strict` também converte HTML escrito diretamente no Markdown em texto antes
  da sanitização, mantendo apenas o HTML produzido pelo engine.

O método síncrono `parse()` continua sendo a operação de baixo nível do Marked
e não sanitiza. `renderHTML()`, `render()` e `renderDocument()` aplicam a
política configurada. O modo pode ser definido no engine e substituído por
documento no contexto.

A política `resourcePolicy` controla `allowedProtocols`, `allowedOrigins`,
`allowNetwork`, `allowDataUrls`, `maxResourceBytes` e o cache `memory` ou
`none`. URLs no HTML são verificadas antes da inserção; imagens em sessões são
buscadas pelo serviço e publicadas como object URLs sujeitos ao limite de
bytes. Vega-Lite e leituras do Worker MathJSLab também usam o serviço. O cache
textual pertence à sessão do documento, falhas não são armazenadas e URLs de
objeto são revogadas ao substituir imagens ou descartar a sessão. A política
normativa por modo e as limitações de bibliotecas de terceiros estão em
[`markdown-security-policy.md`](markdown-security-policy.md).

Links e imagens proibidos perdem o atributo de destino e geram um diagnóstico
`resource-url-blocked`. Diagnósticos agora também podem informar código,
severidade, URL de origem, linha e coluna. Erros de extensões usam o código
`extension-render-error` e preservam o conteúdo-fonte como fallback.

Mermaid usa o nível de segurança `strict`. Para documentos externos, o
integrador deve escolher `sanitized` ou `strict` e limitar origens conforme o
ambiente de hospedagem. Capabilities são filtradas pelo modo e podem ser
concedidas por `allowedCapabilities`; grants no engine limitam o que o contexto
do documento pode conceder.

## Sessões de execução MathJSLab

A extensão `mathjslab` separa agora a sintaxe Markdown do interpretador que
executa os comandos. O contrato público `MathJSLabExecutor` fornece a conversão
de expressões para MathML e cria uma `MathJSLabExecutionSession` para cada
documento renderizado. A sessão recebe as operações de análise, execução e
descarte; portanto, outros integradores podem fornecer um executor sem depender
do estado global do aplicativo.

No aplicativo, cada documento cria sua própria instância de `Interpreter`.
Variáveis definidas em um fence permanecem disponíveis nos fences seguintes do
mesmo documento, mas não aparecem em outro documento. Blocos e comandos são
executados na ordem em que aparecem, mesmo quando o engine processa extensões
concorrentemente. Cada resultado informa os índices do bloco e do comando nos
atributos `data-block-index` e `data-statement-index`.

O `AbortSignal` do documento interrompe comandos que ainda estejam na fila e
inicia o descarte da sessão. O descarte do documento ou do engine também chama
`dispose()` e limpa o interpretador. A conversão `toMathML` continua separada,
pois expressões inline e em bloco não executam comandos.

Os tipos do contrato são exportados pelos pontos de entrada públicos
`Markdown.ts` e `markdown-document.ts`. Os testes de compatibilidade verificam
isolamento entre documentos, compartilhamento dentro de um documento, ordem de
execução, cancelamento e descarte.

### Resultados estruturados

`MathJSLabExecutionSession.execute()` não recebe um elemento de saída e não
modifica diretamente o DOM do documento. Ele devolve um
`MathJSLabExecutionResult` com estado, situação da execução, erro opcional e
uma sequência de saídas tipadas:

- `text` contém texto literal;
- `mathml` contém a marcação matemática produzida pelo interpretador;
- `html` contém HTML com uma indicação explícita de confiança; HTML não
  confiável é exibido literalmente;
- `node` contém um objeto rico, sua função opcional de montagem e sua função de
  descarte.

A extensão é a única responsável por transformar esse resultado em conteúdo do
fence. Nós ricos são inseridos antes de `mount()` ser chamado, permitindo que
Plotly e outros renderizadores meçam um container conectado. `dispose()` é
chamado quando o documento troca de página, é cancelado ou removido. O papel do
nó (`visualization`, `debug` ou `generic`) é exposto em
`data-mathjslab-output-role`.

O adaptador do aplicativo usa um destino coletor para converter a API atual do
prompt nesse contrato. Saídas matemáticas, mensagens de erro, depuração e
visualizações deixam de escrever no fence durante a avaliação. O prompt e a
saída em lote continuam usando seus destinos existentes.

### Gráficos produzidos pelo MathJSLab

As funções `plot`, `plot3`, `surf`, `plot2d` e `histogram` produzem agora uma
`PlotOutputRequest` durante a avaliação. Cada solicitação contém seu próprio
conjunto de dados, layout e configuração do Plotly. O antigo sinalizador global
`insertOutput` e os buffers globais de dados foram removidos; assim, um comando
posterior ou outro documento não pode substituir os dados antes da montagem do
gráfico.

A captura conhece o interpretador que está executando o comando. Em especial,
`plot2d` avalia sua expressão no escopo da sessão do documento, sem consultar o
interpretador global do aplicativo. Várias solicitações geradas pela mesma
avaliação permanecem na ordem em que foram criadas.

O adaptador converte cada solicitação em uma saída rica. Depois que o host está
conectado, `Plotly.newPlot()` cria a visualização. Um `ResizeObserver` chama
`Plotly.Plots.resize()` quando o espaço muda e é desconectado no descarte;
`Plotly.purge()` libera o gráfico antes de o nó ser removido. Esses objetos
pertencem à sessão e ao comando que os produziram.

### Política de execução

O engine aceita `executionPolicy` tanto na configuração global quanto no
contexto de um documento. As políticas são identificadas pelo nome da extensão;
para comandos MathJSLab usa-se a chave `mathjslab`:

```typescript
const engine = new MarkdownEngine({
    executionPolicy: {
        mathjslab: {
            enabled: true,
            allowInRestrictedMode: false,
            maxSourceBytes: 262144,
            maxBlocks: 32,
            maxStatements: 512,
            timeoutMs: 10000,
        },
    },
});
```

Por padrão, a execução permanece habilitada em documentos `trusted`. Nos modos
`sanitized` e `strict`, fences executáveis são bloqueados antes da criação da
sessão. Um integrador que confie na origem pode habilitá-los explicitamente com
`allowInRestrictedMode: true`. `enabled: false` bloqueia a execução em qualquer
modo.

Os limites são aplicados por documento. `maxSourceBytes` restringe cada fence,
`maxBlocks` restringe a quantidade de blocos executáveis e `maxStatements`
restringe cumulativamente os comandos analisados. Um bloco recusado conserva o
código-fonte visível e recebe uma mensagem local. O callback `onDiagnostic`
recebe um dos códigos `mathjslab-execution-disabled`, `mathjslab-source-limit`,
`mathjslab-block-limit` ou `mathjslab-statement-limit`.

O executor padrão executa as fences em um Web Worker. O `AbortSignal` e
`timeoutMs` encerram a geração ativa do Worker, portanto também interrompem uma
operação JavaScript síncrona que esteja ocupando o interpretador.

### Protocolo assíncrono para Worker

A primeira parte do isolamento em Web Worker define um protocolo versionado e
independente da API concreta do navegador. As mensagens distinguem criação de
sessão, parsing, execução, conversão MathML, descarte e cancelamento. Cada
requisição tem um identificador de correlação e cada documento possui um
`sessionId`; o transporte que usará `postMessage` será responsável por associar
as respostas e emitir cancelamentos.

Somente uma cópia serializável de `MarkdownDocumentContext` atravessa essa
fronteira. Funções, `AbortSignal`, serviços de recursos e elementos DOM são
mantidos na thread principal. Resultados transportados admitem texto, MathML,
HTML explicitamente marcado quanto à confiança e descritores serializáveis de
visualizações Plotly. O Worker calcula dados, layout e configuração; elementos
DOM e a biblioteca de renderização permanecem na thread principal.

`createTransportMathJSLabExecutor` adapta qualquer transporte assíncrono ao
contrato público já usado pela extensão. Assim, o engine e o componente não
precisarão conhecer Worker, IDs de requisição ou `postMessage`. A conversão
inline `toMathML` permanece síncrona e injetada localmente porque é chamada
pelo renderer síncrono do Marked; a operação equivalente já está reservada no
protocolo para uma futura fase de parsing assíncrono.

#### Transporte e runtime do Worker

`WorkerMathJSLabTransport` implementa a correlação das requisições enviadas por
`postMessage`, converte respostas de erro, propaga `AbortSignal` como mensagens
de cancelamento e rejeita operações pendentes se o transporte for encerrado.
`MathJSLabWorkerRuntime`, executado no outro lado do canal, mantém a tabela de
sessões por documento, valida a versão do protocolo e encaminha cada operação à
sessão correspondente.

O bundle independente exporta `createBrowserMathJSLabWorkerExecutor`. Essa
factory cria um Worker ES module empacotado separadamente e usa um
interpretador MathJSLab distinto para cada documento. As variáveis permanecem
entre fences do mesmo documento e são apagadas no descarte. O Worker não recebe
referências ao DOM nem ao estado global do aplicativo.

O aplicativo usa esse executor Worker por padrão para fences `mathjslab`, com
prazo padrão de dez segundos. As funções `plot`, `plot3`, `surf`, `plot2d` e
`histogram` produzem um descritor `PlotOutputRequest` clonável. Na thread
principal, o adaptador cria o nó de saída e importa Plotly somente na primeira
visualização. Montagem, redimensionamento e `purge()` continuam integrados ao
ciclo de vida do documento. Assim, Plotly não integra o chunk inicial do Worker
e nenhum objeto DOM atravessa `postMessage`.

O ambiente do Worker inclui o núcleo MathJSLab, as funções externas comuns e as
funções gráficas. Funções ligadas à interface e à navegação, como `open` e
`markdown`, permanecem fora desse ambiente isolado. A leitura usada por `load`
passa pelo serviço explícito descrito a seguir.

#### Recursos solicitados pelo Worker

O protocolo também possui requisições bidirecionais de recursos. Em uma fence
`mathjslab`, `load('arquivo.m')` envia apenas a referência textual para a
thread principal. O `MarkdownResourceService` resolve essa referência em
relação à URL do documento, aplica `allowedProtocols`, `allowedOrigins`,
`allowNetwork` e o limite de bytes, e devolve o conteúdo ao Worker. O script
carregado é executado na mesma sessão antes do próximo comando, de modo que
suas variáveis ficam disponíveis para as fences seguintes.

Somente URLs literais são aceitas por `load` nesse ambiente. `load()` sem URL,
que abriria uma caixa de seleção de arquivo, continua sendo uma operação da
interface do aplicativo e é recusado dentro de documentos. Loads aninhados são
permitidos até uma profundidade limitada, evitando ciclos ilimitados.

Cada requisição é associada à sessão e à geração do Worker. Cancelamento,
descarte, timeout ou reinicialização abortam leituras pendentes e descartam
respostas tardias; uma resposta de uma geração encerrada nunca é entregue ao
Worker substituto. Erros de rede e de política retornam como erros estruturados
do comando e não interrompem os demais blocos Markdown.

#### Cancelamento preemptivo e recuperação

A política `mathjslab.timeoutMs` limita cada operação enviada ao Worker. Quando
o prazo expira, o transporte encerra o Worker, rejeita a operação com
`MATHJSLAB_TIMEOUT` e cria uma nova geração do processo. Um `AbortSignal`
também encerra imediatamente o Worker, pois uma mensagem de cancelamento não
pode ser processada enquanto JavaScript síncrono mantém o event loop ocupado.

Encerrar um Worker invalida todas as sessões que estavam nele. O adaptador
compara a geração do transporte antes de cada operação e recria automaticamente
a sessão no Worker novo. Essa sessão começa vazia: variáveis e funções
definidas antes da interrupção não são restauradas. O comportamento é
deliberado, pois repetir comandos anteriores poderia repetir efeitos colaterais
e reconstruir o mesmo cálculo que causou o bloqueio.

Outras requisições pendentes recebem `MATHJSLAB_WORKER_RESTARTED`. Erros de
timeout e reinicialização são apresentados no próprio bloco, geram diagnósticos
estruturados e não impedem a execução dos blocos seguintes. O descarte do
engine encerra a geração ativa e rejeita todas as operações ainda pendentes.


## Testes

Os testes de contrato e ciclo de vida ficam em `test/markdown`; a integração em navegadores fica em `mathjslab-app/test/browser`. Consulte os scripts de teste dos respectivos `package.json`. Relatórios e medições são artefatos temporários, regenerados quando necessários.
