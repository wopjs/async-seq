# @wopjs/async-seq

[![Docs](https://img.shields.io/badge/Docs-read-%23fdf9f5)](https://wopjs.github.io/async-seq)
[![Build Status](https://github.com/wopjs/async-seq/actions/workflows/build.yml/badge.svg)](https://github.com/wopjs/async-seq/actions/workflows/build.yml)
[![npm-version](https://img.shields.io/npm/v/@wopjs/async-seq.svg)](https://www.npmjs.com/package/@wopjs/async-seq)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/wopjs/async-seq)](https://coveralls.io/github/wopjs/async-seq)
[![minified-size](https://img.shields.io/bundlephobia/minzip/@wopjs/async-seq)](https://bundlephobia.com/package/@wopjs/async-seq)

Run async functions one-by-one in a sequence.

## Install

```
npm add @wopjs/async-seq
```

## Examples

```ts
import { seq } from "@wopjs/async-seq";

const s = seq();

// add async functions to the sequence and wait for the sequence to finish
await s.schedule(
  () => {
    const ticket = setTimeout(spy, 100);
    return () => clearTimeout(ticket);
  },
  async () => {
    const data = await fetch("https://example.com").then(r => r.json());
    console.log(data);
  },
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
    s.schedule(() => {
      const ticket = setTimeout(task, ms);
      return () => clearTimeout(ticket);
    });
};

const debounced = debounce(() => console.log("task"), 100);

for (let i = 0; i < 10; i++) {
  debounced();
}
```

## Development

### Publish New Version

You can use [npm version](https://docs.npmjs.com/cli/v10/commands/npm-version) to bump version.

```
npm version patch
```

Push the tag to remote and CI will publish the new version to npm.

```
git push --follow-tags
```

### CI Auto Publish

If you want to publish the package in CI, you need to set the `NPM_TOKEN` secrets [in GitHub repository settings](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository). See how to [create a NPM access token](https://docs.npmjs.com/creating-and-viewing-access-tokens).
