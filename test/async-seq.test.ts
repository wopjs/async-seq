import { abortable } from "@wopjs/disposable";
import { it, expect, vi } from "vitest";
import { seq } from "../src/async-seq";

it("should run tasks in sequence", async () => {
  const s = seq();
  const disposers = Array(10)
    .fill(0)
    .map(() => vi.fn());
  const spies = disposers.map(disposer => vi.fn(async () => disposer));

  const p = s.add(...spies);
  expect(s.size).toBe(spies.length);
  expect(s.full).toBe(false);
  expect(s.running).toBe(true);

  await p;
  expect(s.size).toBe(0);
  expect(s.full).toBe(false);
  expect(s.running).toBe(false);

  for (const spy of spies) {
    expect(spy).toBeCalledTimes(1);
  }
  for (const [i, disposer] of disposers.entries()) {
    expect(disposer).toBeCalledTimes(i === disposers.length - 1 ? 0 : 1);
  }
  await s.dispose();
  for (const disposer of disposers) {
    expect(disposer).toBeCalledTimes(1);
  }
});

it("should drop item from the tail if the sequence is full", async () => {
  const window = 3;
  const s = seq({ window });
  const disposers = Array(10)
    .fill(0)
    .map(() => vi.fn());
  const spies = disposers.map(disposer => vi.fn(async () => disposer));

  const p = s.add(...spies);
  expect(s.size).toBe(window);
  expect(s.full).toBe(true);
  expect(s.running).toBe(true);

  await p;
  expect(s.size).toBe(0);
  expect(s.full).toBe(false);
  expect(s.running).toBe(false);

  for (const [i, spy] of spies.entries()) {
    expect(spy).toBeCalledTimes(i < window ? 1 : 0);
  }
  for (const [i, disposer] of disposers.entries()) {
    expect(disposer).toBeCalledTimes(i < window - 1 ? 1 : 0);
  }
  await s.dispose();
  for (const [i, disposer] of disposers.entries()) {
    expect(disposer).toBeCalledTimes(i < window ? 1 : 0);
  }
});

it("should wait for the sequence to finish", async () => {
  const s = seq();
  const spy = vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  s.add(spy);
  expect(s.running).toBe(true);
  await s.wait();
  expect(s.running).toBe(false);
  expect(spy).toBeCalledTimes(1);
  await s.dispose();
  expect(spy).toBeCalledTimes(1);
});

it("should drop item from the head if the sequence is full", async () => {
  const window = 3;
  const s = seq({ window, dropHead: true });
  const disposers = Array(10)
    .fill(0)
    .map(() => vi.fn());
  const spies = disposers.map(disposer => vi.fn(async () => disposer));
  await s.add(...spies);
  for (const [i, spy] of spies.entries()) {
    expect(spy).toBeCalledTimes(i >= spies.length - window ? 1 : 0);
  }
  for (const [i, disposer] of disposers.entries()) {
    expect(disposer).toBeCalledTimes(
      i >= spies.length - window && i < spies.length - 1 ? 1 : 0
    );
  }
  await s.dispose();
  for (const [i, disposer] of disposers.entries()) {
    expect(disposer).toBeCalledTimes(i >= spies.length - window ? 1 : 0);
  }
});

it("should catch error in tasks", async () => {
  const spy = vi
    .spyOn(globalThis.console, "error")
    .mockImplementation(() => void 0);
  const error = new Error();

  const s = seq();
  await s.add(() => {
    throw error;
  });

  expect(globalThis.console.error).toBeCalledTimes(1);
  expect(globalThis.console.error).toBeCalledWith(error);

  spy.mockRestore();
});

it("should simulate debounce", async () => {
  const s = seq({ window: 1, dropHead: true });
  const spy = vi.fn();
  for (let i = 0; i < 10; i++) {
    await s.add(() => {
      const ticket = setTimeout(spy, 100);
      return () => clearTimeout(ticket);
    });
  }
  expect(spy).toBeCalledTimes(0);
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(spy).toBeCalledTimes(1);
  await s.dispose();
  expect(spy).toBeCalledTimes(1);
});

it("should work with abortable", async () => {
  const s = seq();
  const spy = vi.fn();
  const disposer = abortable(spy);
  s.add(() => abortable(spy));

  expect(spy).toHaveBeenCalledTimes(0);

  disposer();

  expect(spy).toHaveBeenCalledTimes(1);

  s.dispose();

  expect(spy).toHaveBeenCalledTimes(1);
});
