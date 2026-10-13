# Integração local da execução retomável

Esta frente usa `mathjslab: file:../mathjslab`, sem publicar os projetos. O
Worker de produção em `src/markdown/extensions/mathjslab/mathjslab.worker.ts`
instancia `InProcessMathJSLabRuntime` e `RuntimeWorkerServer`. O adaptador de
Markdown usa `RemoteMathJSLabRuntime`; cada sessão possui um Dedicated Worker.
O aplicativo não implementa outro avaliador ou backend numérico.

A validação encontrou dois defeitos de distribuição no núcleo: cópias distintas
das classes nos entry points de core/runtime e envio de `AbortSignal` no
protocolo do Worker. Ambos possuem testes de regressão no mathjslab. Os bundles
de runtime compartilham agora `mathjslab/core`; o servidor remove o sinal na
fronteira de mensagens. O shim de clonagem foi removido do app. O Worker
público mantém imports relativos ao core de sua plataforma, e a fábrica de
navegador usa esse artefato público. Imports nativos do runtime na página usam
um import map para `mathjslab/core`; bundlers resolvem o subpath normalmente.

## Comportamento

O núcleo retém controle de fluxo, chamadas ordinárias e anônimas, argumentos,
múltiplas saídas simples e destinos nativos migrados durante `pause` e `load`.
O app mantém a política de recursos do documento e materializa descrições de
plots na thread principal. As funções externas compartilhadas e a amostragem de
`plot2d` usam o intérprete da operação ativa, também no prompt síncrono.
Escopos temporários, precisão da amostragem e captura são restaurados em
`finally`, inclusive quando a expressão externa falha.

A captura de plots é instalada somente durante cada passo síncrono do runtime.
Uma espera não deve manter intérprete ou captura ativos. A fixture inclui uma
sonda exclusiva de teste, sem alterar o protocolo público, que observa esses
contextos dentro do Worker real enquanto o host aguarda.

Leituras recebem o sinal por efeito fornecido pelo runtime remoto, preservando
a URL base, serviço e política de recursos. Delays cancelados limpam o timer e
o listener. Cancelamento, timeout e descarte abortam efeitos pendentes e
ignoram respostas tardias. Um serviço do host que ignora o sinal pode continuar
seu próprio trabalho, mas não pode retomar o Worker encerrado.

Uma falha normal de host entra no ponto suspenso, permitindo `catch` e
`unwind_protect_cleanup`; efeitos anteriores permanecem no workspace. No
runtime remoto, cancelamento e timeout encerram o Worker e a próxima operação
recria um workspace limpo. Descarte é idempotente e rejeita operações futuras.
Descartar uma sessão não altera as demais. Não há rollback ou persistência de
continuações após encerramento do Worker.

O adaptador conserva a saída MathML final, mensagens de scripts carregados e
plots, seguindo o contrato anterior. Texto comum e valores codificados do
runtime não são materializados pelo adaptador de Markdown. Não se promete uma
saída MathML para cada instrução interna nem saída parcial em execuções que
terminam em erro ou cancelamento.

## Verificação reproduzível

A preparação 1.14.0 usa as dependências públicas `mathjslab ^2.9.0` e
`mathjslab-markdown ^0.2.0`. Os checks devem executar com os pacotes instalados
em `node_modules`, incluindo seus bundles e declarações, sem exigir junctions
para os repositórios irmãos.

`node script/verify-local-mathjslab.mjs` é uma ferramenta opcional para a fase
de desenvolvimento com referência `file:`. Nesse modo, compara caminhos,
exports, declarações, hashes e registros de build com as fontes locais. Não se
aplica à instalação pelas versões públicas acima. A verificação funcional
continua sendo feita pelos testes de fonte e navegador.

Checks do aplicativo:

- `npx tsc --project tsconfig.build.json --noEmit`;
- `npm run lint`;
- `npm run test:markdown:all`;
- `npm run build:markdown-component` e `npm run build:markdown-test-worker`;
- `npm run build`;
- `npm run test:browser:all`, usando os bundles acima.

A suíte `mathjslab-resumable-worker.spec.ts` executa o Worker de produção com
uma sonda de observação adicional. Verifica ordem e quantidade dos efeitos,
argumentos sem repetição, chamadas e loops, múltiplas saídas, descritores
encadeados e campos dinâmicos, workspace, configurações numéricas, plots,
dispatch normal, falhas de host, cancelamento, timeout, descarte e recuperação.
`markdown-mathjslab-worker.spec.ts` verifica integração com o componente,
carregamento relativo, política de recursos e timeout em loop infinito.
`MathJSLabExternalFunctions.spec.ts` usa o intérprete real para verificar a
execução síncrona das funções externas e a limpeza após erros.
`mathjslab-runtime-distribution.spec.ts` também exercita a fábrica pública do
núcleo, com Worker padrão e URL explícita, sem o adaptador do aplicativo. O
renderer mínimo da fixture verifica as descrições e a materialização dos plots;
essas asserções não validam a renderização completa do Plotly.
`mathjslab-sync-prompt.spec.ts` verifica o prompt da aplicação de produção e a
renderização real de Plotly após uma falha de função externa.

No núcleo, preservar a matriz de fonte/integração, distribuição, tipos,
documentação, ciclos e os onze bundles descritos em
`../mathjslab/doc/resumable-execution.md`. Resultados anteriores não substituem
um check necessário após alterações no núcleo.

## Fronteiras e publicação conjunta

O subconjunto não inclui frames de classes/scripts, destinos indexados de
múltiplas saídas, forwarding indireto bruto, expressões de validação, contagem
de workers SPMD, destinos sintéticos de laços ou `load` dentro de funções de
usuário. Operações numéricas longas permanecem indivisíveis. As expressões de
amostragem e das funções externas continuam síncronas; a correção de
propriedade do intérprete não amplia esse subconjunto. Consultar os quatro
documentos arquiteturais do núcleo para o contrato exato. O transporte público
legado em `workerTransport.ts` e o handler legado em
`applicationWorkerRuntime.ts` continuam separados do caminho de produção acima;
seus testes não comprovam execução retomável.

Antes de preparar a publicação conjunta:

1. Fixar e documentar o subconjunto suportado e suas limitações.
2. Passar os checks dos dois projetos e os Dedicated Workers reais nos
   navegadores suportados, com os artefatos finais do núcleo.
3. Resolver regressões observadas e confirmar que o app mantém seus fluxos
   síncronos e públicos.
4. Substituir a referência local pela versão planejada somente em um incremento
   de preparação autorizado; verificar o conteúdo dos pacotes e a instalação
   dos artefatos finais, sem depender da junction local.
5. Atualizar as notas de versão e a matriz de evidências. A conclusão deste
   incremento não significa que toda a arquitetura foi migrada.

Nenhum comando de publicação integra esta validação.

## Literais, receivers e gráficos

Elementos de matrizes e células e receivers retornados por chamadas usam a
máquina retomável do núcleo, preservando a ordem de avaliação e os valores já
calculados. Os contratos e as fronteiras restantes estão em
`mathjslab/doc/resumable-execution.md`.

O núcleo prepara as saídas de gráficos sem depender de DOM ou Plotly. O
aplicativo fornece o destino da saída e a renderização Plotly; sessões Markdown
usam destinos próprios para manter o isolamento.
