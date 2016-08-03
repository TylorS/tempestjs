import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'
import { PropagateTask } from '@tempest/core'

export interface StartWithCurried {
  <T>(): (value: T, stream: Stream<T>) => Stream<T>
  <T>(value: T): <T>(stream: Stream<T>) => Stream<T>
  <T>(value: T, stream: Stream<T>): Stream<T>
}

export const startWith: StartWithCurried = <StartWithCurried> function <T>(value: T, stream: Stream<T>): Stream<T> |
  ((stream: Stream<T>) => Stream<T>) | ((value: T, stream: Stream<T>) => Stream<T>) {
  switch (arguments.length) {
    case 1: return function (stream: Stream<T>) { return new Stream<T>(new StartWith<T>(value, stream.source)) }
    case 2: return new Stream<T>(new StartWith<T>(value, stream.source))
    default: return startWith
  }
}

export class StartWith<T> implements Source<T> {
  constructor (private value: T, private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    scheduler.asap(PropagateTask.event(this.value, sink))
    return this.source.run(new StartWithSink<T>(this.value, sink), scheduler)
  }
}

class StartWithSink<T> implements Sink<T> {
  constructor (private value: T, private sink: Sink<T>) {
  }

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