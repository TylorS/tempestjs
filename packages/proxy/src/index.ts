
import {Stream, Sink, Scheduler, Source, Disposable, defaultScheduler} from '@tempest/core'

export interface Proxy<T> {
  attach: (stream: Stream<T>) => Stream<T>
  stream: Stream<T>
}

/**
 * Create a proxy stream and a function to attach to a yet to exist stream
 * @example
 * import {proxy} from 'most-proxy'
 * const {attach, stream} = proxy()
 *
 * stream.map(f)
 *
 * attach(otherStream)
 */
export function proxy<T>(): Proxy<T> {
  const source = new ProxySource<T>()
  const stream = new Stream<T>(source)
  function attach(origin: Stream<T>): Stream<T> {
    source.add(origin.source)
    return origin
  }

  return {attach, stream}
}

export class ProxySource<T> implements Source<T>, Sink<T> {
  private sink: Sink<T>
  private source: Source<T>
  private active: boolean
  private disposable: Disposable<T>
  constructor() {
    this.sink = void 0
    this.active = false
    this.source = void 0
    this.disposable = void 0
  }

  run(sink: Sink<T>, scheduler: Scheduler) {
    this.sink = sink
    this.active = true
    if (this.source !== void 0) {
      this.disposable = this.source.run(sink, scheduler)
    }
    return this
  }

  dispose() {
    this.active = false
    this.disposable.dispose()
  }

  add(source: Source<T>) {
    if (this.active) {
      this.source = source
      this.disposable = source.run(this.sink, defaultScheduler)
    } else if (!this.source) {
      this.source = source
      return
    } else {
      throw new Error('Can only attach to one stream')
    }
  }

  event(t: number, x: any) {
    if (this.sink === void 0) {
      return
    }
    this.ensureActive()
    this.sink.event(t, x)
  }

  end(t: number, x?: any) {
    this.propagateAndDisable(this.sink.end, t, x)
  }

  error(t: number, e: Error) {
    this.propagateAndDisable(this.sink.error, t, e)
  }

  propagateAndDisable(method: (t: number, x: any) => void, t: number, x: any) {
    if (this.sink === void 0) {
      return
    }
    this.ensureActive()

    this.active = false
    const sink = this.sink
    this.sink = void 0

    method.call(sink, t, x)
  }

  ensureActive() {
    if (!this.active) {
      throw new Error('stream has already ended')
    }
  }
}