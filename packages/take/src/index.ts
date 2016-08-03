import { Stream, Source, Sink, Scheduler, Disposable} from '@tempest/core'

export interface TakeCurried {
  <T>(): (amount: number, stream: Stream<T>) => Stream<T>
  <T>(amount: number): <T>(stream: Stream<T>) => Stream<T>
  <T>(amount: number, stream: Stream<T>): Stream<T>
}

export const take: TakeCurried = <TakeCurried> function <T>(amount: number, stream: Stream<T>): Stream<T> |
  ((stream: Stream<T>) => Stream<T>) | ((amount: number, stream: Stream<T>) => Stream<T>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return new Stream<T>(new Take<T>(amount, stream.source)) }
    case 2: return new Stream<T>(new Take<T>(amount, stream.source))
    default: return take
  }
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