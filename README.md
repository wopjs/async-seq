# @wopjs/async-seq

[![Docs](https://img.shields.io/badge/Docs-read-%23fdf9f5)](https://wopjs.github.io/async-seq)
[![Build Status](https://github.com/wopjs/async-seq/actions/workflows/build.yml/badge.svg)](https://github.com/wopjs/async-seq/actions/workflows/build.yml)
[![Coverage Status](https://img.shields.io/codeclimate/coverage/wopjs/async-seq)](https://codeclimate.com/github/wopjs/async-seq)

[![npm-version](https://img.shields.io/npm/v/@wopjs/async-seq.svg)](https://www.npmjs.com/package/@wopjs/async-seq)
[![minified-size](https://img.shields.io/bundlephobia/minzip/@wopjs/async-seq)](https://bundlephobia.com/package/@wopjs/async-seq)
[![no-dependencies](https://img.shields.io/badge/dependencies-none-success)](https://bundlejs.com/?q=@wopjs/async-seq)
[![tree-shakable](https://img.shields.io/badge/tree-shakable-success)](https://bundlejs.com/?q=@wopjs/async-seq)
[![side-effect-free](https://img.shields.io/badge/side--effect-free-success)](https://bundlejs.com/?q=@wopjs/async-seq)

Run async functions in sequence.

## Install

```
npm add @wopjs/async-seq
```

## Examples

```ts
import { seq } from "@wopjs/async-seq";

const s = seq();
await s.add(
  () => {
    const ticket = setTimeout(spy, 100);
    return () => clearTimeout(ticket);
  },
  async () => {
    const data = await fetch("https://example.com").then(r => r.json());
    console.log(data);
  }
);

s.dispose();
```

Simulate debounce:

```ts
const task = () => console.log("task");

const s = seq({ window: 1, dropHead: true });
for (let i = 0; i < 10; i++) {
  await s.add(() => {
    const ticket = setTimeout(task, 100);
    return () => clearTimeout(ticket);
  });
}
```

## License

MIT @ [wopjs](https://github.com/wopjs)
