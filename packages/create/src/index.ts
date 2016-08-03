import { Stream, Source, Sink, Disposable, Scheduler, Subscriber } from '@tempest/core'

export type SubscriberFn<T> = (observer: Subscriber<T>) => (() => any) | void

export function create<T> (subscriber: SubscriberFn<T>): Stream<T> {
  return new Stream<T>(new Create<T>(subscriber))
}

export class Create<T> implements Source<T> {
  constructor (private _subscribe: SubscriberFn<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    const subscribe = this._subscribe
    const observer = new SinkObserver<T>(sink, scheduler)
    const dispose = Promise.resolve(observer).then(subscribe)
    return {
      dispose () {
        dispose.then((f: () => any | void ) => {
          if (typeof f === 'function') f()
        })
      }
    }
  }
}

class SinkObserver<T> implements Subscriber<T> {
  constructor (private sink: Sink<T>, private scheduler: Scheduler) {}

  next (value: T) {
    this.sink.event(this.scheduler.now(), value)
  }

  error (err: Error) {
    this.sink.error(this.scheduler.now(), err)
  }

  complete (value?: T) {
    this.sink.end(this.scheduler.now(), value)
  }
}