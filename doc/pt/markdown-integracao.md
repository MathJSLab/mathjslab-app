# Integrar o engine Markdown

O entry point `markdown-core` não depende do estado de execução do
`mathjslab-app`. Em um projeto que inclua os bundles públicos do engine, um
documento pode usar um preset e o componente sem acessar `appEngine`, comandos
do aplicativo ou estado global:

Os imports npm são definidos pelo mapa `exports` de `mathjslab-markdown/package.json`. Para uso direto no navegador, conserve toda a árvore de bundles e chunks.

```ts
import { createMarkdownEnginePreset } from "mathjslab-markdown";
import { defineMarkdownDocumentElement } from "mathjslab-markdown/component";

defineMarkdownDocumentElement();

const viewer = document.querySelector("markdown-document");
if (!viewer) throw new Error("Elemento markdown-document ausente");

viewer.engine = createMarkdownEnginePreset("safe-remote");
await viewer.load("/docs/intro.md");
```

O host deve disponibilizar o bundle do componente e o documento no mesmo
contexto do navegador. `safe-remote` usa GFM com sanitização e bloqueia URLs de
recursos fora da origem do documento. Se o conteúdo for produzido e controlado
pelo próprio integrador, `trusted-local` é um preset separado:

```ts
const localEngine = createMarkdownEnginePreset("trusted-local", {
    features: ["mermaid", "smiles"],
});
```

Para um host que gerencia diretamente os containers, o engine pode ser usado
sem o Web Component:

```ts
import { createMarkdownEnginePreset } from "mathjslab-markdown";

const engine = createMarkdownEnginePreset("education-basic");
const documentSession = await engine.renderDocument("# Lesson", container, {
    sourceUrl: new URL("/course/lesson.md", location.href),
});

try {
    await documentSession.update("# Lesson\n\nMarkdown content.");
} finally {
    await documentSession.dispose();
    await engine.dispose();
}
```

O preset não transfere a propriedade do engine para cada sessão. Um host que
compartilha o engine entre documentos deve descartar cada sessão ao remover seu
container e descartar o engine quando nenhum documento mais o utilizar. Para
MathJSLab, crie e injete explicitamente um executor pelo entry point
`markdown-mathjslab`; nenhum preset inicia execução de comandos por conta
própria.

## Entry points disponíveis

Cada bundle abaixo pode ser carregado sem importar estado do aplicativo. O
entry point agregado conserva a compatibilidade e registra o componente; os
sub-entry points mantêm responsabilidades separadas.

| Bundle                  | Uso mínimo                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `markdown-document.js`  | `const api = await import("./markdown-document.js"); api.createMarkdownEnginePreset("gfm");`              |
| `core.js`               | `import { MarkdownEngine } from "./core.js"; const engine = new MarkdownEngine();`                        |
| `component.js`          | `import { MarkdownDocumentElement } from "./component.js"; const viewer = new MarkdownDocumentElement();` |
| `component-register.js` | `import "./component-register.js"; // registra <markdown-document>`                                       |
| `extensions.js`         | `import { mermaidExtension, mermaidManifest } from "./extensions.js";`                                    |
| `mathjslab.js`          | `import { mathJSLabExtension } from "./mathjslab.js"; // exige executor injetado`                         |
| `mathjslab-worker.js`   | `import { MathJSLabWorkerRuntime } from "./mathjslab-worker.js"; // adapter de Worker avançado`           |

O catálogo de erros e eventos pode ser consumido pela API core ou agregada;
integrações que preferem callbacks continuam configurando
`MarkdownDocumentContext.onDiagnostic`.
