# Proposta: componente Markdown navegável

Estado: estratégia para implementação incremental. Este documento não altera o
comportamento da aplicação nem define uma API pública definitiva.

## Diagnóstico do engine atual

O fluxo está dividido entre `src/externalFunctionTable.ts`,
`src/externalCmdWListTable.ts`, `src/Markdown.ts` e `src/main.ts`:

1. `markdown(url)` captura o destino do comando, resolve a URL inicial um
   diretório acima da página localizada e faz `fetch`. Sem argumento, usa o
   seletor local de arquivos.
2. `help` resolve tópico, alias e idioma. Seu carregador também rejeita HTML
   retornado pelo fallback da aplicação; `markdown` verifica apenas o status.
3. `Markdown.parse` converte expressões MathJSLab em linha, inclusive a forma
   protegida com crases, e expressões multilinha em MathML por
   `appEngine.interpreter.ToMathML`; também reserva containers para extensões
   como Mermaid. Os demais códigos usam o Marked padrão.
4. Os chamadores atribuem o HTML à saída e chamam `Markdown.typeset`. Essa
   etapa procura Mermaid, inclusive em Shadow DOM aberto, gera SVG, insere o
   resultado e associa interações. Um WeakMap evita processar novamente o mesmo
   elemento.
5. Prompt, saída em lote e README têm destinos próprios. O CSS de documentos
   compartilha algumas regras de largura, mas o serviço não controla layout,
   carregamento de imagens, histórico ou navegação.

Hoje não há realce de códigos Markdown pelo Highlight.js, integração Markdown
com Plotly ou dependência MathJax declarada no projeto. Highlight.js já aparece
nos editores/saídas de comandos. Plotly é usado pelo `PlotEngine`, com estado
mutável compartilhado e ligação a `insertOutput` e `appEngine`; esse caminho
não deve ser usado diretamente como renderizador de documentos independentes.

O sucesso observado pelo usuário com `test-mermaid.md` confirma o funcionamento
nesse cenário. Não demonstra a causa do espaço vazio no documento composto.
Imagem, fórmula e diagramas juntos devem permanecer como caso de regressão. Não
há evidência suficiente para atribuir a falha anterior a `height: auto`.

## Separação proposta

Nome provisório: `<markdown-viewer>`. O componente coordena cinco partes:

| Parte          | Responsabilidade                                             |
| -------------- | ------------------------------------------------------------ |
| DocumentLoader | Texto, URL final, MIME, cancelamento e resolução de recursos |
| MarkdownEngine | Instância própria do parser, tokens, HTML e blocos especiais |
| RenderSession  | Uma geração do documento, tarefas, diagnósticos e limpeza    |
| Extensões      | Mermaid, código, MathJSLab, Plotly e MathJax                 |
| MarkdownViewer | DOM, estado visual, navegação, histórico, foco e resize      |

O núcleo não importa `appEngine`, `Shell`, destinos de comando ou traduções da
aplicação. Recebe serviços por propriedades/factory: carregador, extensões,
conversor matemático e política de conteúdo. A integração MathJSLab injeta
esses serviços e mantém a configuração de aliases e idiomas fora do componente.

Usar uma instância `new Marked(...)` por engine configurado evita acumular
extensões na instância global. A documentação do
[Marked descreve esse isolamento](https://github.com/markedjs/marked/blob/master/docs/USING_PRO.md).

Shadow DOM é uma boa opção para encapsular estilos. A integração com as
factories existentes deve ficar no adaptador da aplicação. Para distribuição
independente, o componente precisa levar seu template e CSS, sem exigir
templates previamente instalados em `document` pelo Webpack do MathJSLab.

## Contrato inicial sugerido

```ts
interface MarkdownDocumentInput {
    text: string;
    baseUrl?: string;
}

// API conceitual, ainda não implementada:
viewer.load(url); // Promise<RenderResult>
viewer.setDocument(input); // Promise<RenderResult>
viewer.back();
viewer.forward();
viewer.reload();
viewer.currentUrl;
viewer.canGoBack;
viewer.canGoForward;
```

Atributos declarativos mínimos: `src`, `base-url`, `theme` e opção de controles
de navegação. Serviços e configurações complexas ficam em propriedades JS.
Definir precedência: a última chamada/alteração inicia uma geração nova;
`setDocument` substitui a origem ativa, sem refazer fetch do atributo antigo.

Eventos propostos: `loadstart`, `documentload`, `rendercomplete`,
`documenterror`, `blockerror`, `navigationchange` e `linkactivate` cancelável.
Eventos públicos devem atravessar Shadow DOM (`bubbles` e `composed`).
`RenderResult` informa sucesso, sucesso parcial ou cancelamento e os
diagnósticos. Conclusão inclui extensões ativas, mas não espera indefinidamente
por imagens remotas. Mudanças posteriores de layout são tratadas por
observadores.

## URLs e navegação

Há duas bases distintas:

- **Entrada da aplicação:** `markdown('help/en/abs.md')` continua usando a base
  acima do endpoint de idioma. Essa regra pertence ao adaptador do comando.
- **Conteúdo do documento:** links e imagens usam
  `new URL(referencia, documentUrl)`. A URL final de `response.url`, após
  redirecionamentos, passa a ser a origem do documento carregado.

Exemplo: de `/doc/en/chapter.md`, `figures/a.svg` aponta para
`/doc/en/figures/a.svg`; `../pt/chapter.md` aponta para `/doc/pt/chapter.md`.
Normalizar links antes de inseri-los no DOM evita buscas de imagens pela base
errada. Tratar também referências Markdown, HTML permitido e `srcset` com
parser apropriado; não usar substituição global de strings ou uma tag `<base>`.

Regras para o primeiro navegador de documentos:

| Link                              | Ação proposta                                                               |
| --------------------------------- | --------------------------------------------------------------------------- |
| `#seção`                          | Mover foco/rolagem para a âncora no documento atual                         |
| Outro documento Markdown          | Carregar no próprio componente e registrar histórico                        |
| Outro Markdown com fragmento      | Carregar, renderizar e então localizar a âncora                             |
| URL sem extensão                  | Resolver pelo carregador/MIME ou resolvedor configurado                     |
| Página HTML, PDF ou outro recurso | Evento/ação explícita; não substituir silenciosamente a página da aplicação |
| `mailto:` e `tel:`                | Ação externa explícita, conforme política do integrador                     |

Links absolutos para Markdown também podem navegar internamente. Cliques com
modificadores, botão do meio e downloads devem preservar a intenção explícita
do usuário. IDs de títulos precisam ser determinísticos, incluindo duplicatas e
acentos; resolver fragmentos no root do componente, não em `document`.

Cada instância tem seu histórico: URL, fragmento e posição de rolagem. Não
alterar o histórico global do navegador por padrão. Navegação fracassada mantém
o documento anterior e apresenta o erro. Só confirmar a entrada no histórico
quando o novo documento estiver disponível. Voltar/avançar também deve cancelar
carregamentos superados.

Não é possível prometer carregar qualquer site remoto: CORS e políticas de
incorporação continuam valendo. HTML arbitrário não deve ser interpretado como
Markdown. Navegação GitHub deve distinguir página `blob` de URL de conteúdo
`raw`; conversão, quando desejada, cabe a um resolvedor explícito.

Um arquivo escolhido isoladamente não fornece acesso automático a seus irmãos.
Para texto local sem URL, exigir `baseUrl` ou um resolvedor de recursos locais;
oferecer seleção de diretório/arquivos relacionados numa etapa posterior.

## Pipeline e ciclo de vida

1. Iniciar geração com identificador próprio e AbortController; cancelar a
   anterior. Validar a fonte e obter texto/metadados.
2. Tokenizar preservando o código original de cada extensão fora do HTML.
   Produzir estrutura de documento e placeholders com IDs exclusivos.
3. Aplicar política de HTML/URLs e sanitização ao conteúdo autoral antes de
   inseri-lo. Resolver links e recursos a partir da URL do documento.
4. Montar o DOM. Renderizadores que medem geometria só recebem containers
   conectados e com dimensões utilizáveis; containers ocultos aguardam
   exibição.
5. Executar extensões com isolamento de erro por bloco. Antes de inserir cada
   resultado, conferir se a geração ainda é a ativa.
6. Restaurar âncora/foco/rolagem, sinalizar conclusão e acompanhar
   redimensionamento.
7. Ao trocar de documento ou desconectar, limpar listeners, observers, objetos
   de gráficos, estado matemático e URLs de objetos locais.

Abortar fetch não cancela automaticamente Mermaid ou Plotly. Resultado antigo
deve ser descartado, com limpeza, mesmo quando o motor não admite cancelamento.
A sessão deve preservar fonte e configuração para nova renderização de tema,
sem tentar reinterpretar SVG pronto como Markdown.

Cada extensão recebe fonte, metadados, container, tema, URL-base, sinal de
cancelamento e identificador de geração. Retorna uma tarefa e, quando preciso,
operações de resize/dispose. Somente uma extensão é dona de cada bloco.

## Extensões e sintaxes

| Conteúdo                      | Sintaxe proposta                                 | Comportamento                                   |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Mermaid                       | Fence `mermaid` existente                        | SVG e interações controladas                    |
| Código                        | Fence `typescript`, `matlab`, etc.               | Highlight.js; linguagem desconhecida vira texto |
| MathJSLab                     | Expressões inline, protegidas e multilinha       | Conversão em MathML pelo serviço injetado       |
| Matemática MathJSLab em bloco | Fence `mathjslab-math`                           | Proposta explícita, sem executar um script      |
| Plotly                        | Fence `plotly` com JSON `{data, layout, config}` | Gráfico declarativo validado                    |
| LaTeX                         | Fence `latex`; depois `\(...\)` e `\[...\]`      | MathJax, separado do MathML do MathJSLab        |

Esses nomes novos são propostas para revisão. Evitar usar `matlab` como sinal
de execução: exemplos continuam sendo exemplos. JSON de Plotly não admite
funções JavaScript. Gerar gráficos por execução MathJSLab pode ser uma extensão
posterior, com contexto separado e execução explícita.

O realce deve usar a linguagem declarada e carregar somente as gramáticas
habilitadas. O
[Highlight.js oferece APIs por código ou elemento](https://highlightjs.readthedocs.io/en/latest/api.html);
não varrer a página inteira com `highlightAll`.

Mermaid mantém geração assíncrona seguida de associação de eventos, como na
[API oficial](https://mermaid.js.org/config/usage). Sua configuração
compartilhada exige coordenação entre instâncias, principalmente ao alternar
temas. Não reinicializar o motor global de forma concorrente para cada bloco.

Para Plotly, usar dados por bloco e um adaptador independente do estado global
de `PlotEngine`. Dimensionar o host por ResizeObserver, incluindo mudanças
causadas por imagens, e liberar o gráfico com
[`Plotly.purge`](https://plotly.com/javascript/plotlyjs-function-reference/).

No MathJax, validar primeiro uma integração por expressão no Shadow DOM,
preferencialmente com saída SVG autocontida. Se usarmos typesetting de DOM,
delimitar os containers e limpar antes da remoção, conforme
[typesetPromise/typesetClear](https://docs.mathjax.org/en/latest/advanced/typeset.html).
Macros, labels e numeração precisam de escopo por documento. Não assumir que
uma configuração global separa esses estados automaticamente.

Delimitadores LaTeX devem ser reconhecidos pelo tokenizer antes de o Markdown
consumir escapes, respeitando blocos e códigos inline. Não ativar `$...$`
inicialmente: pode conflitar com valores monetários e documentação existente.
Não executar MathJax sobre MathML já produzido pelo MathJSLab.

## Estilos e política de conteúdo

Dar largura definida ao host e ao artigo; manter quebra de prosa e scroll local
para código/tabelas. Renderizadores controlam suas próprias dimensões. Evitar
regras genéricas que alterem todos os SVGs internos, inclusive os do Plotly.
Reservar espaços de mídia quando houver dimensões e testar imagens lentas ou
quebradas sem condicionar a existência dos diagramas ao sucesso delas.

O [Marked não sanitiza o HTML](https://marked.js.org/). Definir um perfil
padrão para documentos remotos: HTML permitido limitado, URLs validadas, sem
scripts, handlers inline ou execução automática de programas. Sanitização deve
preservar o MathML necessário e distinguir HTML autoral de saídas dos
adaptadores. Um sanitizador usado diretamente deve ser dependência explícita do
componente, não uma dependência transitiva de Mermaid. Shadow DOM não é uma
sandbox de segurança.

## Sequência de implementação

1. **Fixtures e contrato mínimo.** Fixar documentos com Mermaid sozinho e
   misturado a imagem/MathML, prosa longa, tabelas e links. Definir resultado,
   contexto do documento e contrato de extensão.
2. **Extração do engine.** Retirar dependências globais da aplicação, isolar
   Marked, adaptar Mermaid e MathJSLab. Manter `Markdown` como fachada
   temporária.
3. **Componente mínimo navegável.** Texto/URL, política de conteúdo, estados,
   largura, cancelamento, links/imagens relativos, âncoras e histórico local.
   Migrar primeiro `markdown`, depois `help` e README; preservar apresentação
   específica e resolução de idioma/tópicos nos adaptadores.
4. **Highlight.js.** Realce explícito, estilos encapsulados, fallback e teste
   para código contendo HTML literal.
5. **Plotly declarativo.** Validação JSON, estado por bloco, resize e dispose.
6. **MathJax.** Prova de integração Shadow DOM, sintaxe, isolamento de macros e
   ciclo de vida. Carregamento sob demanda dos motores opcionais.
7. **Distribuição.** Exportação independente, dependências/peers documentados,
   página de exemplo fora do app, acessibilidade e documentação pública.

Primeira entrega recomendada: etapas 1 a 3, preservando os recursos atuais e
adicionando navegação interna. Highlight.js é a extensão seguinte. Evitar
introduzir todos os motores na mesma mudança, para identificar regressões.

## Critérios de aceitação

- Duas instâncias independentes, sem IDs, históricos, estilos ou dados
  cruzados.
- Navegação A → B → voltar, caminhos `../`, fragmentos, redirecionamento e
  CORS.
- Resposta lenta A não substitui B depois de uma navegação mais recente.
- Falha de rede preserva o documento; falha de bloco preserva os demais blocos.
- Documentos em prompt, lote e página independente respeitam largura estreita.
- Mermaid com imagem válida, quebrada e lenta; com e sem MathML; em container
  inicialmente oculto e após resize. Verificar SVG visível e dimensões não
  nulas.
- Troca de tema, navegação e remoção não acumulam gráficos, observers ou
  MathItems.
- Links não navegam a aplicação inteira sem intenção explícita; teclado e foco
  continuam utilizáveis dentro do componente.
- HTML/URLs impróprios são recusados; códigos de exemplo permanecem inertes.

Os testes atuais de `script/markdown.test.mjs` cobrem orquestração e parsing,
mas substituem Mermaid e o DOM. Preservá-los e acrescentar testes em navegador
real para SVG, Shadow DOM, fontes, dimensões e limpeza. Compilação TypeScript e
Sass não substitui essa validação visual.

Entendido. Minha proposta anterior antecipou a simplificação da autoria e mudou
indevidamente a linguagem dos gráficos. **Vamos priorizar a abrangência dos
recursos, usando bibliotecas e linguagens existentes, com `marked` como
processador central.**

Um bloco `mathjslab` conterá comandos completos, inclusive cálculos e chamadas
de gráficos. Não criaremos uma sintaxe alternativa para expressões e
intervalos.

O catálogo inicial de bibliotecas fica assim:

| Recurso                            | Biblioteca           | Entrada                                 |
| ---------------------------------- | -------------------- | --------------------------------------- |
| Markdown, tabelas, imagens e links | `marked`             | Markdown/GFM                            |
| Realce de código                   | `highlight.js`       | Código com identificador de linguagem   |
| Diagramas                          | `mermaid`            | Linguagem Mermaid                       |
| Matemática LaTeX                   | MathJax              | LaTeX matemático                        |
| Fórmulas e equações químicas       | MathJax com `mhchem` | Comandos como `\ce{...}`                |
| Cálculos, matemática e programas   | `mathjslab`          | Comandos em fences `mathjslab`          |
| Gráficos produzidos pelo MathJSLab | `plotly.js`          | Saída das funções gráficas do MathJSLab |
| Mapas                              | Leaflet              | GeoJSON e arquivos associados           |
| Modelos tridimensionais            | Three.js             | Formatos existentes, como glTF/GLB      |
| Estruturas moleculares 2D          | SmilesDrawer         | SMILES                                  |
| Estruturas moleculares 3D          | 3Dmol.js             | Arquivos moleculares, como PDB e SDF    |

Essas bibliotecas atendem a representações distintas:
[`mhchem`](https://docs.mathjax.org/en/latest/input/tex/extensions/mhchem.html)
compõe equações químicas;
[SmilesDrawer](https://github.com/reymond-group/smilesDrawer) desenha
estruturas a partir de SMILES;
[3Dmol.js](https://3dmol.csb.pitt.edu/doc/index.html) oferece visualização
molecular tridimensional. Para mapas e modelos gerais, há suporte documentado a
[GeoJSON no Leaflet](https://leafletjs.com/examples/geojson/) e
[glTF no Three.js](https://threejs.org/docs/pages/GLTFLoader.html).

Para arquivos e formatos binários, precisaremos apenas definir como o Markdown
referencia o recurso. Isso será uma convenção de integração, preservando o
formato original do objeto.

**O funcionamento dos blocos `mathjslab` também ficou definido pelas suas
respostas:**

- Execução automática durante a renderização.
- Execução na ordem em que aparecem no documento.
- Variáveis compartilhadas entre os blocos do mesmo documento.
- Interpretador separado do shell e dos demais documentos.
- Possibilidade de o integrador desabilitar a execução.

Isso exige extrair a avaliação e a produção de gráficos do estado global atual.
Os resultados devem ser associados ao bloco que os produziu; navegar para outro
documento deve encerrar a sessão anterior e impedir que resultados pendentes
apareçam no novo conteúdo.

**A estrutura de diretórios será outra entrada do componente**, além de texto e
URL. Uma árvore fornecida pelo integrador permitirá gerar um sumário
hierárquico opcional, selecionar documentos e navegar no próprio container.
Convém distinguir esse sumário da coleção do índice de títulos do documento
aberto.

A sequência de trabalho passa a ser:

1. **Consolidar o catálogo de bibliotecas:** formatos, licenças, dependências,
   assets necessários e integração com Shadow DOM.
2. **Implementar o núcleo com `marked`:** carregamento, links relativos,
   navegação, árvore de documentos e registro de extensões.
3. **Implementar as extensões**, preservando suas linguagens e carregando
   módulos, estilos e assets somente quando necessários.
4. **Validar tecnicamente cada integração durante o desenvolvimento**,
   incluindo execução, dimensões, isolamento e descarte de recursos.
5. **Depois do conjunto implementado, elaborar notas de aula** para testar a
   combinação dos recursos e avaliar melhorias de autoria.

WordPress permanece uma possibilidade futura de integração. Desde o início,
porém, o componente deverá funcionar fora do MathJSLab, sem depender de
`appEngine` ou dos templates da aplicação.

Essa orientação substitui a proposta de começar pelo catálogo de aulas e pela
criação de uma linguagem simplificada.
