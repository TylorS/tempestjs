import { Stream, Source, Sink, Scheduler, Disposable} from '@tempest/core'

export function take<T> (amount: number, stream: Stream<T>): Stream<T> {
  return new Stream<T>(new Take<T>(amount, stream.source))
}

class Take<T> implements Source<T> {
  constructor (private amount: number, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return new TakeSink<T>(this.amount, sink, this.source, scheduler)
  }
}

class TakeSink<T> implements Sink<T>, Disposable<T> {
  private disposable: Disposable<T>
  constructor (private amount: number, private sink: Sink<T>,
               source: Source<T>, scheduler: Scheduler) {
    this.disposable = source.run(this, scheduler)
  }

  event (time: number, value: T) {
    if (--this.amount >= 0) {
      this.sink.event(time, value)
      if (this.amount === 0) {
        this.dispose()
        this.sink.end(time, value)
      }
    }
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, value)
  }

  dispose () {
    return this.disposable.dispose()
  }
}