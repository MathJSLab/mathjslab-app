# Política de segurança e recursos Markdown

Esta política descreve o contrato da API Markdown do `mathjslab-app` 1.10.2.
Ela separa sanitização do HTML, autorização de capabilities e controle de
requisições. Nenhum modo torna código autorado confiável por si só.

## Modos

| Modo        | HTML autorado                                                        | HTML/SVG/MathML                                                  | URLs e rede                                                                                                                                                              | Fences com capability                                                                               |
| ----------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `trusted`   | Preservado sem sanitização                                           | Sem garantia contra conteúdo ativo                               | `resourcePolicy` continua válida nos caminhos que usam `MarkdownResourceService`; HTML/CSS autorado pode iniciar cargas diretamente                                      | Todas as capabilities são permitidas por padrão                                                     |
| `sanitized` | DOMPurify remove tags perigosas, mídia, handlers, `style` e `srcdoc` | HTML/SVG/MathML é sanitizado; estilos inline não são preservados | `data:` é bloqueado por padrão; a origem do documento é a origem permitida padrão; imagens são carregadas pelo serviço da sessão, limitadas e convertidas em object URLs | `interactive` e `wasm` são permitidas; `audio`, `network` e `webgl` precisam de concessão explícita |
| `strict`    | HTML cru vira texto; a sintaxe Markdown segue ativa                  | O HTML gerado pelo parser é sanitizado como em `sanitized`       | As mesmas restrições de origem e `data:` de `sanitized`                                                                                                                  | Nenhuma capability é permitida por padrão                                                           |

`securityMode` não habilita execução MathJSLab. A extensão continua exigindo
`executionPolicy.mathjslab.enabled`; em `sanitized` e `strict` também exige
`allowInRestrictedMode: true`. Essa autorização é independente de
`allowedCapabilities`.

## Combinação das políticas

`resourcePolicy` pode ser configurada no engine ou no contexto do documento.
Valores definidos no contexto substituem os defaults do engine. A política
efetiva valida protocolo, rede, origem, `data:`, cache e tamanho. Em
`sanitized` e `strict`, a origem do Markdown é permitida por padrão e outras
origens só entram com `allowedOrigins`. Sem `sourceUrl`, não há origem de rede
padrão. Valores explicitamente configurados em `allowedProtocols`,
`allowedOrigins`, `allowNetwork` e `allowDataUrls` prevalecem sobre esses
defaults.

`allowedCapabilities` no engine ou no contexto substitui os defaults do modo e
é uma concessão explícita. Se ambos definem a lista, a concessão efetiva é a
interseção; o contexto não pode ampliar o limite do engine. Uma fence bloqueada
permanece como código de texto e emite o diagnóstico
`extension-capability-blocked`. Extensões sem capabilities declaradas não são
bloqueadas por essa lista, portanto manifests precisam declarar tudo que o
código usa.

## Recursos carregados

- URLs em atributos HTML são validadas antes de o HTML ser devolvido para
  inserção no DOM. URLs proibidas perdem o atributo e emitem
  `resource-url-blocked`.
- Imagens Markdown e HTML de sessões são buscadas pelo serviço da sessão. O
  tamanho é verificado pelo cabeçalho e pelo corpo real; apenas respostas com
  MIME `image/*` são convertidas em object URLs. A sessão as revoga ao
  atualizar a imagem, descartar o documento ou descartar o engine.
- Corpos streamados são interrompidos assim que ultrapassam `maxResourceBytes`,
  mesmo sem `Content-Length`; adapters que só retornam texto/blob são medidos
  depois de o corpo terminar.
- Redirects de rede usam `redirect: "manual"`; cada destino visível é validado
  antes de seguir. Redirects opacos e destinos fora da origem permitida são
  bloqueados. Adapters `fetchResource` precisam respeitar essa opção; destinos
  finais visíveis também são validados como defesa adicional.
- Vega-Lite lê datasets pelo serviço. A execução MathJSLab em Worker encaminha
  leituras pela política do documento.
- Recursos referenciados por glTF são resolvidos pelo serviço de URLs, mas o
  carregador Three.js ainda realiza a leitura binária interna. Tiles de mapas,
  fontes e módulos auxiliares de terceiros também podem ser carregados pela
  própria biblioteca. Em modos restritos, as capabilities `network` são negadas
  por padrão; concedê-las explicitamente transfere ao integrador a
  responsabilidade de restringir origens e validar esses caminhos.
- O modo `trusted` não protege contra HTML/CSS autorado que carregue recursos
  sem passar pelo serviço. Não o use com Markdown não confiável.

## Diagnósticos e limites

Bloqueios de URL e redirects usam `resource-url-blocked`; limites de bytes usam
`resource-size-limit`; falhas HTTP, MIME ou de transporte usam
`resource-load-error`; capabilities negadas usam
`extension-capability-blocked`; erros de renderização usam
`extension-render-error`. Diagnósticos carregam a URL do documento quando ela
está disponível. O parser de baixo nível `parse()` não sanitiza nem valida
URLs; consumidores que inserem seu resultado diretamente no DOM são
responsáveis por aplicar `renderHTML()` ou sanitização equivalente.

O controle de origem não substitui CSP, isolamento de origem, limites de rede
do servidor ou sandbox do navegador. Extensões customizadas só podem ser
contidas se declararem capabilities corretas e usarem `context.resources` para
as operações mediáveis.
