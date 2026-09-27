# Markdown renderer

## Test 1 - mermaid

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail...
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

## Test 2 - mermaid

```mermaid
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server1]
    B --> D[Server2]
```

## Test 3 - mermaid

```mermaid
graph TD
    A[Client] -->|tcp_123| B
    B(Load Balancer)
    B -->|tcp_456| C[Server1]
    B -->|tcp_456| D[Server2]
```

## Test 4 - smiles

```smiles
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
```

## Test 5 - mathjslab

```mathjslab
x = linspace(0, 2*pi, 100);
plot(x, sin(x));
```
