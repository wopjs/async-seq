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
   * Max size of the sequence.
   */
  window?: number;
  /**
   * Tail is dropped by default if the sequence is full.
   * Set this to true to drop the head instead.
   */
  dropHead?: boolean;
}

/**
 * Run async functions in sequence.
 */
export class AsyncSeq {
  private readonly window_: number;
  private readonly dropHead_: boolean;

  private readonly fns_: AsyncSeqFn[];
  private pRunning_?: Promise<void> | null;
  private disposer_?: (() => any | Promise<any>) | null | void;

  public constructor(options?: AsyncSeqOptions) {
    this.fns_ = [];
    this.window_ = options?.window ?? Infinity;
    this.dropHead_ = options?.dropHead ?? false;
  }

  /**
   * Is sequence running.
   */
  public get running(): boolean {
    return !!this.pRunning_;
  }

  /**
   * Size of pending tasks in the sequence.
   */
  public get size(): number {
    return this.fns_.length;
  }

  /**
   * Is sequence full.
   */
  public get full(): boolean {
    return this.size >= this.window_;
  }

  /**
   * Add task executors to the sequence.
   * @param fns Task executors. Optionally returns a disposer function that cleans up side effects.
   */
  public async add(...fns: AsyncSeqFn[]): Promise<void> {
    this.fns_.push(...fns);
    const diff = this.fns_.length - this.window_;
    if (diff >= 0) {
      this.fns_.splice(this.dropHead_ ? 0 : this.window_, diff);
    }
    if (!this.pRunning_) {
      this.pRunning_ = this.run_();
    }
    await this.pRunning_;
  }

  /**
   * Dispose the sequence.
   */
  public async dispose(): Promise<void> {
    this.fns_.length = 0;
    await this.pRunning_;
    if (this.disposer_) {
      await tryCall(this.disposer_);
    }
  }

  private async run_(): Promise<void> {
    let fn: AsyncSeqFn | undefined;
    while ((fn = this.fns_[0])) {
      if (this.disposer_) {
        await tryCall(this.disposer_);
      }
      const disposer = await tryCall(fn);
      this.disposer_ = disposer;
      if (isAbortable(disposer)) {
        disposer.abortable(() => {
          if (this.disposer_ === disposer) {
            this.disposer_ = null;
          }
        });
      }
      this.fns_.shift();
    }

    this.pRunning_ = null;
  }
}

/**
 * Run async functions in sequence.
 */
export const seq = (options?: AsyncSeqOptions) => new AsyncSeq(options);
