# Integração HDL no navegador

**Estado atual — 20/10/2026:** o app usa `mathjslab-markdown@0.7.1` publicado
no registro, com instalação/integridade fixadas por `package-lock.json`.
O verificador aceita essa distribuição sem ligação local. São 32 assets HDL,
incluindo os avisos de runtime Icarus. O pacote substituiu o port Icarus antigo,
registra fontes correspondentes e reprodução no escopo documentado, e corrigiu
os traces NVC sem sinais. As restrições de publicação e falhas descritas nos
registros de 18/19 de outubro abaixo são históricas. A validação da versão
publicada e a preparação 1.20.0 estão em `release-1.20.0.md`; isso não é uma
nova reconstrução independente dos compiladores pelo app.

A integração usa `createBrowserHDLExecutor`, com autorização explícita no código
confiável do aplicativo e políticas `hdl`/`hdl-interactive` habilitadas. Markdown
não pode conceder essa autorização; uma política por documento pode negar a
execução. Desenvolvimento e produção usam o mesmo executor. Não há endpoint,
token, configuração de sessionStorage nem seleção por NODE_ENV nesse caminho.

Verilog é compilado e simulado por Icarus WebAssembly e sintetizado por YoWASP,
em module Workers no navegador do visitante, com arquivos em memória. A
hospedagem apenas entrega arquivos. Reinício, descarte e substituição cancelam
os trabalhos e encerram Workers. Pausar permite concluir o passo já enviado;
o histórico só incorpora passos confirmados. Limites: 30 s por trabalho e
quatro sessões lógicas por executor, além dos limites próprios do pacote.

O perfil VHDL-2008 empacotado usa NVC 1.22.0 WebAssembly para simulação e
interatividade por replay; GHDL/YoWASP mantêm a síntese. A antiga proteção de
indisponibilidade foi removida: as extensões originais cuidam de validação,
autorização, agendamento e descarte, em ambos os ambientes. Isso não anuncia
compatibilidade completa da linguagem. Veja a continuação NVC ao fim deste
relatório para a evidência desta distribuição e os limites documentados.

## Histórico: dependência local antes da publicação 0.7.1

### Desenvolvimento conjunto com ligação ao repositório irmão

Para desenvolver os dois projetos, a dependência também pode ser explicitamente
`file:../mathjslab-markdown`. Essa é a configuração de desenvolvimento atual.
Após `npm install`, o verificador exige que a ligação instalada aponte realmente
para esse checkout e que o lockfile registre a ligação; continua verificando os
hashes HDL. Não aceita substituir essa dependência por uma versão do registro.
`mathjslab` continua instalado na versão 2.9.0 do registro.

O helper de assets resolve `netlistsvg` a partir do pacote `mathjslab-markdown`
efetivamente instalado, e resolve ELK a partir desse renderer. Assim, a ligação
local funciona mesmo quando essas dependências estão apenas no `node_modules`
do pacote irmão, sem exigir sua instalação duplicada no app.

Com o dev-server parado, executar `npm run build:prod` no pacote irmão e esperar
o término. Depois executar `npm run build:dev` no app. O pacote exporta arquivos
de `dist/`; editar seus fontes sem reconstruir não atualiza a distribuição
consumida. Reiniciar o dev-server após reconstruir os assets HDL, pois a cópia
dos assets acontece na compilação do app. Não reconstruir a distribuição que
estiver sendo lida por uma rodada de teste de navegador.

Para conferir produção após mudanças: parar o dev-server, executar
`npm run build:prod` no app e `npm run test:hdl:browser`, com `HDL_APP_URL`,
`HDL_APP_DIST` e `HDL_APP_MODE` removidos do ambiente. Essa rodada usa o build
de produção estável em um servidor somente de arquivos.

### Snapshot local para testes de distribuição

A versão 0.6.1 do registro não contém o executor. Para testar um snapshot fixo,
usar em `package.json` a dependência `file:vendor/mathjslab-markdown-0.6.1.tgz`,
snapshot da distribuição modificada
em `../mathjslab-markdown`. `package-lock.json` fixa a integridade do tarball;
`vendor/markdown-local.json` registra SHA-256 e os bloqueios de publicação.
Preservar ambos junto com o tarball permite instalar sem substituir
silenciosamente pelo pacote antigo. Não editar node_modules.

O tarball preservado da primeira integração é histórico e não contém o novo
GHDL. Esta continuação usa a ligação ao pacote irmão, sem atualizar ou publicar
aquele snapshot. Para usar síntese VHDL em um novo snapshot, empacotar a
distribuição atualizada e conferir novamente os hashes após instalar.

Para atualizar deliberadamente o snapshot, primeiro construir e validar o
pacote irmão. Depois, neste repositório:

```console
npm run prepare:markdown:local
npm install --ignore-scripts
npm run verify:hdl:assets
```

Selecionar explicitamente a dependência do tarball antes de executar
`npm install` nesse modo. O script somente empacota a distribuição já construída com `npm pack
--ignore-scripts`; não publica nem reconstrói o pacote irmão. O tarball histórico
tem cerca de 33 MB; o tamanho de um novo snapshot depende da distribuição
empacotada. Essa fixação
reproduz a aquisição/instalação dos bytes, não um build reproduzível a partir
dos fontes dos compiladores.

## Assets e hospedagem estática

`MarkdownRuntimeAssetsPlugin`, usado pelo build do app e pelo build standalone,
copia **toda** a árvore `dist/browser/hdl/` do pacote instalado para `hdl/`.
Preserva subdiretórios (inclusive `ghdl/` e `nvc/`), Worker, loaders, Wasm, bibliotecas
comprimidas, recursos, lock e licenças GPL/Apache/ISC. Os
assets usam `RawSource` e `minimized: true`: o minificador não deve alterar
seus bytes. Isso também funciona no filesystem em memória do dev-server.

```console
npm run build:prod
node script/verify-hdl-assets.mjs dist/hdl
```

`Markdown.ts` resolve `hdl/` relativamente ao public path do bundle; Webpack
usa `publicPath: auto`. Assim `/lab/mathjslab-app.js` carrega
`/lab/hdl/browser-worker.mjs`, sem presumir `/hdl/` nem usar a URL da aula ou
a pasta do idioma como base. O host deve servir `.mjs`/`.js` como JavaScript
e `.wasm` como `application/wasm`, preservando os arquivos originais.

A política CSP precisa permitir os scripts e Workers da própria origem,
`script-src 'self' 'wasm-unsafe-eval'`, `worker-src 'self'` e
`connect-src 'self'`. O shell existente também usa estilos/scripts inline e
outros renderers podem usar blob Workers. O harness de desenvolvimento permite
`unsafe-eval` por compatibilidade com configurações do bundler; isso não
estabelece sua necessidade para HDL. A produção é testada sem essa permissão,
mantendo `wasm-unsafe-eval`. Não foram acrescentados COOP/COEP.

## Validação real

`script/test-hdl-browser.mjs` abre o app completo, usa o comando `markdown(url)`
e opera as extensões registradas pelo app. Não importa um executor alternativo
no contexto do teste. O servidor `test/browser/hdl-static-server.mjs` aceita
somente GET e entrega arquivos do build e fontes das aulas locais. Não possui
rotas HDL nem inicia compiladores nativos. O caminho `/lab/` exercita os URLs
HDL sob subdiretório; o servidor também entrega recursos legados do shell na
raiz. Isso não audita todos os links absolutos preexistentes do site.

```powershell
npm run test:hdl:browser
# Outro navegador instalado:
$env:HDL_BROWSER = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm run test:hdl:browser
```

Para o dev-server real (após gerar os assets usuais do app):

```powershell
npx tsx --require tsconfig-paths/register node_modules/webpack-dev-server/bin/webpack-dev-server --config webpack.hdl-validation.config.ts --mode development
# Em outro terminal:
$env:HDL_APP_MODE = 'development'
$env:HDL_APP_URL = 'http://127.0.0.1:4174'
npm run test:hdl:browser
```

A configuração de validação desliga HMR e serve as aulas locais em `/lessons/`;
a compilação HDL continua exclusivamente no visitante. O runner aceita também
`HDL_APP_DIST` para builds de desenvolvimento isolados. Remover `HDL_APP_URL`
para voltar ao servidor somente de arquivos. Relatórios JSON com versões,
requisições, MIME, erros e casos aprovados e screenshots ficam em `report/`.

A matriz cobre as dez famílias pedidas em pt/en/es: código HDL, AND, contador,
multiplexador, somador, live AND/mux/counter/register e stimuli/checks. Inclui
resultados e exportações reais, entradas manuais, clocks, histórico, checks,
inspeção, Run/Pause/Step/Reset, fonte XOR nova, duração estável sem transições
inventadas, negação da política e descarte em reinício/substituição/navegação.
O runner também sintetiza mux e somador VHDL em pt/en/es, fontes novas com
IEEE.NUMERIC_STD e pacote em dois arquivos, inspeciona netlists/SVG, exporta
JSON/TXT/netlist/SVG, verifica diagnósticos de sintaxe e semântica com arquivo e
linha, negação da política, cancelamento e navegação durante síntese. Testa
layout estreito de 390 px e avanço dos timers da interface durante o trabalho.
A rodada atual também executa simulação e interatividade VHDL nos três
idiomas, gravações estáveis, eventos em limites de passos e tempos até 30 µs.
Os novos relatórios terminam em `-vhdl-simulation.json`, preservando os
relatórios históricos de Verilog e da integração de síntese.

## Pendências para aceitação integral e publicação

- Ampliar cobertura além do perfil VHDL-2008 comprovado; bibliotecas e recursos
  fora dele não estão implicitamente suportados. Testbenches sem sinais podem
  atingir a limitação NVC/FST de limpeza de trace vazio; não se promete VCD
  válido nesse caso. Replay recompila e cresce com o histórico, limitado a
  1.000 intervalos, em vez de manter um kernel permanentemente suspenso.
- Obter e arquivar fontes correspondentes completos do port Icarus/VeriSim,
  patches, receita e versão Emscripten; reconstruir e verificar os assets.
  Também não foram reproduzidos independentemente os builds de GHDL e YoWASP.
  O pacote arquiva receitas e entradas do port GHDL, mas registra
  `reproducibleBuildVerified: false`; os detalhes estão em
  `../mathjslab-markdown/doc/hdl-vhdl-progress.md`.
- Preservar licenças GPL/ISC, hashes e avisos. Não publicar estes assets antes
  de resolver a proveniência/build documentada pelo pacote irmão.
- Firefox, Safari, dispositivos móveis e cotas rígidas de heap continuam fora
  da comprovação. O download dos arquivos é verificado pelo Playwright; caixas
  de diálogo nativas de salvar não são exercitadas.

Nenhum commit, push, publicação de pacote ou deploy faz parte desta entrega.
Os resultados efetivamente executados nesta integração estão registrados abaixo.

## Registro histórico anterior à integração de síntese GHDL — 18/10/2026

Os resultados desta seção pertencem à primeira integração, que ainda bloqueava
todas as operações VHDL. Não comprovam esta continuação nem refletem suas
capacidades atuais. Os resultados novos são registrados em seção separada.

- Chrome instalado **155.0.8059.82**: **36 casos aprovados** no dev-server real
  (build development) e **36 casos aprovados** na distribuição production em
  servidor somente de arquivos. Zero page errors nos dois relatórios.
- As dez famílias em pt/en/es foram abertas pelo comando do app. As 12 cercas
  Verilog batch e 15 interativas executaram de verdade. As fontes simples de
  `codigo-hdl.md` foram verificadas como listagens destacadas, sem controles.
  Fontes novas XOR, buffer de quatro estados e NAND também executaram.
- Chrome development: 812 requisições registradas; production: 801. Todas
  foram GET sem corpo. Em cada rodada houve 84 tentativas de imagens externas
  do README (logos/badges, bloqueadas pela CSP do harness), sem fontes HDL ou
  pedidos de processamento. Nenhum recurso externo não-imagem foi solicitado.
- Os sete URLs Wasm distintos vieram de `/lab/hdl/`, todos com status 200 e
  `application/wasm`. Module Workers funcionaram sem COOP/COEP. Os 17 arquivos
  HDL de development e production conferiram byte a byte com o pacote.
- Build development passou; production passou com três avisos de tamanho e
  performance. 31 testes unitários em nove suítes passaram; checagem de tipos,
  documentação (18 links locais) e lint dos arquivos de implementação alterados
  passaram. A suíte Markdown isolada também passou: 27 testes em oito suítes.
- O script de preparação local foi executado novamente e produziu um tarball
  com a mesma integridade SHA-512 do lockfile. `npm install --ignore-scripts
  --offline` instalou o snapshot local sem buscar uma versão antiga do registro.

As primeiras rodadas do harness falharam por suposições incorretas do teste:
Pausar pode deixar o passo já enviado terminar, e a aula de checks desabilita
Pausar quando chega ao tempo final de 12 ns. Os testes foram corrigidos para
aguardar o Worker em andamento ou verificar a conclusão. As rodadas completas
posteriores de Chrome passaram; os logs iniciais estão preservados em report/.
Essas falhas não foram tratadas como falhas de compilação HDL nem ocultadas.

Relatórios locais: `report/hdl-development-chrome.exe.json` e
`report/hdl-production-chrome.exe.json`, logs dos builds/testes em `report/`.
Edge instalado **155.0.4283.62**: **36 casos aprovados** na produção estática, zero page errors, 788 requisições GET sem corpo, 84 tentativas de imagens externas do README e os mesmos sete URLs Wasm locais com MIME correto. Relatório: report/hdl-production-msedge.exe.json. Edge development, Firefox, Safari e mobile não foram executados nesta integração.

**Limite daquela validação:** nenhum exemplo VHDL tinha sido compilado,
sintetizado ou simulado no navegador. Os bloqueios de fontes/build dos assets
Icarus permaneciam. Não houve alteração no repositório irmão, commit, push,
publicação ou deploy naquela etapa.

## Histórico: integração de síntese VHDL-2008 no app

A configuração passou a delegar somente `vhdl-run` com `operation: "synthesize"`
à extensão HDL real. JSON inválido também chega ao validador original; a
autorização e as políticas continuam sendo do aplicativo. O descarte do fence
original é preservado, inclusive ao trocar síntese ativa por uma operação
indisponível. Nenhum renderer artificial ou serviço foi acrescentado.

A ligação efetiva foi conferida como
`H:/workarea/mathjslab-project/mathjslab-repositories/mathjslab-markdown`;
`mathjslab` instalado continua 2.9.0. O helper netlistsvg/ELK foi preservado.
A distribuição contém 24 arquivos HDL (83.383.046 bytes), incluindo 21 arquivos
fixados no lock de ferramentas e Worker/lock/NOTICE. Os hashes fonte/distribuição
conferiram, e os 24 arquivos do build development conferiram byte a byte.
Inventário e resolução: `report/hdl-vhdl-dependency-assets.json`.

### Rodada executada em desenvolvimento

Chrome **155.0.8059.82**, headless, app completo no dev-server HTTP em 4174:
**49 casos aprovados**, zero page errors. Build development concluído em
34,137 s, seguido da rodada sobre distribuição estável; não houve build do
pacote durante os testes. O dev-server foi encerrado antes do build production.

- Síntese real dos seis casos VHDL mux/somador em pt/en/es; netlists e rótulos
  de portas inspecionados, exportações JSON/TXT/netlist/SVG verificadas.
- Fonte nova com `resize`, `shift_left`, `to_unsigned` e adição de unsigned;
  pacote novo em dois arquivos. Inspeção de células reais e localização de
  fonte na netlist; não são testes de simulação VHDL ou avaliação artificial.
- Diagnósticos reais preservados na interface e JSON exportado:
  `app_syntax.vhd:3` e `app_semantic.vhd:5`.
- Negação da política bloqueou síntese mesmo com uma tentativa de autorização
  no JSON Markdown. Substituição de síntese ativa por simulação indisponível
  e navegação encerraram seus Workers.
- Regressão das dez famílias Verilog em pt/en/es: entradas manuais, clocks,
  replay/histórico, checks, inspeção, exportações, Run/Pause/Step/Reset,
  gravação estável, 0/1/x/z e descarte em reinício/substituição/navegação.
- SVGs cabem na viewport de 390 px, exports continuam visíveis e timers da
  interface avançam durante o trabalho. Isso não é uma garantia de latência
  máxima ou de limite rígido de heap.
- 908 tentativas de requisição registradas, todas GET sem corpo; 84 imagens
  externas do README bloqueadas pela CSP. Nenhum recurso externo não-imagem,
  fonte enviada ou pedido remoto de processamento.
- Oito URLs Wasm, todos em `/lab/hdl/`, incluindo GHDL, com status 200 e MIME
  `application/wasm`; bibliotecas GHDL também locais. Sem COOP/COEP, com
  `crossOriginIsolated: false` nos três idiomas.

Relatório: `report/hdl-development-chrome.exe-vhdl-synthesis.json`.
35 testes unitários em nove suítes, checagem de tipos e lint dos arquivos
alterados passaram. A verificação de documentação conferiu 18 links locais.

As rodadas iniciais do novo harness tiveram duas expectativas corrigidas:
exigir `role="img"` literal em vez do papel acessível do SVG após sanitização,
e presumir que abrir fonte inglesa muda o idioma espanhol selecionado no shell.
Não foram falhas de síntese. Os logs/JSON iniciais foram preservados com os
sufixos `initial-accessibility` e `initial-locale` em `report/`.

O log do dev-middleware contém também um `ERR_STREAM_PREMATURE_CLOSE` ao longo
das rodadas. A causa específica não foi isolada; a rodada completa final passou
sem erro de página. Não se extrapola isso para uma garantia geral de rede.

### Produção somente por arquivos estáticos e resumo final

Após encerrar o dev-server, o build production foi executado em
`report/hdl-vhdl-production`, concluindo em 242,285 s com três avisos existentes
de tamanho/performance. Os assets usuais do shell foram copiados como dados;
o HDL veio integralmente do plugin do build. A distribuição pronta foi servida
por `test/browser/hdl-static-server.mjs`, que só lê arquivos, aceita GET e
rejeita os outros métodos, sem rotas de compilação, simulação ou sessões HDL.

As rodadas foram **sequenciais**, sem build entre Chrome e Edge:

| Ambiente | Navegador efetivamente executado | Casos aprovados | Page errors | Requisições registradas |
| --- | --- | ---: | ---: | ---: |
| Dev-server, development | Chrome 155.0.8059.82 | 49 | 0 | 908 |
| Arquivos estáticos, production | Chrome 155.0.8059.82 | 49 | 0 | 911 |
| Arquivos estáticos, production | Edge 155.0.4283.62 | 49 | 0 | 920 |

Cada rodada completa cobriu os mesmos 49 casos descritos acima. Todas as
requisições foram GET sem corpo; em cada rodada, as únicas 84 tentativas
externas eram imagens/badges do README, bloqueadas pela CSP. Fontes e pedidos
de processamento HDL não foram enviados a serviços externos. Downloads de
Markdown são dados; JS/MJS, Wasm e bibliotecas comprimidas são assets locais,
não delegação de processamento. Os oito Wasm, inclusive GHDL, vieram de
`/lab/hdl/` com `application/wasm`; não houve COOP/COEP nem isolamento de origem.

A conferência final comparou inventário e SHA-256 **dos 24 arquivos** nas três
árvores: distribuição do pacote, build development e build production.
Todos permaneceram idênticos ao inventário inicial, sem arquivos faltantes ou
extras e sem transformação dos bytes, inclusive loaders, Worker, GHDL,
`libraries.tar.gz`, lock e licenças. Não houve compilação ou alteração da
distribuição do pacote irmão durante as rodadas. Evidência:
`report/hdl-vhdl-assets-final.json`.

Relatórios completos desta continuação, preservando os antigos:

- `report/hdl-development-chrome.exe-vhdl-synthesis.json`
- `report/hdl-production-chrome.exe-vhdl-synthesis.json`
- `report/hdl-production-msedge.exe-vhdl-synthesis.json`
- Logs `report/hdl-vhdl-*.log` e screenshots de mux/somador em viewport de
  390 px com sufixo `-vhdl-synthesis-*-narrow.png`.

Comandos usados após `npm run prebuild:dev`, sempre aguardando o build terminar:

```powershell
# Desenvolvimento: compilar, executar o runner, depois encerrar o servidor.
npx tsx --require tsconfig-paths/register node_modules/webpack-dev-server/bin/webpack-dev-server --config webpack.hdl-validation.config.ts --mode development --output-path report/hdl-vhdl-development
# Em outro terminal, após o build concluir:
$env:HDL_APP_MODE = 'development'
$env:HDL_APP_URL = 'http://127.0.0.1:4174'
npm run test:hdl:browser

# Produção: build separado; copiar os assets usuais do shell para esse output.
npx tsx --require tsconfig-paths/register node_modules/webpack/bin/webpack --mode production --output-path report/hdl-vhdl-production
node -e "const fs=require('node:fs');for(const n of ['example','images','help','README.md','LEIAME.md','LEAME.md','manifest.json','robots.txt','sitemap.xml'])if(fs.existsSync('dist/'+n))fs.cpSync('dist/'+n,'report/hdl-vhdl-production/'+n,{recursive:true});"
node script/verify-hdl-assets.mjs report/hdl-vhdl-production/hdl
Remove-Item Env:HDL_APP_URL -ErrorAction SilentlyContinue
$env:HDL_APP_MODE = 'production'
$env:HDL_APP_DIST = 'report/hdl-vhdl-production'
$env:HDL_BROWSER = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm run test:hdl:browser
$env:HDL_BROWSER = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm run test:hdl:browser
```

**Limites daquele snapshot:** somente síntese VHDL-2008 foi liberada e comprovada. Não há
simulação/interatividade VHDL, scheduler de processos/sinais/delta cycles nem
VCD VHDL validado. Inspeção de netlist não é simulação VHDL. Edge development,
Firefox, Safari, mobile e cobertura arbitrária do padrão não foram testados
nesta continuação. Layout de 390 px não equivale a teste de dispositivo móvel.
Continuam pendentes o build reproduzível dos assets e a procedência completa
do port Icarus; a publicação permanece bloqueada. Não houve alteração no pacote
irmão, commit, push, publicação de pacote/assets ou deploy.

## Continuação NVC: simulação e interatividade VHDL no app — 2026-10-19

Esta seção substitui as limitações de indisponibilidade dos snapshots históricos
acima. Os resultados do pacote e as rodadas antigas de 49 casos não foram
usados como comprovação desta integração.

### Implementação e distribuição efetiva

`src/MarkdownHDLConfiguration.ts` passou a registrar diretamente
`hdlExtension(executor)` e `hdlInteractiveExtension(executor)`, conforme a
configuração candidata do pacote. A interceptação de indisponibilidade de
`vhdl-run`/`vhdl-live` foi removida. A autorização confiável
`allowBrowserExecution: true`, as políticas `hdl`/`hdl-interactive`, o limite de
30 s e quatro sessões permanecem. As extensões originais continuam responsáveis
por validação, agendamento, cancelamento e descarte; não foi acrescentada
autorização por Markdown, storage ou ambiente.

A resolução instalada continua sendo a ligação explícita
`file:../mathjslab-markdown`, com realpath
`H:/workarea/mathjslab-project/mathjslab-repositories/mathjslab-markdown`.
`mathjslab` instalado e registrado no lock continua **2.9.0 do registro**.
Nenhuma dependência foi atualizada nesta continuação. O helper netlistsvg/ELK
foi preservado: o renderer é resolvido pelo pacote Markdown e ELK pelo renderer.

O plugin compartilhado já copia recursivamente os novos assets NVC, sem exigir
uma lista manual. São **31 arquivos, 86.442.641 bytes**, incluindo 28 arquivos
fixados no lock, Worker, lock e NOTICE. Os bytes da distribuição foram
comparados aos de `assets/hdl/` do pacote. O verificador do app também passou
a exigir inventários exatamente iguais e usar comparação direta de buffers
entre origem e destino, rejeitando arquivos extras ou faltantes. SHA-256 do
inventário inicial: `report/hdl-nvc-dependency-assets.json`.

### Cobertura da rodada ampliada

O runner opera o app completo, com `markdown("URL local")`, e não substitui o
executor nem os resultados. São 77 verificações por rodada completa:

- Dez famílias nos três idiomas, VHDL e Verilog. `codigo-hdl` continua sendo
  apresentação de fontes com destaque, sem compilação implícita. AND e contador
  executam simulação real; mux e somador executam síntese/netlists reais.
- As cinco aulas interativas de cada idioma e linguagem verificam entradas,
  clocks/reset, saídas esperadas, histórico, checks, inspeção de valores,
  Executar/Pausar/Avançar/Reiniciar e exportações JSON/TXT/VCD/CSV/SVG.
  As netlists também são inspecionadas e exportadas como JSON/netlist/SVG.
- Fontes novas: aritmética e pacote VHDL sintetizados, testbench NVC com
  `NUMERIC_STD`, `shift_left`, asserção e saída 13, buffer VHDL `xz10`, contador
  VHDL novo e fontes Verilog XOR, buffer de quatro estados e NAND.
- Buffer VHDL estável em 7/14 ns, preservando duração sem criar transições;
  contador com bordas e propagação delta exatamente em 10/20/30 ns e depois
  em 10/20/30 µs. Cada passo verifica saída, duração VCD e tamanho do histórico.
- Diagnósticos GHDL de sintaxe/semântica e diagnóstico NVC
  `app_invalid.vhd:3`; políticas negadas, tentativa de autorização no JSON,
  cancelamento por reset/substituição/navegação, inclusive NVC ativo, e
  encerramento dos Workers rastreados. Navegação de página também usa VHDL.
- Layout de netlists a 390 px e avanço de timers durante síntese, além de
  controles operados no navegador. Isso não equivale a teste em aparelho móvel
  nem a garantia de latência máxima.

`HDL_APP_FOCUS=custom` serve somente para depurar fontes e ciclo de vida.
Uma rodada focada de 20 casos passou, mas não é contada como matriz completa.
As rodadas de aceitação removem essa variável e exigem os três idiomas.

### Desenvolvimento efetivamente executado

`npm run prebuild:dev` passou (Eleventy: 1.467 arquivos, 51,29 s). Após encerrar
as rodadas exploratórias e estabilizar o harness, o build development concluiu
em 20,403 s. Não houve recompilação durante a rodada completa aceita.
Chrome **155.0.8059.82**, headless, passou **77 casos**, zero erros de página.
Os 31 arquivos emitidos conferiram byte a byte antes e depois.

Foram registradas **1.432 requisições**, todas GET sem corpo. As únicas 84
tentativas externas eram imagens/badges do README, bloqueadas pela CSP.
Nenhuma fonte HDL ou pedido de processamento saiu para serviço externo.
Os nove Wasm distintos (incluindo NVC e GHDL) vieram de `/lab/hdl/`, status 200,
MIME `application/wasm`; bibliotecas também locais. Sem COOP/COEP e com
`crossOriginIsolated: false`. O dev-server foi encerrado antes de produção.

Evidência: `report/hdl-development-chrome.exe-vhdl-simulation.json`,
`report/hdl-nvc-development-chrome.log` e
`report/hdl-nvc-development-build-final.log`.

### Limitação de trace vazio reproduzida e observações

Esta fonte nova, com `operation: "simulate"`, `standard: "08"`, top `app_empty`
e `stopTimeNs: 3`, reproduz a limitação documentada no pacote:

```vhdl
entity app_empty is end;
architecture test of app_empty is begin
  process begin wait for 1 ns; report "empty app trace"; wait; end process;
end;
```

O resultado real é `status: "error"`, sem VCD substituto. O log contém
`fstReaderOpen failed for temporary FST file` e `NVC exited with code 1` após
a nota emitida em 1 ns. O JSON exportado completo está no caso
`known NVC signal-free/empty-trace limitation...` de cada relatório. Essa
verificação aprovada comprova que a falha é exposta, não suporte a traces vazios.
Há também uma melhoria de diagnóstico para o pacote: nesse resultado
malsucedido, a nota de `app_empty.vhd` é exportada como severidade `error`,
enquanto o fatal FST aparece no log. Preservar a severidade original e atribuir
o fatal separadamente deve ser tratado no mathjslab-markdown.

NVC emite `unsupported syscall: __syscall_getrusage` também em execuções
bem-sucedidas. Isso foi preservado no log; não foi confundido com page error.
O dev-middleware registrou `ERR_STREAM_PREMATURE_CLOSE` durante as rodadas com
cancelamentos/navegação; sua causa exata não foi isolada. A rodada completa
aceita passou sem erro de página. Logs YoWASP ainda exibem escapes ANSI na
interface; a inspeção visual estreita os mostrou, sem impedir netlists/exports.

Dois testes novos inicialmente procuravam o sinal de barramento apenas como
`.y`, ignorando sua faixa no VCD NVC. O harness foi corrigido para aceitar
`.y[4:0]`/`.y[3:0]` e a matriz inteira foi repetida. Evidências iniciais foram
preservadas em `report/hdl-nvc-development-initial-vcd-range.*` e
`report/hdl-nvc-development-focused-initial-buffer.json`. Uma primeira rodada
exploratória foi interrompida após uma recompilação de formatação; não é
contada como aceitação.

### Perfil suportado e publicação

Somente VHDL-2008 (`08`) e as bibliotecas empacotadas std.08, ieee.08
(`STD_LOGIC_1164`, `NUMERIC_STD`) e suporte nvc.08 documentados pelo pacote.
Interatividade: portas superiores nomeadas `std_logic`/`std_logic_vector`,
1–64 bits, sem generics, inout, forcing hierárquico ou bibliotecas externas.
Replay recompila fontes reais e reaplica intervalos confirmados; o custo cresce
com o histórico, limitado a 1.000 intervalos. Pause deixa concluir o passo
ativo; reset/dispose cancela e descarta histórico. NVC mantém nove estados
internos e reduz U/X/W/- para x, H para 1, L para 0, Z para z no VCD digital.

Não há promessa de compatibilidade completa da linguagem. Firefox, Safari,
Edge development e dispositivos móveis não foram executados nesta integração.
A viewport estreita de desktop não substitui teste móvel. O limite de heap
NVC de 512 MiB não limita toda a memória JS/processo; GC controla a recuperação
física após término do Worker. O shell ainda possui URLs legadas da raiz,
servidas também pelo harness; `/lab/` comprova URLs HDL, não uma auditoria de
todos os links do site sob subdiretório.

Publicação continua bloqueada pela reprodução bit a bit dos builds (inclusive
normalização dos caminhos/metadados no NVC) e pela procedência incompleta do
port Icarus. A receita NVC reconstruída no pacote não produziu Wasm/bibliotecas
idênticos; não foi reconstruída nesta integração. Nenhum arquivo do pacote
irmão foi alterado e não houve commit, push, publicação ou deploy.

### Produção estática executada e resultado final desta continuação

Depois de encerrar o dev-server, o build production em
`report/hdl-nvc-production` concluiu em **236,960 s**, com três avisos de
tamanho/performance. Os assets usuais do shell foram copiados como dados,
usando o mesmo procedimento do histórico; os assets HDL vieram do plugin.
Chrome e Edge rodaram sequencialmente sobre essa mesma distribuição pronta,
sem recompilação ou mudança dos arquivos entre as rodadas. O servidor
`test/browser/hdl-static-server.mjs` só entrega arquivos e rejeita métodos
diferentes de GET; nenhum backend HDL foi iniciado ou utilizado.

| Ambiente | Navegador real, headless | Casos aprovados | Page errors | Requisições |
| --- | --- | ---: | ---: | ---: |
| Dev-server development | Chrome 155.0.8059.82 | 77 | 0 | 1.432 |
| Arquivos estáticos production | Chrome 155.0.8059.82 | 77 | 0 | 1.452 |
| Arquivos estáticos production | Edge 155.0.4283.62 | 77 | 0 | 1.433 |

**231 verificações integradas aprovadas**, incluindo os testes negativos
intencionais, nas três rodadas completas. Todas as **4.317 requisições** eram
GET sem corpo. Em cada rodada, as únicas 84 tentativas externas eram imagens
do README bloqueadas pela CSP, não fontes nem pedidos de processamento HDL.
JS/MJS, Wasm e bibliotecas são downloads de código/dados locais; não há
delegação de compilação, síntese ou simulação. Os nove Wasm distintos de cada
rodada vieram de `/lab/hdl/`, status 200, `application/wasm`. Não houve
COOP/COEP ou isolamento de origem. A CSP production não inclui `unsafe-eval`;
mantém `wasm-unsafe-eval` e as permissões preexistentes do shell.

Relatórios novos, sem sobrescrever os de síntese:

- `report/hdl-development-chrome.exe-vhdl-simulation.json`
- `report/hdl-production-chrome.exe-vhdl-simulation.json`
- `report/hdl-production-msedge.exe-vhdl-simulation.json`
- Logs `report/hdl-nvc-development-chrome.log`,
  `report/hdl-nvc-production-chrome.log`, `report/hdl-nvc-production-msedge.log`
  e `report/hdl-nvc-production-build.log`.

Uma inspeção adicional sequencial em Chrome production operou o contador
**VHDL** em viewport 390 × 844: controles em português cabem na largura,
reset liberado, dois passos até 20 ns, saída `0001`, ausência de alertas e
timers do thread principal avançando. Descartar o documento deixou zero
Workers HDL rastreados. O screenshot do bloco foi inspecionado visualmente:
`report/hdl-nvc-production-chrome-vhdl-counter-390.png`; evidência estruturada
em `report/hdl-nvc-production-responsive.json`. Essa verificação complementar
não foi somada aos 231 casos da matriz nem tratada como teste de celular.

A comparação final confirmou o inventário exato e os bytes dos **31 arquivos**
nas distribuições development e production, e os hashes de todas as três
árvores continuaram iguais ao snapshot inicial do pacote:
`report/hdl-nvc-assets-final.json`. O pacote irmão não foi compilado nem
alterado enquanto seus arquivos eram consumidos.

Passaram também **31 testes unitários em oito suítes** de compatibilidade
Markdown, incluindo os seis testes da configuração HDL (também executados
isoladamente), checagem TypeScript e lint dos arquivos de implementação e
scripts alterados. Relatórios: `report/hdl-nvc-unit-final.log`,
`report/hdl-nvc-config-unit.log`, `report/hdl-nvc-types.log` e
`report/hdl-nvc-lint-final.log`. Os testes Node/JSDOM não substituem as três
rodadas reais acima. A verificação de documentação fica em
`report/hdl-nvc-docs.log`.

Para repetir sobre o pacote local já construído, sem nenhum navegador rodando
durante os builds:

```powershell
npm run prebuild:dev
# Aguardar a compilação; executar o runner em outro terminal e depois parar o servidor.
npx tsx --require tsconfig-paths/register node_modules/webpack-dev-server/bin/webpack-dev-server --config webpack.hdl-validation.config.ts --mode development --output-path report/hdl-nvc-development
$env:HDL_APP_MODE = 'development'
$env:HDL_APP_URL = 'http://127.0.0.1:4174'
Remove-Item Env:HDL_APP_FOCUS -ErrorAction SilentlyContinue
npm run test:hdl:browser

# Com o dev-server encerrado, construir produção e aguardar o término.
npx tsx --require tsconfig-paths/register node_modules/webpack/bin/webpack --mode production --output-path report/hdl-nvc-production
node -e "const fs=require('node:fs');for(const n of ['example','images','help','README.md','LEIAME.md','LEAME.md','manifest.json','robots.txt','sitemap.xml'])if(fs.existsSync('dist/'+n))fs.cpSync('dist/'+n,'report/hdl-nvc-production/'+n,{recursive:true});"
node script/verify-hdl-assets.mjs report/hdl-nvc-production/hdl
Remove-Item Env:HDL_APP_URL,Env:HDL_APP_FOCUS -ErrorAction SilentlyContinue
$env:HDL_APP_MODE = 'production'
$env:HDL_APP_DIST = 'report/hdl-nvc-production'
$env:HDL_BROWSER = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm run test:hdl:browser
# Aguardar Chrome terminar antes de iniciar Edge.
$env:HDL_BROWSER = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm run test:hdl:browser
```

## Pré-publicação 1.20.1 com mathjslab-markdown 0.7.2

A dependência instalada e travada é a distribuição 0.7.2 do registro; mathjslab
permanece em 2.9.0. O build completo do componente, Worker de testes e app passou.
Os 32 assets HDL são idênticos byte a byte nos dois destinos de produção.

Produção exclusivamente estática: 77 casos passaram em Chrome 155.0.8059.85 e
77 em Edge 155.0.4283.62, sem erros de página. A rodada cobre as dez famílias
em pt/en/es, fontes novas, síntese/simulação, replay, controles, exportações e
descarte. Verificações novas confirmam os rótulos localizados, esquema antes dos
logs, detalhes recolhidos e expansíveis e TXT/JSON sem ESC. Foram registradas
2.933 requisições GET sem corpo; 168 tentativas externas eram imagens do README,
bloqueadas pela CSP de teste. Não houve delegação de processamento HDL.

Esta rodada não repete desenvolvimento nem reconstrói os compiladores. Consulte
release-1.20.1.md para evidências e limites. A compatibilidade permanece restrita
ao perfil de linguagem, bibliotecas e replay documentados pelo pacote.


## Pré-publicação 1.21.0 com mathjslab-markdown 0.8.0

Em 2026-10-23, a distribuição 0.8.0 do registro passou no build do componente,
Worker de testes e app. Os 32 assets HDL são idênticos byte a byte nos dois
destinos de produção. mathjslab permanece em 2.9.0.

Produção estática: 77 casos passaram no Chrome 155.0.8059.85 e 77 no Edge
155.0.4283.62, sem erros de página, cobrindo as dez famílias em pt/en/es,
fontes novas, síntese, simulação, replay, exportações e descarte. As 2895
requisições registradas foram GETs sem corpo; 168 tentativas externas eram
imagens do README, bloqueadas pela CSP de teste. Não houve envio de fontes
HDL para processamento externo. Wasm local com MIME correto, sob /lab/,
sem COOP/COEP.

A suíte geral passou 79 testes, com três opt-in ignorados; inclui três novos
casos de referências de seção localizadas e navegação no app. Esta rodada não
repete desenvolvimento nem reconstrói os compiladores. Veja release-1.21.0.md
para evidências, escopo e limites.


## Pré-publicação 1.21.1 com mathjslab-markdown 0.8.1

A distribuição do registro foi verificada e os 32 assets são idênticos byte a
byte nos dois destinos de produção. Chrome 155.0.8059.85 passou 77 casos HDL
em produção estática, cobrindo as dez famílias em pt/en/es, fontes novas,
síntese/simulação, interatividade, exportações e descarte. As 1439 requisições
registradas foram GETs sem corpo; 84 tentativas externas eram imagens do
README, sem processamento remoto. Não foram repetidas nesta versão as matrizes
HDL de Edge ou desenvolvimento.

Os nove testes de referências de seção passaram em Chromium/Firefox/WebKit,
mas a matriz geral teve três falhas 3Dmol no WebKit do Windows, independentes
do HDL. O candidato permanece com essa pendência de compatibilidade. Consulte
release-1.21.1.md para resultados, diagnóstico e limites.

## Pré-publicação 1.21.1 com mathjslab-markdown 0.8.2

A dependência do registro 0.8.2 substitui o candidato 0.8.1. Os 32 assets HDL
foram verificados byte a byte nos dois destinos de produção; a licença do novo
runtime molecular também é distribuída sem alteração. MathJSLab permanece 2.9.0.

Chrome 155.0.8059.86 e Edge 155.0.4283.62 passaram 77 casos HDL cada, em produção
estática sob /lab/, com zero erros de página. A cobertura inclui as dez famílias
em pt/en/es, VHDL e Verilog, síntese/simulação, netlists, controles, replay,
fontes novas, numeric_std, diagnósticos, exportações e descarte de Workers.
As 2.878 requisições registradas foram GETs sem corpo; 168 tentativas externas
eram imagens do README bloqueadas pela CSP de teste. Não houve processamento
HDL externo. As 803 respostas Wasm tinham status 200 e MIME application/wasm,
sem COOP/COEP.

A matriz geral de 246 casos passou 234, ignorou 11 por opt-in/capacidade e falhou
uma vez na inicialização do módulo de teste WebKit (limite de cinco segundos).
Após ajustar somente essa espera para 30 segundos, toda a suíte de ciclo de
vida passou nos três motores: 20 aprovações e uma exclusão WebGL já existente.
As auditorias e o caso molecular que falhavam em 0.8.1 passaram nesta versão.
A matriz completa não foi repetida após o ajuste; os resultados são separados
no relatório. Esta rodada não repete desenvolvimento nem reconstrói compiladores.
Permanecem o perfil HDL e os limites de traces vazios documentados pelo pacote.
Consulte [o relatório atual](release-1.21.1-0.8.2.md) para evidências, escopo,
auditoria de dependências e limitações. Nenhum commit ou publicação foi feito.
