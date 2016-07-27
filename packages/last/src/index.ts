import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export function last<T> (stream: Stream<T>): Stream<T> {
  return new Stream<T>(new Last<T>(stream.source))
}

export class Last<T> implements Source<T> {
  constructor (private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return this.source.run(new LastSink<T>(sink), scheduler)
  }
}

class LastSink<T> implements Sink<T> {
  private has: boolean = false
  private value: T
  constructor (private sink: Sink<T>) {}

  event (time: number, value: T) {
    this.has = true
    this.value = value
  }

  error (time: number, err: Error) {
    this.has = false
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    if (this.has) {
      this.sink.event(time, this.value)
      this.has = false
    }
    this.sink.end(time, value)
  }
}