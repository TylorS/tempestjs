import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export interface EndWhenCurried {
  <T>(): (signal: Stream<any>, stream: Stream<T>) => Stream<T>
  <T>(signal: Stream<any>): <T>(stream: Stream<T>) => Stream<T>
  <T>(signal: Stream<any>, stream: Stream<T>): Stream<T>
}

export const endWhen: EndWhenCurried = <EndWhenCurried> function <T>(signal: Stream<any>, stream: Stream<T>):
  Stream<T> |
  ((stream: Stream<T>) => Stream<T>) |
  ((signal: Stream<any>, stream: Stream<T>) => Stream<T>)
{
  switch (arguments.length) {
    case 1: return function <T> (stream: Stream<T>) { return new Stream<T>(new EndWhen<T>(signal.source, stream.source)) }
    case 2: return new Stream<T>(new EndWhen<T>(signal.source, stream.source))
    default: return endWhen
  }
}

export class EndWhen<T> implements Source<T> {
  constructor (private signal: Source<T>, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    const disposable = this.source.run(sink, scheduler)

    const signalDisposable = this.signal.run({
      event: (t: number, x: T) => {
        sink.end(t, x)
        disposable.dispose()
        signalDisposable.dispose()
      },
      error: (t: number, e: Error) => sink.error(t, e),
      end: Function.prototype as (t: number, x?: T) => any
    }, scheduler)

    return {
      dispose () {
        disposable.dispose()
        signalDisposable.dispose()
      }
    }
  }
}

class EndWhenSink<T> implements Sink<T> {
  constructor (private sink: Sink<T>) {}

  event (time: number, value: T) {
    this.sink.event(time, value)
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, value)
  }
}