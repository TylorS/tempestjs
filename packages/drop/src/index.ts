import { Stream, Source, Sink, Scheduler, Disposable} from '@tempest/core'

export interface DropCurried {
  <T>(): (amount: number, stream: Stream<T>) => Stream<T>
  <T>(amount: number): <T>(stream: Stream<T>) => Stream<T>
  <T>(amount: number, stream: Stream<T>): Stream<T>
}

export const drop: DropCurried = <DropCurried> function (amount: number , stream: Stream<any>):
  ((amount: number, stream: Stream<any>) => Stream<any>) |
  ((stream: Stream<any>) => Stream<any>) |
  Stream<any> {
  switch (arguments.length) {
    case 1: return function (stream: Stream<any>) { return new Stream<any>(new Drop<any>(amount, stream.source)) }
    case 2: return new Stream<any>(new Drop<any>(amount, stream.source))
    default: return drop
  }
}

class Drop<T> implements Source<T> {
  constructor (private amount: number, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return new DropSink<T>(this.amount, sink, this.source, scheduler)
  }
}

class DropSink<T> implements Sink<T>, Disposable<T> {
  private disposable: Disposable<T>
  constructor (private amount: number, private sink: Sink<T>,
               source: Source<T>, scheduler: Scheduler) {
    this.disposable = source.run(this, scheduler)
  }

  event (time: number, value: T) {
    if (--this.amount < 0) {
      this.sink.event(time, value)
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