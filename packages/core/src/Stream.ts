import $$observable from 'symbol-observable'

import { Subscribable, Subscriber, Source, Disposable, Subscription, Sink, Scheduler } from './interfaces'

import { Multicast } from './multicast/Multicast'
import { Memory } from './multicast/Memory'
import { defaultScheduler } from './scheduler/defaultScheduler'
import { PropagateTask } from './scheduler/PropagateTask'
import { isArrayLike } from './util/array'

export function getSource<T> (stream: UnicastStream<T> | Stream<T> | MemoryStream<T>) {
  return stream.source instanceof Multicast
    ? (stream.source as Multicast<T>).source
    : stream.source
}

export class UnicastStream<T> implements Subscribable<T> {
  public source: Source<T>
  constructor (source: Source<T>) {
    this.source = source
  }

  static from<T> (input: Subscribable<T> | ArrayLike<T>): UnicastStream<T> {
    if (typeof input[$$observable] === 'function') {
      return new UnicastStream<T>(new FromObservableSource(input as Subscribable<T>))
    } else if (isArrayLike(input)) {
      return new UnicastStream<T>(new FromArraySource(input as T[]))
    } else {
      throw new Error ('UnicastStream can only be made from an Observable or ArrayLike object')
    }
  }

  static of<T> (...items: T[]): UnicastStream<T> {
    return UnicastStream.from<T>(items)
  }

  subscribe (nextOrSubscriber?: (x: T) => any | Subscriber<T>,
             error?: (e: Error) => any,
             complete?: (x?: T) => any): Subscription<T> {
    let _next = Function.prototype as (x: T) => any
    let _error = Function.prototype as (e: Error) => any
    let _complete = Function.prototype as (x?: T) => any

    if (nextOrSubscriber !== null && typeof nextOrSubscriber === 'object') {
      const subscriber = nextOrSubscriber as any as Subscriber<T>
      const { next, error, complete } = subscriber
      if (next && typeof next === 'function') _next = next
      if (error && typeof error === 'function') _error = error
      if (complete && typeof complete === 'function') _complete = complete
    } else if (typeof nextOrSubscriber === 'function') {
      _next = nextOrSubscriber
      if (error && typeof error === 'function') _error = error
      if (complete && typeof complete === 'function') _complete = complete
    }

    return new BasicSubscription<T>(this.source, _next, _error, _complete)
  }

  [$$observable] () {
    return this
  }

  share (): Stream<T> | MemoryStream<T> {
    return new Stream<T>(this.source) as Stream<T>
  }

  remember (): MemoryStream<T> {
    return new MemoryStream<T>(getSource(this))
  }
}

export class Stream<T> extends UnicastStream<T> {
  public source: Multicast<T>
  constructor (source: Source<T>) {
    super(new Multicast<T>(source))
  }

  static from<T> (input: Subscribable<T> | ArrayLike<T>): Stream<T> {
    if (typeof input[$$observable] === 'function') {
      return new Stream<T>(new FromObservableSource(input as Subscribable<T>))
    } else if (isArrayLike(input)) {
      return new Stream<T>(new FromArraySource(input as T[]))
    } else {
      throw new Error ('Stream can only be made from an Observable or ArrayLike object')
    }
  }

  static of<T> (...items: T[]): Stream<T> {
    return Stream.from<T>(items)
  }

  share (): Stream<T> {
    return this as Stream<T>
  }

  unshare (): UnicastStream<T> {
    return new UnicastStream<T>(getSource(this))
  }
}

export class MemoryStream<T> extends UnicastStream<T> {
  public source: Memory<T>
  constructor (source: Source<T>) {
    super(new Memory<T>(source))
  }

  static from<T> (input: Subscribable<T> | ArrayLike<T>): MemoryStream<T> {
    if (typeof input[$$observable] === 'function') {
      return new MemoryStream<T>(new FromObservableSource(input as Subscribable<T>))
    } else if (isArrayLike(input)) {
      return new MemoryStream<T>(new FromArraySource(input as T[]))
    } else {
      throw new Error ('MemoryStream can only be made from an Observable or ArrayLike object')
    }
  }

  static of<T> (...items: T[]): MemoryStream<T> {
    return MemoryStream.from<T>(items)
  }

  share (): MemoryStream<T> {
    return this as MemoryStream<T>
  }

  remember (): MemoryStream<T> {
    return this as MemoryStream<T>
  }
}

export class BasicSubscription<T> implements Subscription<T> {
  private disposable: Disposable<T>
  constructor (private source: Source<T>,
               private _next: (x: T) => any,
               private _error: (e: Error) => any,
               private _complete: (x?: T) => any) {
    this.disposable = source.run({
      event (time: number, x: T) { _next(x) },
      error (time: number, err: Error) { _error(err) },
      end (time: number, x?: T) { _complete(x) }
    }, defaultScheduler)
  }

  unsubscribe (): void {
    this.disposable.dispose()
  }
}

export class FromArraySource<T> implements Source<T> {
  constructor (private array: T[]) {}

  run (sink: Sink<T>, scheduler: Scheduler<any>) {
    const task = scheduler.asap(new PropagateTask<T>(runArrayTask<T>(this.array, scheduler), void 0, sink))
    return { dispose: () => task.dispose() }
  }
}

function runArrayTask<T> (array: T[], scheduler: Scheduler<any>) {
  return function arrayTask (time: number, value: T, sink: Sink<T>) {
    array.forEach((x: T) => sink.event(scheduler.now(), x))
    sink.end(scheduler.now(), void 0)
  }
}

export class FromObservableSource<T> implements Source<T> {
  constructor (private observable: Subscribable<T>) {
  }

  run (sink: Sink<T>, scheduler: Scheduler<any>) {
    const next = (x: T) => sink.event(scheduler.now(), x)
    const error = (e: Error) => sink.error(scheduler.now(), e)
    const complete = (x?: T) => sink.end(scheduler.now(), x)
    const subscription = this.observable.subscribe({ next, error, complete })

    return { dispose: () => subscription.unsubscribe() }
  }
}