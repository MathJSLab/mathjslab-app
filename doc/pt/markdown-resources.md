# Política e fluxo de recursos

## Fluxos e decisões

| Caminho                            | Controle aplicado                                                                                                                                                                             | Limite conhecido                                                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Links e imagens Markdown           | URLs normalizadas e validadas em `renderHTML`, ainda em fragmento inerte; imagens passam pelo `MarkdownResourceService`, respeitam redirects, tamanho real/MIME e viram object URLs da sessão | `parse()` é API de baixo nível e não valida; quem insere seu resultado bruto assume essa responsabilidade                                        |
| HTML autorizado em `trusted`       | Atributos de URL são verificados; imagens `<img>` e imagens SVG em sessões são mediadas pelo serviço                                                                                          | HTML/CSS ativo preservado pode carregar recursos por CSS e APIs de navegador diretamente; `trusted` não serve para conteúdo não confiável        |
| HTML em `sanitized` e `strict`     | DOMPurify remove elementos ativos, mídia, estilos e handlers; URLs sobreviventes são verificadas antes de inserção                                                                            | Elementos fornecidos por extensões depois da sanitização devem ser tratados por cada extensão                                                    |
| `srcset` de imagens                | Cada candidato é validado; sessões o baixam pelo serviço e substituem por object URL                                                                                                          | A gramática de `srcset` com data URLs não é suportada integralmente; `data:` fica bloqueado nos modos restritos                                  |
| Navegação Markdown                 | `MarkdownResourceService.readText/fetch`, política e abort da revisão                                                                                                                         | Navegação entre origens exige `allowedOrigins` explícito em modos restritos                                                                      |
| Dataset Vega-Lite                  | Dados remotos são lidos por `resources.readText`; JSON/CSV fica embutido no spec                                                                                                              | Outras fontes definidas por extensões customizadas não são interceptadas automaticamente                                                         |
| MathJSLab Worker                   | Requisições de script usam o proxy de recursos do documento, política e signal                                                                                                                | API Worker customizada pode ignorar o proxy se não usar o contexto encaminhado                                                                   |
| Mermaid                            | Nível global `strict`; manifest declara `network`, negada por padrão em modo restrito                                                                                                         | Renderizadores ou plugins customizados adicionados pelo integrador podem gerar efeitos adicionais                                                |
| Graphviz                           | SVG de saída é sanitizado; manifest declara `network`, negada por padrão em modo restrito                                                                                                     | `image`/link externo de diagramas requer concessão de rede e limites do host                                                                     |
| MathJax, Graphviz, ABC e Verovio   | Módulos e dados integrados ao bundle/chunks; SVG gerado não depende de URL fornecida pelo Markdown nos fixtures                                                                               | Extensões customizadas do MathJax e módulos externos não são auditados por este engine                                                           |
| Mapas                              | Capability `network`, negada por padrão em `sanitized`/`strict`; callbacks de camada-base são integração do host                                                                              | Conceder `network` permite à implementação/callback buscar tiles fora do serviço; limitar com CSP e `allowedOrigins`                             |
| glTF / Three.js                    | URLs de `buffer`/imagem passam por resolução e política no `LoadingManager`; capability `network` bloqueada por padrão nos modos restritos                                                    | O loader faz fetch/XHR binário internamente e não passa pelo limite do corpo do serviço; habilitar `network` exige confiar e limitar essa origem |
| Fontes, CSS e módulos de terceiros | CSS inline/autorado é removido nos modos restritos; chunks carregados pelo aplicativo seguem o build                                                                                          | Recursos internos das bibliotecas dependem também de CSP e política do site; não são todos interceptáveis pelo engine                            |

## Regras normativas

1. `trusted` preserva HTML autorado e concede capabilities por padrão. A
   política de URL se aplica aos atributos tratados pelo serviço, mas não
   neutraliza CSS, scripts ou código ativo. O host deve fornecer isolamento
   próprio.
2. `sanitized` usa DOMPurify, remove estilo e mídia HTML, bloqueia `data:` por
   padrão e restringe a rede à origem do documento. `network`, `audio` e
   `webgl` ficam negados; outras capabilities precisam estar declaradas e
   permitidas.
3. `strict` converte HTML cru em texto e começa sem capabilities. A sintaxe
   Markdown permanece ativa; seu HTML resultante passa por sanitização e pela
   política de URLs.
4. `allowedCapabilities` no engine e no contexto são concessões explícitas. Se
   ambos existem, o resultado é a interseção. Conceder uma capability de rede
   não substitui `resourcePolicy`; origens desconhecidas continuam bloqueadas
   nos modos restritos.
5. A política do contexto substitui, campo a campo, a política de recursos do
   engine. Em modo restrito, `sourceUrl.origin` é permitido por padrão; sem
   `sourceUrl`, nenhuma origem de rede é implicitamente confiável.
6. URLs bloqueadas são removidas antes da inserção e geram
   `resource-url-blocked`. Fences cujas capabilities faltam viram texto e geram
   `extension-capability-blocked`.

## Limites de integração

- Medir bytes de glTF carregados pelo Three.js requer trocar seu loader por um
  pipeline próprio de prefetch e object URLs ou manter `network` bloqueada em
  modos restritos. A segunda opção é o comportamento padrão.
- A lista de atributos HTML com carga indireta deve ser reavaliada diante de
  novas tags/recursos admitidos por DOMPurify.
- Uma extensão customizada só é tão restritiva quanto seu manifest e sua
  implementação: declarar capabilities e usar `context.resources` são parte do
  contrato de integração.
- A política do navegador (CSP, sandbox, CORS e isolamento de origem) continua
  necessária para conteúdo trusted e dependências de terceiros.
