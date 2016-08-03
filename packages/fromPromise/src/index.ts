import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export function fromPromise<T> (promise: Promise<T>): Stream<T> {
  return new Stream<T>(new FromPromise<T>(promise))
}

export class FromPromise<T> implements Source<T> {
  constructor (private promise: Promise<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    let running: boolean = true
    const promise = this.promise

    promise.then((value: T) => {
      if (!running) return
      sink.event(scheduler.now(), value)
    }).catch((err: Error) => {
      sink.error(scheduler.now(), err)
    }).then(() => {
      sink.end(scheduler.now(), void 0)
    })

    return {
      dispose () {
        running = false
      }
    }
  }
}