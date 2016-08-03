import { Stream, Source, Sink, Scheduler, Disposable} from '@tempest/core'

export function drop<T> (amount: number, stream: Stream<T>): Stream<T> {
  return new Stream<T>(new Drop<T>(amount, stream.source))
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