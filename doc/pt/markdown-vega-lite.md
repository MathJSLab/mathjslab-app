# Vega-Lite em Markdown

O fence `vega-lite` recebe uma especificação JSON Vega-Lite. Dados embutidos
mantêm a nota autocontida.

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"values": [{"grupo":"A","valor":12},{"grupo":"B","valor":20}]},
  "mark": "bar",
  "encoding": {
    "x": {"field":"grupo","type":"nominal"},
    "y": {"field":"valor","type":"quantitative"}
  }
}
```

Uma URL em `data.url` é resolvida relativamente ao documento e passa pelo
serviço de recursos do engine.
