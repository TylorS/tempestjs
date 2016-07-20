import { Stream, Source, Sink, Scheduler, Disposable, getSource } from '@tempest/core'

export function map<T, R> (f: (t: T) => R, stream: Stream<T>): Stream<R>{
  return new Stream<R>(new Map<T, R>(f, getSource(stream)))
}

export class Map<T, R> implements Source<R> {
  public f: (t: T) => R
  public source: Source<T>
  constructor (f: (t: T) => R, source: Source<T>) {
    this.f = f
    this.source = source
  }

  run (sink: Sink<R>, scheduler: Scheduler<any>) {
    return this.source.run(new MapSink<T, R>(this.f, sink), scheduler) as any as Disposable<R>
 }
}

class MapSink<T, R> implements Sink<T> {
  private f: (t: T) => R
  private sink: Sink<R>
  constructor (f: (t: T) => R, sink: Sink<R>) {
    this.f = f
    this.sink = sink
  }

  event (time: number, value: T) {
    const f = this.f
    this.sink.event(time, f(value))
  }

  error (time: number, err: Error) {
    this.sink.error(time, err)
  }

  end (time: number, value?: T) {
    this.sink.end(time, value as any as R)
  }
}