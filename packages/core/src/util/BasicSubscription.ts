import { Subscription, Disposable, Source, Sink } from '../interfaces'
import { defaultScheduler } from '../scheduler/defaultScheduler'

/**
 * 
 * 
 * @export
 * @class BasicSubscription
 * @implements {Subscription<T>}
 * @template T
 */
export class BasicSubscription<T> implements Subscription<T> {
  private disposable: Disposable<T>
  /**
   * Creates an instance of BasicSubscription.
   * 
   * @param {Source<T>} source
   * @param {Sink<T>} sink
   */
  constructor (private source: Source<T>, private sink: Sink<T>) {
    this.disposable = source.run(sink, defaultScheduler)
  }

  /**
   * 
   * 
   * @static
   * @template T
   * @param {Source<T>} source
   * @param {Sink<T>} sink
   * @returns
   */
  static create<T> (source: Source<T>, sink: Sink<T>) {
    return new BasicSubscription<T>(source, sink)
  }

  /**
   * 
   */
  unsubscribe (): void {
    this.disposable.dispose()
  }
}