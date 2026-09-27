# Modelos 3D em Markdown

Three.js renderiza STL ASCII, Wavefront OBJ e glTF JSON. glTF é o formato
preferido para cenas e animações.

```obj
o triangle
v -1 0 0
v 1 0 0
v 0 1 0
f 1 2 3
```

Recursos externos mencionados por glTF são resolvidos relativamente ao arquivo
Markdown. GLB será tratado pelo futuro contrato de carregamento por URL.
