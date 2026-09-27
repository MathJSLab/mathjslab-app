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
permite que o futuro componente defina rolagem própria.

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
`markdown-navigate`, que atravessam o limite do Shadow DOM.

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

O ponto de entrada `src/markdown-document.ts` exporta apenas o engine, o custom
element, navegação, modelo, controlador, adaptador de montagem e factories de
extensões. Ele não importa `appEngine`, shell, prompt ou traduções da
aplicação. O bundle ESM é gerado por:

```console
npm run build:markdown-component
```

O resultado principal é `dist/markdown-document/markdown-document.js`; as
bibliotecas opcionais ficam em chunks do subdiretório `chunks/`, e as
declarações TypeScript em `types/`. O bundle registra `<markdown-document>` ao
ser importado e também exporta `defineMarkdownDocumentElement()` para registros
com nome escolhido pelo integrador.

`createEducationalMarkdownEngine()` recebe `features`, que pode ser uma lista
ou `"all"`. A lista controla quais fences educacionais são registrados; cada
biblioteca continua sendo importada somente no primeiro bloco correspondente.
GFM, IDs de títulos, URLs relativas, realce de código e MathJax pertencem ao
perfil `gfm` do núcleo. A extensão MathJSLab é exportada, mas exige serviços de
execução injetados pelo integrador e não faz parte da factory independente.

```javascript
import { createEducationalMarkdownEngine } from "./markdown-document/markdown-document.js";

const viewer = document.querySelector("markdown-document");
viewer.engine = createEducationalMarkdownEngine({
    features: ["mermaid", "smiles", "graphviz", "vega-lite"],
    securityMode: "sanitized",
});
viewer.src = new URL("./aula.md", location.href).href;
```

`example/markdown-document/index.html` é uma página mínima fora do fluxo da
aplicação. Ela serve como verificação de integração para hospedagem comum e
como ponto inicial para consumidores futuros, inclusive plugins de CMS.

Na compilação de referência, o módulo inicial minificado tem aproximadamente
223 KiB. Mermaid, MathJax, Verovio, Graphviz, Vega, Leaflet, Three.js, 3Dmol.js
e os demais renderizadores permanecem em chunks separados. Alguns desses chunks
são grandes, especialmente o módulo WebAssembly do Verovio; eles não são
transferidos até que uma extensão correspondente realmente os importe. O aviso
de limite de tamanho do Webpack registra esses custos opcionais sem impedir a
compilação.

## Testes em navegador real

O Playwright executa a distribuição ESM em Chromium por padrão. O `globalSetup`
inicia um servidor HTTP efêmero na interface local e o encerra ao final da
suíte, evitando dependências de servidor e processos residuais. As fixtures em
`test/browser/fixtures` exercitam o bundle produzido, arquivos Markdown e
recursos relativos como um consumidor externo faria.

```console
npx playwright install chromium
npm run test:browser
```

O primeiro conjunto confirma o carregamento do bundle independente, a
renderização dentro do Shadow DOM, a resolução de imagem relativa, o sumário da
página, a ausência de erros JavaScript e a navegação de Markdown dentro do
componente sem substituir a página hospedeira. Firefox e WebKit já estão
configurados e podem ser habilitados por `npm run test:browser:all` depois da
instalação dos respectivos binários.

Falhas preservam trace, captura de tela e vídeo em `test-results/playwright`.
No CI, o relatório HTML também é escrito em `playwright-report`. Esses
diretórios são artefatos locais e não fazem parte do repositório.

### Navegação e acessibilidade

A suíte real também cobre documentos avulsos e coleções de duas páginas:

- links de fragmento, sumário local e anúncios de seção;
- páginas anterior e seguinte, histórico e página ativa;
- foco no primeiro título após troca de página;
- localização dinâmica dos controles;
- atalhos de histórico e sequência;
- `Seta acima`, `Seta abaixo`, `Home` e `End` dentro do sumário;
- seleção da seção visível depois de uma rolagem do usuário;
- layout de uma coluna em container estreito;
- rolagem instantânea sob `prefers-reduced-motion`.

O navegador revelou que um `IntersectionObserver` podia sobrescrever a seção
escolhida e o anúncio de uma página durante a rolagem programática. O
componente agora pausa temporariamente a observação ao navegar ou mover o foco.
Encerrada a rolagem, novas interseções voltam a atualizar normalmente a seção
ativa.

### Renderizadores opcionais

A suíte `test/browser/markdown-extensions.spec.ts` executa os renderizadores
reais, sem substituir suas bibliotecas por mocks. Ela cobre:

- Mermaid, SMILES, MathJax, Graphviz e Vega-Lite, incluindo a transferência de
  chunks opcionais;
- duas instâncias simultâneas com Shadow DOM e diagramas independentes;
- ABC e Verovio, incluindo a inicialização WebAssembly deste último;
- GeoJSON e TopoJSON em mapas Leaflet sem tiles;
- moléculas com 3Dmol.js e modelos gerais com Three.js sob WebGL.

O MathJax usa um resolvedor de componentes ligado a imports dinâmicos do
Webpack. Assim, `mhchem`, `mathtools`, `physics`, `units`, `boldsymbol`, a
política `safe` e a fonte SVG de `mhchem` são carregados a partir da própria
distribuição, sem depender de caminhos absolutos ou de um CDN. A geração de
fala, Braille e o enriquecimento semântico do pacote combinado permanecem
desativados nesta integração enquanto o componente não distribuir o worker SRE.
A renderização visual não depende desse worker; sua distribuição acessível fica
registrada como trabalho posterior.

Os testes podem ser executados isoladamente após o build com:

```console
npx playwright test test/browser/markdown-extensions.spec.ts --workers=1
```

### Cancelamento, isolamento de falhas e descarte

A suíte `test/browser/markdown-lifecycle.spec.ts` verifica o ciclo de vida no
navegador real. Uma navegação nova aborta a requisição anterior, e a resposta
antiga não pode substituir o documento corrente. Remover o componente durante
uma requisição também aborta o carregamento e impede atualizações tardias.

Falhas de uma extensão permanecem no bloco que as produziu: o código-fonte e o
diagnóstico são preservados, enquanto os blocos seguintes continuam sendo
renderizados. Ao chamar `dispose()`, o componente encerra views e mapas, remove
o conteúdo interativo e desconecta todos os `ResizeObserver` criados pelas
extensões. Para modelos glTF animados, o teste instrumenta
`requestAnimationFrame` e confirma que nenhum frame fica agendado depois do
descarte.

```console
npx playwright test test/browser/markdown-lifecycle.spec.ts --workers=1
```

### Matriz de navegadores e tamanho dos chunks

`npm run test:browser:all` habilita os projetos Chromium, Firefox e WebKit. A
execução padrão continua usando Chromium para fornecer retorno rápido durante o
desenvolvimento. A workflow `.github/workflows/markdown-engine.yml` usa Node.js
22, instala os três motores, executa os testes unitários, compila a
distribuição e roda toda a matriz. Traces, capturas e vídeos de falhas são
preservados como artefatos do CI.

Os imports dinâmicos possuem nomes de chunk estáveis por família, como
`markdown-mermaid`, `markdown-mathjax` e `markdown-model-3d`. O build
independente desativa a divisão automática desses grupos pelo Webpack, mantendo
cada dependência principal associada ao recurso que a carrega. Bibliotecas que
fazem seus próprios imports dinâmicos, em especial os tipos adicionais de
diagrama do Mermaid, continuam aparecendo como chunks lazy compartilhados.

Depois do build, o comando abaixo grava tamanhos minificados, brutos e gzip em
`test/markdown/chunk-baseline.json`:

```console
npm run measure:markdown
```

Na medição de referência, o módulo inicial tem 223 KiB, ou 71 KiB em gzip. Os
maiores recursos opcionais são Verovio, com cerca de 7,7 MiB, e MathJax, com
cerca de 2,1 MiB; nenhum deles faz parte da transferência inicial.

No host de desenvolvimento atual, Chromium e WebKit completaram as 18
verificações. O Firefox 155 fornecido pelo Playwright não consegue criar uma
página sob o Node.js 26 deste host, inclusive em um programa vazio fora da
suíte. Executado temporariamente sob Node.js 22, ele completou as 16
verificações sem WebGL. Os dois testes WebGL são ignorados nesse projeto porque
o runtime headless do Firefox não fornece o contexto exigido pelo Three.js;
ambos são executados em Chromium e WebKit. A matriz de CI fixa Node.js 22 para
isolar a incompatibilidade do driver com o runtime local.

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

## Problemas tratados

- O renderizador inseria código Mermaid diretamente como HTML. Tags, entidades
  e sequências como `</div>` podiam alterar a estrutura antes de Mermaid
  receber o texto. O código agora é escapado e recuperado com `textContent`.
- Um sinalizador global vinculava `parse` e `typeset`: processar um destino
  consumia a indicação de diagramas de outros documentos já analisados. A
  descoberta agora depende do conteúdo de cada destino.
- `map(async ...)` descartava as promessas. Falhas ficavam sem tratamento e
  chamadas seguintes podiam tentar interpretar SVG já renderizado como fonte. O
  engine mantém a tarefa de cada elemento, limita a concorrência e permite
  aguardar chamadas simultâneas sem renderizá-lo duas vezes.
- IDs dependiam do índice local e do ID do destino. Saídas em lote não têm ID;
  diagramas de documentos distintos podiam reutilizar o mesmo ID. A chamada sem
  argumento também acessava `element!.id`. Agora os IDs usam um contador
  próprio, independente do destino, e o argumento padrão é `document`.
- Erros de diagramas agora aparecem como texto junto da fonte original, sem
  impedir os demais diagramas. `suppressErrorRendering` evita o desenho de uma
  mensagem de erro de Mermaid fora do container de saída.
- Saídas com Mermaid agora usam largura de 100%, como as saídas de gráficos, em
  vez de `max-content`, para dar uma largura definida aos SVGs percentuais.
- O README não chamava `typeset`; agora também processa diagramas.
- `help` sem argumentos agora aplica a mesma restrição em `file:` que
  `help tópico`.

Estas correções cobrem defeitos identificados no código. A confirmação visual
no navegador ainda é necessária para fechar o diagnóstico do caso relatado.

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
`none`. A resolução relativa, a navegação e os recursos carregados por
extensões usam o mesmo serviço. O cache textual pertence à sessão do documento,
falhas não são armazenadas e todas as operações recebem o `AbortSignal` da
revisão ativa. URLs de objeto criadas pelo serviço são revogadas no descarte.

Links e imagens proibidos perdem o atributo de destino e geram um diagnóstico
`resource-url-blocked`. Diagnósticos agora também podem informar código,
severidade, URL de origem, linha e coluna. Erros de extensões usam o código
`extension-render-error` e preservam o conteúdo-fonte como fallback.

Mermaid mantém a configuração `loose` já existente. Para documentos externos, o
integrador deve escolher `sanitized` ou `strict` e limitar origens conforme o
ambiente de hospedagem.

## Limites e próximo componente

Links e imagens relativos são resolvidos em relação ao endereço do Markdown.
Fragmentos ainda precisam de navegação própria dentro de Shadow DOM. O tema
Mermaid é fixo e não acompanha a troca de aparência. O mixin
`src/styles/component/_markdown.scss` compartilha as regras de largura dos
documentos entre prompt e saída em lote, nos estados `doc` e `info`: texto com
quebra automática, imagens e SVGs limitados à largura disponível, e rolagem
horizontal local para código, tabelas e fórmulas em bloco. O restante da
apresentação ainda está distribuído entre a página e as saídas.

`openFileDialog` é genérico: ignora arquivos vazios e não oferece estado de
erro ao chamador para falhas de leitura. Erros síncronos de parsing no callback
local também não têm a mesma apresentação dos erros de carregamento remoto.
Esses pontos permanecem para uma revisão do carregamento.

O futuro componente pode receber `src` ou texto diretamente, manter o estado de
carregamento, resolver recursos relativos pela URL de origem e expor uma
promessa ou evento de conclusão. Convém separar:

- Carregamento: fetch, cancelamento, leitura local, validação da resposta e URL
  de origem. A resolução de tópicos, aliases e idiomas de `help` fica fora.
- Renderização: Markdown, conversão matemática injetável, política de HTML,
  Mermaid e erros por bloco.
- Container: tipografia, rolagem, acessibilidade, navegação interna, tema e
  ciclo de vida. Uma nova fonte deve substituir os nós e invalidar operações
  antigas; o `WeakMap` atual pressupõe que cada nó representa uma fonte fixa.

Assim, `markdown`, `help` e README podem reutilizar o componente mantendo suas
regras de carregamento e apresentação. Esta alteração ainda não cria o
componente web.

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

### Fechamento da integração MathJSLab

As funções externas que precisam reavaliar expressões não consultam mais
`appEngine.interpreter`. Durante cada avaliação, `InterpreterRuntime` associa
sincronamente o interpretador à sessão proprietária e restaura o contexto
anterior mesmo quando há exceção. `summation`, `productory`, `plot2d`, a
geração MathML dessas funções e scripts carregados por `load` usam esse
contexto. Isso impede que um documento leia ou altere o workspace interativo ou
a sessão de outro documento.

O corpus de navegador inclui um executor injetado pelo ponto de entrada público
do componente. Os testes cobrem duas fences que compartilham variáveis, saída
rica dentro do Shadow DOM, resize, substituição do documento, descarte da
sessão e do objeto visual, bloqueio em modo `sanitized` e autorização explícita
pelo integrador. Esses testes complementam os testes unitários do contrato, da
fila, dos limites e das capturas Plotly.

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

## Verificação

`node --test script/markdown.test.mjs` executa regressões para preservação da
fonte, códigos comuns, MathML, documentos concorrentes, IDs, repetição, Shadow
DOM, argumento omitido e isolamento de erros. O teste usa o Marked e o serviço
reais, um DOM de teste e um substituto para a geração SVG de Mermaid; não
verifica medidas ou aparência do SVG.

Também foram executados TypeScript sem emissão e compilação Webpack de
desenvolvimento. O navegador integrado não conseguiu abrir a sessão local (erro
de associação da aba à sessão e timeout de navegação), impedindo a verificação
visual nesta execução.

Para a conferência manual, carregar
`markdown('doc/en/row-and-column-major-order.md')`, que contém três diagramas,
no prompt e no editor em lote. Repetir o carregamento e verificar se as saídas
anteriores permanecem visíveis. Conferir também `help`, `help markdown`,
arquivo local com diagrama e um documento com diagrama inválido seguido de
válido.
