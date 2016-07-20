import { Subscribable, Source, Sink, Scheduler } from '../interfaces'

export class FromObservableSource<T> implements Source<T> {
  constructor (private observable: Subscribable<T>) {
  }

  run (sink: Sink<T>, scheduler: Scheduler) {
    const next = (x: T) => sink.event(scheduler.now(), x)
    const error = (e: Error) => sink.error(scheduler.now(), e)
    const complete = (x?: T) => sink.end(scheduler.now(), x)
    const subscription = this.observable.subscribe({ next, error, complete })

    return { dispose: () => subscription.unsubscribe() }
  }
}