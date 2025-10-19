# Row- and column-major order

In computing, **row-major** order and **column-major** order are methods for
storing multidimensional arrays in linear storage such as random access memory.

The difference between the methods lies in which elements of an array are
contiguous in memory. In row-major order, consecutive elements of a row are
next to each other, while the same goes for consecutive elements of a column in
column-major order. Although the terms allude to the rows and columns of a
two-dimensional array, i.e., a matrix, the orders can be generalized to
matrices of any dimension, as long as the terms row-major and column-major are
equivalent to lexicographic and collexicographic orders, respectively.

![Row- and column-major order](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Row_and_column_major_order.svg/180px-Row_and_column_major_order.svg.png "Row- and column-major order")

`%summation(m,1,s,(i(m)-1)*productory(n,1,m-1,d(n)))%`

Testing!

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

Test 2

```mermaid
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server1]
    B --> D[Server2]
```

Another Graph

```mermaid
graph TD
    A[Client] -->|tcp_123| B
    B(Load Balancer)
    B -->|tcp_456| C[Server1]
    B -->|tcp_456| D[Server2]
```

## References

- [Wikipedia: Row- and column-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order)
