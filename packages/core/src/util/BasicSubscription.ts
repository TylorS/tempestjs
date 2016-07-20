import { Subscription, Disposable, Source, Sink } from '../interfaces'
import { defaultScheduler } from '../scheduler/defaultScheduler'

export class BasicSubscription<T> implements Subscription<T> {
  private disposable: Disposable<T>
  constructor (private source: Source<T>, private sink: Sink<T>) {
    this.disposable = source.run(sink, defaultScheduler)
  }

  static create<T> (source: Source<T>, sink: Sink<T>) {
    return new BasicSubscription<T>(source, sink)
  }

  unsubscribe (): void {
    this.disposable.dispose()
  }
}