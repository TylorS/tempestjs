import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export function flatten<T> (stream: Stream<Stream<T>>) {
  return new Stream<T>(new Flatten<T>(stream.source))
}

const emptyDisposable = { dispose: (): void => { return void 0 } }

export class Flatten<T> implements Source<T> {
  constructor (private source: Source<Stream<T>>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    const flattenSink = new FlattenSink<T>(sink, scheduler)
    const disposable = this.source.run(flattenSink, scheduler)
    return {
      dispose () {
        flattenSink.dispose()
        disposable.dispose()
      }
    }
  }
}

class FlattenSink<T> implements Sink<Stream<T>> {
  private current: Segment<T> = null
  private ended: boolean = false
  constructor (private sink: Sink<T>, private scheduler: Scheduler) {}

  event (time: number, value: Stream<T>) {
    this._disposeCurrent(time)
    this.current = new Segment<T>(time, Infinity, this, this.sink)
    this.current.disposable = value.source.run(this.current, this.scheduler)
  }

  error (time: number, err: Error) {
    this.ended = true
    this.sink.error(time, err)
  }

  end (time: number) {
    this.ended = true
    this._checkEnd(time, void 0)
  }

  dispose () {
    return this._disposeCurrent(0)
  }

  private _disposeCurrent (time: number) {
    if (this.current !== null) {
      return this.current._dispose(time)
    }
  }

  _disposeInner (time: number, inner: Segment<T>) {
    inner._dispose(time)
    if (inner === this.current) {
      this.current = null
    }
  }

  _checkEnd (time: number, value?: T) {
    if (this.ended && this.current === null) {
      this.sink.end(time, value)
    }
  }

  _endInner (time: number, value: T, inner: Segment<T>) {
    this._disposeInner(time, inner)
    this._checkEnd(time, value)
  }

  _errorInner (time: number, err: Error, inner: Segment<T>) {
    this._disposeInner(time, inner)
    this.sink.error(time, err)
  }
}

class Segment<T> implements Sink<T> {
  public disposable: Disposable<T> = emptyDisposable
  constructor (private min: number, private max: number,
               private outer: FlattenSink<T>, private sink: Sink<T>) {}

  event (time: number, value: T) {
    if (time < this.max) {
      this.sink.event(Math.max(time, this.min), value)
    }
  }

  error (time: number, err: Error) {
    this.outer._errorInner(Math.max(time, this.min), err, this)
  }

  end (time: number, value?: T) {
    this.outer._endInner(Math.max(time, this.min), value, this)
  }

  _dispose (time: number) {
    this.max = time
    try {
      this.disposable.dispose()
    } catch (e) {
      this.sink.error(time, e)
    }
  }
}