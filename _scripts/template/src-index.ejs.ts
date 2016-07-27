import { Stream, Source, Sink, Disposable, Scheduler } from '@tempest/core'

export function <%= name %><T> (stream: Stream<T>) {
  return new Stream<T>(new <%= capitalName %><T>(stream.source))
}

export class <%= capitalName %><T> implements Source<T> {
  constructor (private source: Source<T>) {}

  run (sink: Sink<T>, scheduler: Scheduler): Disposable<T> {
    return this.source.run(new <%= capitalName %>Sink<T>(sink), scheduler)
  }
}

class <%= capitalName %>Sink<T> implements Sink<T> {
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