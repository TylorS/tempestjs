import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export function endWhen<T> (signal: Stream<any>, stream: Stream<T>) {
  return new Stream<T>(new EndWhen<T>(signal.source, stream.source))
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