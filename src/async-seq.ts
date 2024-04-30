import { isAbortable, tryCall } from "./utils";

/**
 * Execute task. Optionally returns a disposer function that cleans up side effects.
 */
export interface AsyncSeqFn {
  ():
    | void
    | Promise<void>
    | (() => unknown | Promise<unknown>)
    | Promise<() => unknown | Promise<unknown>>;
}

export interface AsyncSeqOptions {
  /**
   * Max size of the sequence. Default unlimited.
   */
  window?: number;
  /**
   * New pending tasks are added to the sequence tail. By default they are dropped if the sequence is full.
   * Set this to `true` to drop old pending tasks from sequence head instead.
   */
  dropHead?: boolean;
}

/**
 * Run async functions in sequence.
 */
export class AsyncSeq {
  readonly #window: number;
  readonly #dropHead: boolean;

  readonly #fns: AsyncSeqFn[];
  #pRunning?: Promise<void> | null;
  #disposer?: (() => any | Promise<any>) | null | void;

  public constructor(options?: AsyncSeqOptions) {
    this.#fns = [];
    this.#window = options?.window ?? Infinity;
    this.#dropHead = options?.dropHead ?? false;
  }

  /**
   * Is sequence running.
   */
  public get running(): boolean {
    return !!this.#pRunning;
  }

  /**
   * Size of pending tasks in the sequence.
   */
  public get size(): number {
    return this.#fns.length;
  }

  /**
   * Is sequence full.
   */
  public get full(): boolean {
    return this.size >= this.#window;
  }

  /**
   * Add task executors to the sequence.
   * @param fns Task executors. Optionally returns a disposer function that cleans up side effects.
   * @returns Promise that resolves when all tasks in the sequence are executed.
   */
  public async add(...fns: AsyncSeqFn[]): Promise<void> {
    this.#fns.push(...fns);
    const diff = this.#fns.length - this.#window;
    if (diff > 0) {
      this.#fns.splice(this.#dropHead ? 0 : this.#window, diff);
    }
    await (this.#pRunning ||= this.#run());
  }

  /**
   * Wait for the sequence to finish.
   */
  public async wait(): Promise<void> {
    await this.#pRunning;
  }

  /**
   * Dispose the sequence.
   */
  public async dispose(): Promise<void> {
    this.#fns.length = 0;
    await this.#pRunning;
    if (this.#disposer) {
      await tryCall(this.#disposer);
      this.#disposer = null;
    }
  }

  async #run(): Promise<void> {
    let fn: AsyncSeqFn | undefined;
    while ((fn = this.#fns[0])) {
      if (this.#disposer) {
        tryCall(this.#disposer);
        this.#disposer = null;
      }
      const disposer = await tryCall(fn);
      if (fn === this.#fns[0]) {
        this.#disposer = disposer;
        if (isAbortable(disposer)) {
          disposer.abortable(() => {
            if (this.#disposer === disposer) {
              this.#disposer = null;
            }
          });
        }
        this.#fns.shift();
      } else {
        // stale task
        disposer?.();
      }
    }
    this.#pRunning = null;
  }
}

/**
 * Run async functions in sequence.
 */
export const seq = (options?: AsyncSeqOptions) => new AsyncSeq(options);
