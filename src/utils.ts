export const tryCall = async <T>(fn: () => Promise<T> | T): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
  }
};

interface AbortableDisposable {
  (): any;
  abortable: (onDispose?: () => void) => void;
  dispose: (this: void) => any;
}

/** @see{@wopjs/disposable} */
export const isAbortable = (disposable: any): disposable is AbortableDisposable => disposable && disposable.abortable;
