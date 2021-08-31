# TypedDeque

[![Codecov](https://img.shields.io/codecov/c/github/zhangyuannie/typeddeque)](https://codecov.io/gh/zhangyuannie/typeddeque)
[![npm](https://img.shields.io/npm/v/typeddeque)](https://www.npmjs.com/package/typeddeque)
[![GitHub](https://img.shields.io/github/license/zhangyuannie/typeddeque)](https://github.com/zhangyuannie/typeddeque/blob/main/LICENSE)

Variable length
[TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
that is implemented with an array of TypedArray.

- Work in browser, Node.js and Deno
- Support TypeScript out of the box
- No external dependencies
- Ideal to parse chunks of binary data

## Installation

If you are using npm:

```
npm install typeddeque
```

```ts
import { Uint8Deque } from "typeddeque";
const buf = new Uint8Deque();
```

For vanilla HTML in modern browsers:

```html
<script type="module">
  import { Uint8Deque } from "https://cdn.skypack.dev/typeddeque";
  const buf = new Uint8Deque();
</script>
```

With Deno:

```ts
import { Uint8Deque } from "https://deno.land/x/typeddeque/mod.ts";
const buf = new Uint8Deque();
```

## Basic Usage

```ts
import { Uint8Deque } from "typeddeque";

const buf = new Uint8Deque();

buf.push(new Uint8Array([1, 2]));
buf.push(new Buffer([3, 4, 5]));

console.log(buf.slice(1, 3));
// Uint8Array(2) [ 2, 3 ]
```

## API Documentation

Available on
[deno doc](https://doc.deno.land/https/deno.land/x/typeddeque/mod.ts).
