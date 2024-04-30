# @wopjs/async-seq

[![Docs](https://img.shields.io/badge/Docs-read-%23fdf9f5)](https://wopjs.github.io/async-seq)
[![Build Status](https://github.com/wopjs/async-seq/actions/workflows/build.yml/badge.svg)](https://github.com/wopjs/async-seq/actions/workflows/build.yml)
[![Coverage Status](https://img.shields.io/codeclimate/coverage/wopjs/async-seq)](https://codeclimate.com/github/wopjs/async-seq)

[![npm-version](https://img.shields.io/npm/v/@wopjs/async-seq.svg)](https://www.npmjs.com/package/@wopjs/async-seq)
[![minified-size](https://img.shields.io/bundlephobia/minzip/@wopjs/async-seq)](https://bundlephobia.com/package/@wopjs/async-seq)
[![no-dependencies](https://img.shields.io/badge/dependencies-none-success)](https://bundlejs.com/?q=@wopjs/async-seq)
[![tree-shakable](https://img.shields.io/badge/tree-shakable-success)](https://bundlejs.com/?q=@wopjs/async-seq)
[![side-effect-free](https://img.shields.io/badge/side--effect-free-success)](https://bundlejs.com/?q=@wopjs/async-seq)

Run async functions one-by-one in a sequence.

Docs: <https://wopjs.github.io/async-seq/>

## Install

```
npm add @wopjs/async-seq
```

## Examples

```ts
import { seq } from "@wopjs/async-seq";

const s = seq();

// add async functions to the sequence and wait for the sequence to finish
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

// or manually wait for the sequence to finish
await s.wait();

// cancel all tasks
s.dispose();
```

By default the sequence has unlimited size. You can limit the size of the sequence by passing the `window` option.
Together with the `dropHead` option you can control the behavior of the sequence when it reaches its limit.

Simulate debounce:

```ts
const debounce = (task: () => void, ms: number) => {
  const s = seq({ window: 1, dropHead: true });
  return () =>
    s.add(() => {
      const ticket = setTimeout(task, ms);
      return () => clearTimeout(ticket);
    });
};

const debounced = debounce(() => console.log("task"), 100);

for (let i = 0; i < 10; i++) {
  debounced();
}
```

## License

MIT @ [wopjs](https://github.com/wopjs)
