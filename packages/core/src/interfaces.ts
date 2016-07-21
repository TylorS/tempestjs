export interface Subscribable<T> {
  source: Source<T>
  subscribe(nextOrObserver?: Subscriber<T> | ((x: T) => any),
            error?: (error: Error) => any,
            complete?: (x?: T) => any): Subscription<T>
}

export interface Source<T> {
  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T>
}

export interface Sink<T> {
  event (time: number, value: T): void
  end (time: number, value?: T): void
  error (time: number, err: Error): void
}

export interface Scheduler {
  now(): number
  asap(task: Task): ScheduledTask
  delay(delayTime: number, task: Task): ScheduledTask
  periodic(period: number, task: Task): ScheduledTask
  schedule(delay: number, period: number, task: Task): ScheduledTask
  cancel(task: ScheduledTask): void
  cancelAll(predicate: (task: ScheduledTask) => boolean): void
}

export interface Timeline<T> {
  nextArrival (): number
  isEmpty (): boolean
  add (task: T): void
  remove (task: T): boolean
  removeAll (f: (task: T) => boolean): void
  runTasks (time: number, runTask: (task: T) => any): void
}

export interface Timeslot<T> {
  time: number
  events: T[]
}

export interface Timer<T> {
  now(): number,
  setTimer(fn: () => any, delayTime: number): T | number
  clearTimer(task: T): any
}

export interface Task {
  run(time: number): void
  error(time: number, e: Error): void
  dispose(): void
}

export interface ScheduledTask {
  task: Task
  run(): void
  error(err: Error): void
  dispose(): void
}

export interface Disposable<A> {
  dispose(): void | Promise<A>
}

export interface Subscriber<A> {
  next(value: A): void;
  error(err: Error): void;
  complete(value?: A): void;
}

export interface Subscription<A> {
  unsubscribe(): void;
}