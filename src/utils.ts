export const tryCall = async <T>(
  fn: () => T | Promise<T>
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
  }
};

interface AbortableDisposable {
  (): any;
  dispose: (this: void) => any;
  abortable: (onDispose?: () => void) => void;
}

/** @see{@wopjs/disposable} */
export const isAbortable = (
  disposable: any
): disposable is AbortableDisposable => disposable && disposable.abortable;
