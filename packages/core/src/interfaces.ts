/**
 * 
 * 
 * @export
 * @interface Subscribable
 * @template T
 */
export interface Subscribable<T> {
  /**
   * 
   * 
   * @type {Source<T>}
   */
  source: Source<T>
  /**
   * 
   * 
   * @param {(Subscriber<T> | ((x: T) => any))} [nextOrObserver]
   * @param {(error: Error) => any} [error]
   * @param {(x?: T) => any} [complete]
   * @returns {Subscription<T>}
   */
  subscribe(nextOrObserver?: Subscriber<T> | ((x: T) => any),
            error?: (error: Error) => any,
            complete?: (x?: T) => any): Subscription<T>
}

/**
 * 
 * 
 * @export
 * @interface Source
 * @template T
 */
export interface Source<T> {
  /**
   * 
   * 
   * @param {Sink<T>} sink
   * @param {Scheduler} scheduler
   * @returns {Disposable<T>}
   */
  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T>
}

/**
 * 
 * 
 * @export
 * @interface Sink
 * @template T
 */
export interface Sink<T> {
  /**
   * 
   * 
   * @param {number} time
   * @param {T} value
   */
  event (time: number, value: T): void
  /**
   * 
   * 
   * @param {number} time
   * @param {T} [value]
   */
  end (time: number, value?: T): void
  /**
   * 
   * 
   * @param {number} time
   * @param {Error} err
   */
  error (time: number, err: Error): void
}

/**
 * 
 * 
 * @export
 * @interface Scheduler
 */
export interface Scheduler {
  /**
   * 
   * 
   * @returns {number}
   */
  now(): number
  /**
   * 
   * 
   * @param {Task} task
   * @returns {ScheduledTask}
   */
  asap(task: Task): ScheduledTask
  /**
   * 
   * 
   * @param {number} delayTime
   * @param {Task} task
   * @returns {ScheduledTask}
   */
  delay(delayTime: number, task: Task): ScheduledTask
  /**
   * 
   * 
   * @param {number} period
   * @param {Task} task
   * @returns {ScheduledTask}
   */
  periodic(period: number, task: Task): ScheduledTask
  /**
   * 
   * 
   * @param {number} delay
   * @param {number} period
   * @param {Task} task
   * @returns {ScheduledTask}
   */
  schedule(delay: number, period: number, task: Task): ScheduledTask
  /**
   * 
   * 
   * @param {ScheduledTask} task
   */
  cancel(task: ScheduledTask): void
  /**
   * 
   * 
   * @param {(task: ScheduledTask) => boolean} predicate
   */
  cancelAll(predicate: (task: ScheduledTask) => boolean): void
}

/**
 * 
 * 
 * @export
 * @interface Timeline
 * @template T
 */
export interface Timeline<T> {
  /**
   * 
   * 
   * @returns {number}
   */
  nextArrival (): number
  /**
   * 
   * 
   * @returns {boolean}
   */
  isEmpty (): boolean
  /**
   * 
   * 
   * @param {T} task
   */
  add (task: T): void
  /**
   * 
   * 
   * @param {T} task
   * @returns {boolean}
   */
  remove (task: T): boolean
  /**
   * 
   * 
   * @param {(task: T) => boolean} f
   */
  removeAll (f: (task: T) => boolean): void
  /**
   * 
   * 
   * @param {number} time
   * @param {(task: T) => any} runTask
   */
  runTasks (time: number, runTask: (task: T) => any): void
}

/**
 * 
 * 
 * @export
 * @interface Timeslot
 * @template T
 */
export interface Timeslot<T> {
  /**
   * 
   * 
   * @type {number}
   */
  time: number
  /**
   * 
   * 
   * @type {T[]}
   */
  events: T[]
}

/**
 * 
 * 
 * @export
 * @interface Timer
 * @template T
 */
export interface Timer<T> {
  /**
   * 
   * 
   * @returns {number}
   */
  now(): number,
  /**
   * 
   * 
   * @param {() => any} fn
   * @param {number} delayTime
   * @returns {(T | number)}
   */
  setTimer(fn: () => any, delayTime: number): T | number
  /**
   * 
   * 
   * @param {T} task
   * @returns {*}
   */
  clearTimer(task: T): any
}

/**
 * 
 * 
 * @export
 * @interface Task
 */
export interface Task {
  /**
   * 
   * 
   * @param {number} time
   */
  run(time: number): void
  /**
   * 
   * 
   * @param {number} time
   * @param {Error} e
   */
  error(time: number, e: Error): void
  /**
   * 
   */
  dispose(): void
}

/**
 * 
 * 
 * @export
 * @interface ScheduledTask
 */
export interface ScheduledTask {
  /**
   * 
   * 
   * @type {Task}
   */
  task: Task
  /**
   * 
   */
  run(): void
  /**
   * 
   * 
   * @param {Error} err
   */
  error(err: Error): void
  /**
   * 
   */
  dispose(): void
}

/**
 * 
 * 
 * @export
 * @interface Disposable
 * @template A
 */
export interface Disposable<A> {
  /**
   * 
   * 
   * @returns {(void | Promise<A>)}
   */
  dispose(): void | Promise<A>
}

/**
 * 
 * 
 * @export
 * @interface Subscriber
 * @template A
 */
export interface Subscriber<A> {
  /**
   * 
   * 
   * @param {A} value
   */
  next(value: A): void;
  /**
   * 
   * 
   * @param {Error} err
   */
  error(err: Error): void;
  /**
   * 
   * 
   * @param {A} [value]
   */
  complete(value?: A): void;
}

/**
 * 
 * 
 * @export
 * @interface Subscription
 * @template A
 */
export interface Subscription<A> {
  /**
   * 
   */
  unsubscribe(): void;
}