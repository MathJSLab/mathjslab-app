# Vega-Lite

Gráfico de barras do exemplo oficial Vega-Lite.

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "A simple bar chart with embedded data.",
  "data": {"values": [{"a":"A","b":28},{"a":"B","b":55},{"a":"C","b":43},{"a":"D","b":91}]},
  "mark": "bar",
  "encoding": {
    "x": {"field":"a","type":"nominal","axis":{"labelAngle":0}},
    "y": {"field":"b","type":"quantitative"}
  }
}
```

```vega-lite
{
  "data": {"url": "../resources/values.csv", "format": {"type": "csv"}},
  "mark": "line",
  "encoding": {
    "x": {"field":"x","type":"quantitative"},
    "y": {"field":"y","type":"quantitative"}
  }
}
```
