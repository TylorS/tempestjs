import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export interface ReplaceErrorCurried {
  <T>(): (f: (err: Error) => Stream<T>, stream: Stream<T>) => Stream<T>
  <T>(f: (err: Error) => Stream<T>): (stream: Stream<T>) => Stream<T>
  <T>(f: (err: Error) => Stream<T>, stream: Stream<T>): Stream<T>
}

export const replaceError: ReplaceErrorCurried = <ReplaceErrorCurried> function <T>(f: (err: Error) => Stream<T>, stream: Stream<T>):
  Stream<T> | ((stream: Stream<T>) => Stream<T>) | ((f: (err: Error) => Stream<T>, stream: Stream<T>) => Stream<T>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return new Stream<T>(new ReplaceError<T>(f, stream.source)) }
    case 2: return new Stream<T>(new ReplaceError<T>(f, stream.source))
    default: return replaceError
  }
}

export class ReplaceError<T> implements Source<T> {
  constructor (private f: (err: Error) => Stream<T>, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return new ReplaceErrorSink<T>(this.f, this.source, sink, scheduler)
  }
}

class ReplaceErrorSink<T> implements Sink<T>, Disposable<T> {
  private disposable: Disposable<T>
  private sink: SafeSink<T>
  constructor (private f: (err: Error) => Stream<T>, source: Source<T>,
               sink: Sink<T>, private scheduler: Scheduler) {
    this.sink = new SafeSink<T>(sink)
    this.disposable = source.run(this, scheduler)
  }

  event (time: number, value: T) {
    try {
      this.sink.event(time, value)
    } catch (e) {
      this.sink.error(time, e)
    }
  }

  error (time: number, err: Error) {
    const nextSink = this.sink.disable()
    tryDispose(this.disposable, this.sink)
    this._startNext(time, err, nextSink)
 }

  end (time: number, value?: T) {
    try {
      this.sink.end(time, value)
    } catch (e) {
      this.sink.error(time, e)
    }
  }

  private _startNext (time: number, err: Error, sink: Sink<T>) {
    try {
      this.disposable = this._continue(this.f, err, sink)
    } catch (e) {
      sink.error(time, e)
    }
  }

  private _continue (f: (e: Error) => Stream<T>, err: Error, sink: Sink<T>) {
    const stream = f(err)
    return stream.source.run(sink, this.scheduler)
  }

  dispose () {
    this.disposable.dispose()
  }
}

class SafeSink<T> implements Sink<T> {
  private active: boolean
  constructor (private sink: Sink<T>) {
    this.active = true
  }

  event (t: number, x: T) {
    if (!this.active) return
    this.sink.event(t, x)
  }

  error (t: number, err: Error) {
    this.disable()
    this.sink.error(t, err)
  }

  end (t: number, x?: T) {
    if (!this.active) return
    this.disable()
    this.sink.end(t, x)
  }

  disable (): Sink<T> {
    this.active = false
    return this.sink
  }
}

function tryDispose<T> (disposable: Disposable<T>, sink: Sink<T>) {
  try {
    disposable.dispose()
  } catch (e) {
    sink.error(Date.now(), e)
  }
}