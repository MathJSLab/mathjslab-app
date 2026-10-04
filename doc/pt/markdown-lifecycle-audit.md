# Auditoria do ciclo de vida Markdown após 1.10

Data: 4 de outubro de 2026. Escopo: Etapa 1 da estratégia Markdown, primeiro
incremento no `mathjslab-app` 1.10.2.

## Escopo e método

Foi lida integralmente a estratégia atual em `../estrategia-markdown.md`. A
auditoria examinou o engine, a fachada `Markdown`, modelo, host, controller,
navigator, componente, serviço de recursos, extensões e integrações
MathJSLab/Worker, além das suítes Jest, legada e Playwright. Não houve
alteração em dependências compartilhadas, `mathjslab-batch`, catálogo de
extensões ou assinaturas públicas.

O checkout estava limpo no início. Não foram executados commit, push ou
publicação. As estruturas entregues na série 1.10 foram usadas como baseline.

## Mapa de ownership

| Objeto ou recurso                              | Proprietário e duração                                                                                    | Cancelamento e liberação                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MarkdownEngine`                               | Host que o cria; a fachada `Markdown` mantém um singleton                                                 | Descarte por container preserva o engine; descarte global é definitivo                                                                                  |
| Parser, registros e inicialização de extensões | Engine; compartilhados por seus documentos                                                                | Extensões recebem `dispose()` no descarte global; hooks `disposeContainer()` são isolados por documento e tentam todos os cleanups antes de agregar erros |
| `MarkdownDocumentSession`                      | Engine, indexada pelo `HTMLElement`                                                                       | A substituição reserva a nova sessão imediatamente e encadeia a limpeza anterior; `releaseSession` compara a identidade                                 |
| Container de documento                         | Fornecido pelo host; sessão controla seus filhos                                                          | A sessão limpa filhos ao terminar o descarte, sem remover o próprio container                                                                           |
| `update()` e `navigate()`                      | Sessão; revisão crescente e cadeia de operações                                                           | Cada chamada cancela a anterior; produção, limpeza e publicação verificam revisão/sinal                                                                 |
| `AbortController` da sessão                    | Uma operação; o sinal continua disponível às extensões visíveis/interativas após o primeiro render        | Próxima operação ou descarte aborta; vínculo ao sinal externo é removido por `cancel()`                                                                 |
| Renderizações ativas                           | Engine, `renderings`, indexadas por elemento                                                              | A sessão espera a operação; a limpeza espera fences rastreadas. Uma extensão ativa precisa cooperar com o sinal ou terminar                             |
| Renderizações enfileiradas                     | Engine, fila global limitada por `maxConcurrentRenders`                                                   | Abort remove e resolve a tarefa ainda enfileirada e remove seu listener; descarte global esvazia a fila imediatamente                                   |
| Renderizações visíveis                         | Engine, mapa `deferred`, um observer por elemento                                                         | Abort/descarte desconecta; callback verifica identidade do observer e cancelamento antes de iniciar                                                     |
| Serviço de recursos e object URLs              | Cada sessão cria um serviço próprio; controller e componente usam serviços temporários para fetch inicial | Sessão cancela fetches, limpa cache de textos concluídos e revoga URLs; criação após descarte é proibida. Atualizações preservam o serviço da sessão       |
| `MarkdownDocumentModel`                        | Host/controller; árvore, índices e metadados                                                              | Não possui tarefas, observers ou listeners. `createMarkdownOutline` pode atribuir IDs ao DOM                                                            |
| `MarkdownDocumentController`                   | Host ou componente                                                                                        | Possui sessão, navigator, subscriptions, revisão e controller de carga inicial. O sinal inicial agora acompanha também a renderização                   |
| `MarkdownNavigator`                            | Fachada, controller ou componente                                                                         | Possui listener de click e histórico; `dispose()` remove listener e invalida notificações. Não é proprietário da sessão                                 |
| Host `mountMarkdownDocument`                   | WeakMap de containers para componentes                                                                    | Substitui conteúdo e chama descarte do componente. Listeners de conclusão são removidos ao receber ready/error                                          |
| `<markdown-document>`                          | DOM/host; possui engine interno e pode receber engine externo                                             | Desconexão aborta carga e libera sessão/controller/navigator/observer de seções. Reconexão solicita nova carga. Não descarta globalmente engine externo |
| Listeners internos do Shadow DOM               | Instância do componente                                                                                   | Click/keydown criados uma vez no construtor e preservados para reconexão; não são registrados em `window`/`document`                                    |
| Microtasks de carga e observer de seções       | Componente                                                                                                | Cargas agendadas verificam revisão; callbacks de seções verificam identidade e conexão                                                                  |
| Sessões MathJSLab                              | Extensão, por sinal/contexto; blocos do documento executam em sequência                                   | Abort inicia limpeza da sessão; saída rica e ResizeObservers são liberados pelo descarte dos fences                                                     |
| Worker usado pelo adapter atual                | `createBrowserMathJSLabWorkerExecutor` → `RemoteMathJSLabRuntime` de `mathjslab/runtime`                  | Sessão remota tem descarte próprio; executor libera runtime global. Sem alterar a implementação canônica do pacote `mathjslab`                          |
| Transporte Worker público legado               | `WorkerMathJSLabTransport` e executor de transporte                                                       | Requests têm IDs, timeout/listeners e geração; abort/falha reinicia Worker, remove listeners, aborta recursos e rejeita pendências                      |
| Runtime Worker público legado                  | `MathJSLabWorkerRuntime`                                                                                  | Possui sessões/requests; descarte idempotente, rejeita recursos pendentes e elimina sessão criada tardiamente                                          |

### Recursos das extensões

| Extensão                               | Estado mantido                                                                                      | Limpeza existente e pontos de atenção                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading IDs, URLs relativas, highlight | Plugins/parser; highlight registra linguagens no módulo                                             | Sem recursos por fence que exijam descarte                                                                                                                |
| Mermaid                                | Promise de import, sequência, Set de elementos/SVG                                                  | Fence remove do Set e limpa DOM; render não consulta sinal durante awaits                                                                                 |
| SMILES                                 | Promise de import, sequência, Set de elementos/SVG                                                  | Fence remove do Set e limpa DOM; render não consulta sinal durante awaits                                                                                 |
| Graphviz                               | Instância WASM/import e Set de elementos                                                            | Hook por container limpa nós e remove entradas do Set; importação global continua no escopo do engine                                                    |
| MathJax                                | API global, promise de carga e Set de elementos                                                     | `disposeContainer()` chama `typesetClear` apenas para os nós do documento; descarte global limpa elementos restantes                                       |
| ABC                                    | Map por container, synth e listener de play                                                         | Stop/remove na limpeza; inicialização/prime de áudio e sanitização ainda precisam de testes de corrida                                                    |
| Verovio                                | Toolkit WASM por container e módulo compartilhado                                                   | `destroy()` por fence; toolkit local é destruído quando render lança erro                                                                                 |
| Maps                                   | Map Leaflet e função de desconexão de resize                                                        | `map.remove()` e desconexão; registro ocorre depois de base layer, GeoJSON e fitting, permitindo falha parcial antes do registro                          |
| Molecule 3D                            | Viewer e desconexão de resize                                                                       | Para spin, remove modelos e limpa viewer; registro ocorre depois de model/style/render                                                                    |
| Vega-Lite                              | Resultado de embed/view e desconexão de resize                                                      | `finalize()` e desconexão; abort após embed finaliza. Falhas durante embed/registro ainda requerem instrumentação                                         |
| Model 3D                               | Renderer, scene, geometria/material/map texture, controls, mixer, RAF, resize e visibility observer | Cancela RAF, desconecta, remove listener, descarta objetos/renderer e força perda de contexto; falhas antes de `entries.set` podem perder ownership local |
| MathJSLab                              | Sessões, cadeia de blocos, outputs ricos, ResizeObservers                                           | Fence libera outputs; extensão libera sessões e executor. Abort usa limpeza assíncrona sem aguardar a promise no listener                                 |

## Invariantes e alcance comprovado

O contrato desejado inclui última operação vencedora, ausência de trabalho
obsoleto após update/navegação, cancelamento sem publicação tardia, retry,
isolamento, descarte idempotente, reconexão previsível e liberação de todos os
recursos. Este incremento prova parte desse contrato; não encerra a Etapa 1.

| Invariante                                                                      | Garantia deste incremento                                                                                                         | Limite                                                                                                                              |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Somente a revisão atual publica HTML                                            | Verificação após `renderHTML`, antes de atualizar contexto e DOM                                                                  | Extensões que já receberam elementos podem escrever durante operação ativa se ignorarem o sinal                                     |
| Nova sessão substitui a anterior no mesmo container                             | Reserva síncrona e espera pela limpeza anterior; sessão obsoleta fica `disposed`                                                  | Limpeza que não termina ainda bloqueia a substituição                                                                               |
| Update/navegação não ressuscitam resposta antiga                                | Sinal/revisão após producer e antes de publicar; resposta atrasada de navegação é descartada                                      | Fetch customizado que nunca termina bloqueia a cadeia atual                                                                         |
| Abort de tarefa na fila não depende de outro documento                          | Remoção imediata, promise resolvida e listener removido                                                                           | Não interrompe uma fence já em execução                                                                                             |
| Observer descartado não inicia render tardio                                    | Identidade, sinal e estado do engine verificados no callback                                                                      | Bibliotecas podem manter seus próprios observers                                                                                    |
| Retry no mesmo container após erro/abort                                        | Promise rejeitada é absorvida na cadeia seguinte; sinal inicial não fica persistido; cleanup de fence que lança erro é exercitado | Extensão que captura erro internamente e perde recurso local não é corrigida pelo engine                                            |
| Documentos compartilham engine sem compartilhar controller de operação/recursos | Sessões e serviços separados; descarte de um container preserva outro; URLs são revogadas por proprietário                        | Estado global de biblioteca e falha de Worker compartilhado exigem auditoria adicional                                              |
| Descarte de sessão/engine é idempotente sob concorrência                        | Chamadas esperam a mesma limpeza; todos os disposers registrados são tentados, erros agregados ao fim; engine bloqueia novas sessões | Disposer de terceiros que nunca conclui pode prolongar o descarte |
| Componente não adota sessão obsoleta                                            | Sessão local só é atribuída após verificar cancelamento/conexão; controller é registrado antes de initialize                      | Outras microtasks de anúncio/foco ainda não carregam revisão                                                                        |
| Reconexão é previsível                                                          | Desconexão invalida operação; reconexão produz nova sessão com conteúdo atual; engine externo continua reutilizável               | Engine interno permanece vivo durante vida da instância; não há novo modo de descarte definitivo do componente                      |
| Dispose explícito cancela carga agendada                                        | Microtask de `requestLoad()` compara revisão; setters no mesmo turno são coalescidos                                              | Nova alteração ou `reload()` posterior pode iniciar outra carga, intencionalmente                                                   |

## Lacunas reproduzidas e correções

1. `container.innerHTML = await renderHTML(...)` publicava resultado cancelado
   durante o await. Teste com promise controlada e MutationObserver observou
   conteúdo obsoleto no DOM. A publicação agora verifica revisão e sinal.
2. Dois `renderDocument()` aguardavam o mesmo descarte antes de registrar suas
   sessões, deixando a primeira órfã. Teste verificou `disposed === false` na
   sessão substituída. A reserva agora ocorre antes de qualquer await.
3. Tarefa abortada na fila permanecia pendente enquanto outra sessão ocupava a
   única vaga. Teste verificou resolução antes de liberar a fence bloqueada. A
   fila agora possui listener removível de cancelamento.
4. Segundo `session.dispose()` resolvia antes da limpeza da primeira chamada.
   Teste segurou o disposer de fence. A sessão reutiliza sua promise de
   limpeza; o engine usa a mesma técnica e entra em estado terminal
   imediatamente.
5. Callback de IntersectionObserver já entregue podia iniciar uma fence após
   `dispose(container)` sem sessão/sinal. Teste chamou o callback depois do
   descarte. A identidade do registro agora é obrigatória.
6. Sinal abortado na primeira carga persistia como contexto padrão da sessão.
   Teste falhou ao usar `session.update()` sem contexto para retry. Sinais são
   de operação e removidos do contexto persistente também no construtor.
7. Carga do componente agendada em microtask podia recriar documento após
   `dispose()`. Playwright contra o bundle anterior encontrou estado `ready`,
   sessão existente e conteúdo, em vez de `empty`. A microtask verifica
   revisão.
8. O controller descartava o sinal da carga inicial ao entrar em renderização;
   componente e controller atribuíam resultados assíncronos diretamente aos
   campos compartilhados. Agora o sinal acompanha a renderização; resultados
   são locais até validar estado, e o componente registra controller antes de
   aguardar initialize. O vínculo ao sinal externo permanece depois da carga
   inicial para cancelar trabalho diferido e é removido no descarte do
   controller. Um teste adicional detectou e corrigiu a perda desse vínculo
   durante a revisão do incremento.
9. `void pending.then(success)` produzia uma promise rejeitada sem handler
   quando fence lançava erro. O observador auxiliar agora trata rejeição; a
   promise pública continua rejeitando normalmente. Retry/falha parcial testa
   recursos registrados antes da exceção.
10. No descarte global de uso sem sessão, uma tarefa retirada da fila ainda
    podia reter o elemento em `renderings`. Instrumentação do registro mostrou
    um elemento restante depois do descarte. O registro agora é esvaziado
    depois da conclusão e limpeza dos fences.
11. Um hook `prepare()` pendente podia concluir depois do descarte global e
    criar um novo observer de visibilidade. Um teste controlou esse await e
    observou a criação tardia. Guards após prepare e nas entradas de render e
    defer impedem novas renderizações/observers em engine descartado.

12. Callbacks síncronos de abort podiam reentrar em `dispose()` e duplicar
    limpeza, ou iniciar `renderDocument()` e permitir que uma solicitação
    anterior prevalecesse. Três testes falharam antes da correção. As promises
    de descarte e o ownership da nova sessão agora são registrados antes de
    disparar esses callbacks.

13. Hooks de `typeset()` fora de uma sessão ficavam registrados no engine
    mesmo depois de resolverem. O registro agora é removido junto com o vínculo
    ao sinal; há teste que inspeciona o ownership após conclusão.
14. O cache compartilhava uma promise de fetch ainda em andamento entre
    chamadas com sinais diferentes. Um abort podia cancelar a leitura da outra
    chamada. O cache agora guarda apenas textos concluídos; um teste usa a mesma
    URL com dois sinais e comprova cancelamento independente.
15. `mountMarkdownDocument()` aguardava `markdown-ready`, mas desmontagem e
    descarte do host não liquidavam a promise se a carga era abortada. O host
    agora rejeita mounts cancelados, serializa descarte concorrente e observa a
    remoção direta do componente.
16. A fachada `Markdown` ligava o navigator ao sinal da última operação;
    navegar aborta esse sinal ao substituir conteúdo e desmontava o navigator
    ativo. A fachada agora observa a vida da sessão, valida a revisão mais
    recente e é limpa quando outra chamada do engine substitui o documento.
17. Hooks MathJax/Graphviz mantinham elementos além do fence, e MathJSLab
    descartava sessão de forma assíncrona sem promise compartilhada. Foi
    acrescentado `disposeContainer` por extensão; esses hooks e as saídas ricas
    agora limpam por documento, com teste isolando MathJax e MathJSLab.
18. Maps, 3Dmol, Three.js e Vega podiam falhar entre a alocação e o registro do
    recurso. O cleanup local agora cobre esses caminhos, inclusive renderer,
    viewer e resize observers parcialmente inicializados. A suíte de
    navegador comprova descarte no caminho integrado; falhas internas das
    bibliotecas gráficas ainda não são injetadas em cada etapa.
19. O runtime Worker aceitava criação de sessão durante descarte e não
    compartilhava uma promise idempotente para descartes concorrentes. Agora
    fica terminal, espera criações pendentes e limpa sessões que terminam de
    criar durante shutdown. O adapter de navegador também separa storage por
    sessão e libera contexto se a criação falha.

## Arquivos e testes

- `src/MarkdownEngine.ts`: revisão de publicação, reserva de sessão, retry,
  promises de descarte, cancelamento da fila, guards entre hooks e observers.
- `src/markdown/MarkdownDocumentController.ts`: sinal de renderização inicial e
  adoção local de sessão.
- `src/Markdown.ts`, `src/markdown/lifecycle.ts` e
  `src/markdown/MarkdownDocumentHost.ts`: navigator ligado à sessão, callbacks
  de ciclo de vida, mounts canceláveis e agregação de cleanup.
- `src/markdown/security.ts`: cache só de conteúdo concluído, cancelamento de
  fetch no descarte e estado terminal do serviço de recursos.
- Extensões MathJax, Graphviz, MathJSLab, Maps, 3Dmol, Three.js, Vega-Lite,
  Mermaid, SMILES, ABC e Verovio: cleanup por documento, tratamento de falha
  parcial e guards de abort nos callbacks assíncronos.
- Runtime, executor e testes do Worker MathJSLab: shutdown idempotente, criação
  tardia limpa, sessões serializadas durante descarte e contextos isolados.
- `src/components/markdown-document/markdown-document.component.ts`: carga
  agendada por revisão, adoção de sessão/controller e observer de seções.
- `test/markdown/MarkdownLifecycle.spec.ts`: quinze cenários adicionais,
  incluindo corridas, retry, falha parcial, fila, descarte, hooks tardios,
  reentrância de abort, instrumentação do registro de ownership e object URLs
  isoladas.
- `test/markdown/MarkdownDocumentController.spec.ts`: descarte entre fetch e
  publicação de HTML, com observação de mutações tardias, e propagação do sinal
  externo depois do carregamento inicial.
- `test/markdown/MarkdownDocumentElement.spec.ts`: carga agendada cancelada e
  desconexão/reconexão imediata.
- `test/browser/markdown-lifecycle.spec.ts`: reconexão durante renderização de
  fence com instrumentação de recursos e cancelamento de carga agendada.
- `test/markdown/MarkdownMilestoneLifecycle.spec.ts` e
  `test/markdown/MathJSLabWorkerTransport.spec.ts`: hooks de cleanup, MathJax
  por documento, cache/abort isolados, promise do host, navigator da fachada e
  races de criação/descarte do Worker.
- Este relatório registra ownership, evidência, validações e pendências.

## Validações

- Baseline Jest antes de alterações: 18 suítes, 112 testes aprovados.
- Cinco testes iniciais reproduziram falhas contra a implementação anterior;
  depois passaram com a correção. Retry com sinal inicial abortado também foi
  demonstrado falhando antes de sua correção.
- Baseline de navegador: nove testes preexistentes de lifecycle/Worker
  aprovados. Na mesma execução, reconexão nova passou e cancelamento de carga
  agendada falhou contra o bundle anterior (10 aprovados, 1 falhou).
- Baseline do checkout recebido para esta continuação: 19 suítes,
  133 testes aprovados e três regressões de lifecycle reproduzidas.
- Jest final desta rodada: 19 suítes, 143 testes aprovados; os 15 testes
  legados também passaram.
- Suíte Markdown legada: 15 testes aprovados.
- Lint: passou sem erros; ficaram um warning preexistente de `console` em
  `src/main.ts` e warnings de imports não usados, removidos nesta rodada.
- Build do bundle standalone `markdown-document`: passou; webpack emitiu avisos
  de tamanho para bundles/extensions grandes.
- Playwright de lifecycle, Worker, APIs públicas e componente: 19/19 passaram.
- Build de produção: passou; webpack emitiu recomendações de tamanho e
  `runtimeChunk` para bundles grandes.
- A suíte complementar de acessibilidade teve três aprovações e três falhas no
  bundle final. A comparação isolada com os fontes de `HEAD` reproduziu as
  mesmas três falhas, descritas nas pendências.
- Uma tentativa de build paralela falhou por falta de memória. A comparação
  isolada havia sido criada sob `test-results`, incluído na análise TypeScript;
  os artefatos foram movidos para `dist`, que é excluído. Validações pesadas
  foram interrompidas e reiniciadas em sequência para validar o fonte final.

## Riscos restantes depois deste incremento

1. **Falhas gráficas internas ainda não injetadas.** O cleanup local cobre
   etapas que o engine não consegue observar, mas falta forçar falhas nas
   dependências Leaflet, 3Dmol, Three e Vega e confirmar contagens de
   `remove`/`dispose` em cada etapa. Um `GLTFLoader.parseAsync()` que rejeite
   antes de devolver a cena pode manter alocações internas não acessíveis ao
   adapter.
2. **Extensões sem interrupção cooperativa completa.** Mermaid/SMILES agora
   verificam abort depois de import/render, e ABC/Verovio protegem a publicação.
   Ainda não é possível interromper importação dinâmica, sanitização ou código
   de terceiros. Descarte aguarda hooks em andamento e pode esperar uma
   extensão/fetch customizada que nunca conclua.
3. **Runtime Worker ao fechar globalmente.** Criações pendentes são aguardadas
   e sessões tardias descartadas. Uma execução customizada já ativa que não
   usa leitura de recurso não pode ser interrompida pela API legada do runtime;
   o Worker real é encerrado pelo transporte quando o cancelamento exige isso.
   Reiniciar Worker compartilhado ainda rejeita outros requests pendentes, que
   podem tentar recuperar sessão na geração seguinte.
4. **Saídas ricas MathJSLab.** A promise da sessão é compartilhada e aguardada;
   falta testar rejeição de `mount`/`dispose` de cada adapter e efeitos durante
   fechamento concorrente. Esses erros são agregados pelo engine, mas extensões
   externas ainda podem não terminar.
5. **Acessibilidade preexistente no Chromium.** A suíte complementar encontrou
    três falhas: outline interceptando click no botão de histórico, três
    colunas em host estreito e ausência de seleção da seção após scroll. As
    três foram reproduzidas também com engine, controller e componente de
    `HEAD`, em bundle de desenvolvimento isolado e com as mesmas dependências.
    Layout/CSS não foi modificado neste incremento. A reprodução está em
    `dist/lifecycle-baseline`, sem alterações nos fontes em trabalho e fora dos
    diretórios de fonte considerados pelo build.

Essas pendências são concretas no código, mas ainda não são todas demonstradas
por testes adversariais. Este incremento mantém o desenho atual e estabelece
evidência para continuar a Etapa 1 com correções localizadas.
