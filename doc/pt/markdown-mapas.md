# Mapas em Markdown

GeoJSON e TopoJSON são exibidos sobre fundo neutro, sem solicitar tiles
externos. Uma aplicação hospedeira pode fornecer uma camada-base.

```geojson
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Triângulo didático"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -47,
                            -23
                        ],
                        [
                            -46,
                            -23
                        ],
                        [
                            -46.5,
                            -22
                        ],
                        [
                            -47,
                            -23
                        ]
                    ]
                ]
            }
        }
    ]
}
```
