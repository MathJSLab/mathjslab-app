Com o critério que você escolheu, o objetivo fica bem definido:
**compatibilidade de sintaxe, significado e recursos dos arquivos Markdown de
repositórios do GitHub**, com aparência própria e navegação dentro do
componente.

A principal conclusão é que **GFM sozinho não representa tudo que o GitHub
renderiza**.

### Como o GitHub renderiza Markdown

O processo público descrito pelo projeto `github/markup` tem várias etapas:
seleção do conversor, conversão para HTML, sanitização, realce de código e
filtros adicionais para recursos como âncoras e imagens. Portanto, instalar um
parser Markdown não reproduz todo o comportamento da plataforma.
[Pipeline do GitHub](https://github.com/github/markup)

| Recurso                               | GitHub                                          | Consequência para nosso engine                                     |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Markdown básico                       | Base CommonMark e extensões GFM                 | Testar conformidade com a especificação                            |
| Tabelas, tarefas, tachado e autolinks | Extensões GFM                                   | Parte do núcleo compatível                                         |
| Matemática                            | Sintaxe LaTeX renderizada com MathJax           | MathJax passa a integrar o perfil GitHub                           |
| Diagramas Mermaid                     | Fence `mermaid`                                 | Manter suporte e controlar versões                                 |
| Realce de código                      | Linguist seleciona linguagens e gramáticas      | Highlight.js pode ser nosso adaptador, com diferenças documentadas |
| Notas de rodapé e alertas             | Recursos adicionais da plataforma               | Implementar além do GFM formal                                     |
| Mapas e modelos                       | Fences `geojson`, `topojson` e `stl`            | Entram no objetivo completo de compatibilidade                     |
| Links e imagens relativos             | Resolvidos no contexto do arquivo e repositório | Precisamos de um resolvedor específico                             |

A [especificação GFM](https://github.github.com/gfm/) define o núcleo. Já
[alertas e notas de rodapé](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
pertencem ao comportamento adicional documentado pelo GitHub.

### Matemática, Mermaid e realce

**Sim, GitHub aceita matemática em LaTeX**, mas isso não significa compilar
documentos LaTeX completos. Ele utiliza MathJax para expressões, com:

- `$...$` para matemática inline;
- a variante inline com dólar e crase;
- `$$...$$` para matemática em bloco;
- blocos cercados por crases com linguagem `math`.

Isso corrige minha recomendação anterior de adiar `$...$`: **para
compatibilidade GitHub, precisamos implementá-lo**, incluindo as regras de
escapes e interação com Markdown. O fence `math` deve significar LaTeX/MathJax,
não MathJSLab.
[Matemática no GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)

**Sim, GitHub usa Mermaid.** Entretanto, a versão importa: ter Mermaid
instalado não garante aceitar exatamente os mesmos diagramas que GitHub. A
própria documentação recomenda consultar a versão usando um diagrama `info`.
Ela também documenta GeoJSON, TopoJSON e STL.
[Diagramas no GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)

**GitHub oferece syntax highlighting, mas sua documentação aponta Linguist**,
responsável pela detecção e seleção de gramáticas. Podemos continuar com
Highlight.js porque você não exige aparência idêntica, mas devemos testar
identificadores de linguagem, aliases e fallback; não presumir equivalência de
todas as gramáticas.
[Realce de código](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)

### Como isso muda nossa arquitetura

Proponho três camadas explícitas:

**1. Núcleo GFM**

Parser, estrutura do documento, tabelas, listas, códigos, escapes e HTML
permitido. O Marked atual pode continuar como candidato, mas sua configuração
`gfm` não deve ser tratada como certificado de compatibilidade: precisamos
executar casos da especificação e registrar divergências antes de decidir
substituí-lo.

**2. Perfil de arquivos GitHub**

Acrescenta matemática, Mermaid, alertas, notas de rodapé, âncoras, emojis,
recursos visuais e resolução de caminhos de repositório.

Há uma diferença importante em relação à proposta anterior:

- `figures/a.svg` é relativo ao arquivo atual;
- `/figures/a.svg` é relativo à **raiz do repositório**;
- a resolução precisa preservar o contexto da revisão ou branch.

Assim, uma URL de download não basta para representar todo o contexto de
navegação. Precisaremos distinguir **origem do documento, raiz do repositório e
URL usada para obter seu conteúdo**.
[Regras de links relativos](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

Não devemos copiar indiscriminadamente comportamentos de issues e comentários:
por exemplo, referências automáticas como `#123` não são criadas da mesma forma
em arquivos de repositório.
[Referências automáticas](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls)

**3. Extensões MathJSLab**

Entram por sintaxes próprias, sem redefinir as do GitHub:

- expressões convertidas em MathML;
- gráficos derivados de expressões MathJSLab;
- gráficos Plotly declarativos;
- eventual execução de exemplos, tratada separadamente da simples renderização.

Precisaremos de dois perfis: **`github`** e **`github+mathjslab`**. Isso
importa porque as sintaxes MathJSLab <code>%expressão%</code>,
``%`expressão`%`` e o bloco entre linhas <code>%%</code> são extensões do nosso
engine. Essa transformação deve ficar restrita ao perfil estendido.

### Estratégia recomendada

O próximo passo deve ser uma **matriz de compatibilidade verificável**, antes
de ampliar o componente:

1. Catalogar recursos GFM e recursos adicionais dos arquivos GitHub.
2. Criar documentos de referência para cada recurso e suas combinações.
3. Medir o comportamento do engine atual contra esses casos.
4. Implementar o perfil GitHub e o container navegável.
5. Acrescentar extensões MathJSLab sem alterar a interpretação do perfil
   básico.

“Compatibilidade total” deve ser uma meta demonstrada por testes e uma
referência versionada, não uma propriedade presumida do parser. A navegação
interna será uma diferença intencional de apresentação; a interpretação do
documento continuará seguindo o perfil escolhido.
