# Digital hardware integration

## registradores-digitais

```wavedrom
{
  "reg": [
    {
      "bits": 1,
      "name": "EN",
      "attr": "RW"
    },
    {
      "bits": 3,
      "name": "MODE"
    },
    {
      "bits": 4,
      "name": "FLAGS"
    }
  ],
  "config": {
    "bits": 8
  }
}
```

## expressoes-logicas

```wavedrom
{
  "assign": [
    [
      "Y",
      [
        "&",
        "A",
        "B"
      ]
    ]
  ]
}
```

## porta-and-netlist

```netlist
{
  "modules": {
    "and_gate": {
      "attributes": {
        "top": 1
      },
      "ports": {
        "A": {
          "direction": "input",
          "bits": [
            2
          ]
        },
        "B": {
          "direction": "input",
          "bits": [
            3
          ]
        },
        "Y": {
          "direction": "output",
          "bits": [
            4
          ]
        }
      },
      "cells": {
        "gate": {
          "type": "$_AND_",
          "parameters": {},
          "attributes": {},
          "port_directions": {
            "A": "input",
            "B": "input",
            "Y": "output"
          },
          "connections": {
            "A": [
              2
            ],
            "B": [
              3
            ],
            "Y": [
              4
            ]
          }
        }
      },
      "netnames": {}
    }
  }
}
```

## vcd-porta-and

```vcd {width=100%}
$timescale 1 ns $end
$scope module tb $end
$var wire 1 ! a $end
$var wire 1 " b $end
$var wire 1 # y $end
$upscope $end
$enddefinitions $end
$dumpvars
0!
0"
0#
$end
#3
1!
#11
1"
1#
#25
0!
0#
#40
```
